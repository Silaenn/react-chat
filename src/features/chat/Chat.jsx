import { useEffect, useRef, useState, lazy, Suspense } from "react";
import "./Chat.css";

const EmojiPicker = lazy(() => import("emoji-picker-react"));
import {
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { useUserStore } from "../../lib/userStore";
import { getAvatar } from "../../lib/avatar";
import Info from "@mui/icons-material/Info";
import EmojiEmotions from "@mui/icons-material/EmojiEmotions";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { toast } from "react-toastify";

const Chat = () => {
  const [chat, setChat] = useState();
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);
  const centerRef = useRef(null);
  const inputRef = useRef(null);

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, chatStatus, requestedBy, toggleDetail, setShowList } =
    useChatStore();
  const { currentUser } = useUserStore();

  const getMsgTime = (ts) =>
    ts?.toMillis ? ts.toMillis() : new Date(ts).getTime();

  const formatTime = (ts) => {
    const d = ts?.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canModify = (createdAt) => {
    const elapsed = Date.now() - getMsgTime(createdAt);
    return elapsed < 15 * 60 * 1000;
  };

  const formatLastSeen = (ts) => {
    if (!ts) return;
    const diff = Date.now() - getMsgTime(ts);
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
    return ts?.toDate
      ? ts.toDate().toLocaleDateString("en-US")
      : new Date(ts).toLocaleDateString("en-US");
  };

  useEffect(() => {
    if (!chat?.messages || !chatId) return;

    const unreadOthers = chat.messages.filter(
      (m) => m.senderId !== currentUser.id && !m.readAt
    );
    if (unreadOthers.length === 0) return;

    const markAsRead = async () => {
      try {
        const chatRef = doc(db, "chats", chatId);
        const chatSnap = await getDoc(chatRef);
        const messages = chatSnap.data().messages.map((m) => {
          if (m.senderId !== currentUser.id && !m.readAt) {
            return { ...m, readAt: new Date() };
          }
          return m;
        });
        await updateDoc(chatRef, { messages });
      } catch (error) {
        toast.error("Failed to mark message as read");
      }
    };

    markAsRead();
  }, [chat?.messages, chatId, currentUser.id]);

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpenEmoji(false);
  };

  const handleSend = async () => {
    if (text === "") return;

    if (inputRef.current) {
      inputRef.current.style.height = "auto";
    }

    if (editingMessage) {
      await handleEdit();
      return;
    }

    const msgText = text;
    setText("");

    try {
      const isBlocked = isCurrentUserBlocked || isReceiverBlocked;
      const isPendingChat = chatStatus === "pending" && requestedBy === currentUser.id;
      const message = {
        id: crypto.randomUUID(),
        senderId: currentUser.id,
        text: msgText,
        createdAt: new Date(),
        readAt: null,
        ...(isBlocked && { blocked: true }),
        ...(isPendingChat && { pending: true }),
      };

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(message),
      });

      const notifIds = isBlocked ? [currentUser.id] : [currentUser.id, user.id];

      for (const id of notifIds) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);

        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );

          if (chatIndex !== -1) {
            if (!isBlocked || id === currentUser.id) {
              userChatsData.chats[chatIndex].lastMessage = msgText;
            }
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            if (id !== currentUser.id && isPendingChat) {
              userChatsData.chats[chatIndex].status = "pending";
              userChatsData.chats[chatIndex].requestedBy = currentUser.id;
            }

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          } else if (id !== currentUser.id && isPendingChat) {
            userChatsData.chats.push({
              chatId,
              receiverId: currentUser.id,
              lastMessage: msgText,
              updatedAt: Date.now(),
              isSeen: false,
              status: "pending",
              requestedBy: currentUser.id,
            });
            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }
    } catch (error) {
      toast.error("Failed to send message.");
    }
  };

  const handleEdit = async () => {
    const msgText = text;
    const msgId = editingMessage?.id;
    setText("");
    setEditingMessage(null);

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      const messages = [...chatSnap.data().messages];
      const idx = messages.findIndex((m) => m.id === msgId);

      if (idx !== -1 && canModify(messages[idx].createdAt)) {
        messages[idx] = {
          ...messages[idx],
          text: msgText,
          edited: true,
          editedAt: new Date(),
        };
        await updateDoc(chatRef, { messages });
      }
    } catch (error) {
      toast.error("Failed to edit message");
    }
  };

  const handleDeleteForEveryone = async (messageId) => {
    if (!window.confirm("Delete for everyone?")) return;

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      const messages = chatSnap.data().messages.map((m) => {
        if (m.id === messageId) {
          return { ...m, deleted: true, text: "", edited: false };
        }
        return m;
      });
      await updateDoc(chatRef, { messages });

      const sorted = [...messages].sort(
        (a, b) => getMsgTime(b.createdAt) - getMsgTime(a.createdAt)
      );
      let newLastMsg = "";
      for (const msg of sorted) {
        if ((msg.deletedFor || []).includes(currentUser.id)) continue;
        if (msg.id === messageId) {
          newLastMsg = "This message was deleted";
          break;
        }
        if (!msg.deleted) {
          newLastMsg = msg.text;
          break;
        }
      }

      const userIDs = [currentUser.id, user.id];
      for (const id of userIDs) {
        const userChatsRef = doc(db, "userchats", id);
        const userChatsSnapshot = await getDoc(userChatsRef);
        if (userChatsSnapshot.exists()) {
          const userChatsData = userChatsSnapshot.data();
          const chatIndex = userChatsData.chats.findIndex(
            (c) => c.chatId === chatId
          );
          if (chatIndex !== -1) {
            userChatsData.chats[chatIndex].lastMessage = newLastMsg;
            userChatsData.chats[chatIndex].updatedAt = Date.now();
            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }
    } catch (error) {
      toast.error("Failed to delete message");
    }

    setOpenMenuId(null);
  };

  const handleDeleteForMe = async (messageId) => {
    if (!window.confirm("Delete for me?")) return;

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      const messages = chatSnap.data().messages.map((m) => {
        if (m.id === messageId) {
          return {
            ...m,
            deletedFor: [...(m.deletedFor || []), currentUser.id],
          };
        }
        return m;
      });
      await updateDoc(chatRef, { messages });

      const sorted = [...messages]
        .filter(
          (m) =>
            m.id !== messageId &&
            !(m.deletedFor || []).includes(currentUser.id)
        )
        .sort((a, b) => getMsgTime(b.createdAt) - getMsgTime(a.createdAt));

      const lastVisible = sorted[0];
      let newLastMsg = "";
      if (lastVisible) {
        newLastMsg = lastVisible.deleted
          ? "This message was deleted"
          : lastVisible.text;
      }

      const userChatsRef = doc(db, "userchats", currentUser.id);
      const userChatsSnapshot = await getDoc(userChatsRef);
      if (userChatsSnapshot.exists()) {
        const userChatsData = userChatsSnapshot.data();
        const chatIndex = userChatsData.chats.findIndex(
          (c) => c.chatId === chatId
        );
        if (chatIndex !== -1) {
          userChatsData.chats[chatIndex].lastMessage = newLastMsg;
          userChatsData.chats[chatIndex].updatedAt = Date.now();
          await updateDoc(userChatsRef, {
            chats: userChatsData.chats,
          });
        }
      }
    } catch (error) {
      toast.error("Failed to delete message");
    }

    setOpenMenuId(null);
  };

  const startEdit = (msg) => {
    setEditingMessage({ id: msg.id, text: msg.text });
    setText(msg.text);
    setOpenMenuId(null);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setText("");
  };

  const endRef = useRef(null);
  const emojiRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages?.length]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  useEffect(() => {
    if (!user?.id) return;
    const unSub = onSnapshot(doc(db, "users", user.id), (res) => {
      const data = res.data();
      setIsOnline(data?.online ?? false);
      setLastSeen(data?.lastSeen ?? null);
    });
    return () => unSub();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (openEmoji && emojiRef.current && !emojiRef.current.contains(e.target)) {
        setOpenEmoji(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openEmoji]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape" && editingMessage) {
      cancelEdit();
    }
  };

  const shouldDropUp = (index) => {
    if (!centerRef.current) return false;
    const items = centerRef.current.querySelectorAll('.message');
    const el = items[index];
    if (!el) return false;
    const containerBottom = centerRef.current.getBoundingClientRect().bottom;
    const elBottom = el.getBoundingClientRect().bottom;
    // Jika jarak dari bottom element ke bottom container < 120px, drop up
    return (containerBottom - elBottom) < 80;
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  const avatar = user ? getAvatar(user.username) : null;

  const isPending = chatStatus === "pending";
  const isPendingForMe = isPending && requestedBy !== currentUser?.id;
  const isSenderPending = isPending && requestedBy === currentUser?.id;
  const isEditing = !!editingMessage;

  if (!chat) {
    return (
      <div className="chat">
        <div className="top">
          <div className="top-left" />
          <div className="top-center">
            <div className="skeleton-avatar" />
            <div className="texts">
              <div className="skeleton-text skeleton-name" />
              <div className="skeleton-text skeleton-status" />
            </div>
          </div>
        </div>
        <div className="center">
          <div className="loading-chat">
            <div className="loading-spinner" />
            <span>Loading messages...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="chat">
      <div className="top">
        <div className="top-left">
          <button className="back-btn" onClick={() => setShowList(true)}>
            <ArrowBack />
          </button>
        </div>
        <div className="top-center">
          {avatar && (
            <div className="avatar-letter" style={{ background: avatar.color }}>
              {avatar.letter}
            </div>
          )}
          <div className="texts">
            <span>{user?.username}</span>
              <p className={`status-text ${isCurrentUserBlocked ? "offline" : isOnline ? "online" : "offline"}`}>
                <span className={`status-dot ${isCurrentUserBlocked ? "offline" : isOnline ? "online" : "offline"}`} />
                {isCurrentUserBlocked
                  ? "Offline"
                  : isPendingForMe
                    ? "Wants to chat"
                    : isSenderPending
                      ? "Waiting for response..."
                      : isOnline
                        ? "Online"
                        : lastSeen
                          ? `Last seen ${formatLastSeen(lastSeen)}`
                          : "Offline"}
              </p>
          </div>
        </div>
        <div className="top-right">
          <Info className="chat-icon" onClick={toggleDetail} />
        </div>
      </div>
      {isPendingForMe ? (
        <div className="pending-banner">
          <p>This user wants to chat with you. Accept the request to start messaging.</p>
        </div>
      ) : (
        <>
          <div className="center" ref={centerRef} onClick={() => setOpenMenuId(null)}>
            {chat?.messages?.length > 0 ? (
              chat.messages
                .filter(
                  (m) => !(m.deletedFor || []).includes(currentUser?.id)
                )
                .filter(
                  (m) => !(m.blocked && m.senderId !== currentUser?.id)
                )
                .filter(
                  (m) => !(m.pending && m.senderId !== currentUser?.id)
                )
                .map((message, index) => {
                const isOwn = message.senderId === currentUser?.id;
                return (
                  <div
                    className={`message ${isOwn ? "own" : ""} ${openMenuId === message.id ? "menu-open" : ""} ${shouldDropUp(index) ? "menu-up" : ""}`}
                    key={message.id || message.createdAt}
                    style={{ '--i': index }}
                  >
                    <div className="texts">
                      <p className={`message-text ${message.deleted ? "deleted" : ""}`}>
                        {message.deleted ? "This message was deleted" : message.text}
                        {!message.deleted && message.edited && (
                          <span className="edited-label"> (edited)</span>
                        )}
                      </p>
                      <div className="msg-meta">
                        <span className="msg-time">
                          {formatTime(message.createdAt)}
                        </span>
                        {isOwn && (
                          <span
                            className={`msg-status ${message.readAt ? "read" : "sent"}`}
                          >
                            {message.readAt ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                    {isOwn && message.id && !message.deletedFor?.includes(currentUser.id) && (
                      <div
                        className="message-menu"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          className="menu-trigger"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuId(
                              openMenuId === message.id ? null : message.id
                            );
                          }}
                        >
                          ⋯
                        </button>
                        {openMenuId === message.id && (
                          <div className="menu-dropdown">
                            {!message.deleted && canModify(message.createdAt) && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  startEdit(message);
                                }}
                              >
                                Edit
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteForMe(message.id);
                              }}
                            >
                              Delete for me
                            </button>
                            {!message.deleted && (
                              <button
                                className="danger"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteForEveryone(message.id);
                                }}
                              >
                                Delete for everyone
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="empty-center">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <p className="empty-msg">No messages yet. Send your first message!</p>
              </div>
            )}
            <div ref={endRef}></div>
          </div>
          {isReceiverBlocked && (
            <div className="blocked-banner" onClick={toggleDetail}>
              <p>You blocked this contact. Tap to unblock.</p>
            </div>
          )}
          <div className={`bottom ${isEditing ? "editing" : ""}`}>
            <div className="emoji" ref={emojiRef}>
              <EmojiEmotions
                className="emoji-icon"
                onClick={() => setOpenEmoji((prev) => !prev)}
              />
              <div className="picker">
                <Suspense fallback={null}>
                  <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
                </Suspense>
              </div>
            </div>
            {isEditing && (
              <button className="cancel-btn" onClick={cancelEdit}>
                ✕
              </button>
            )}
            <textarea
              ref={inputRef}
              placeholder="Type a message..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="sendButton"
              onClick={handleSend}
              disabled={text === ""}
            >
              {isEditing ? "Save" : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
