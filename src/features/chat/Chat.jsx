import { useEffect, useRef, useState } from "react";
import "./Chat.css";
import EmojiPicker from "emoji-picker-react";
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

const Chat = () => {
  const [chat, setChat] = useState();
  const [openEmoji, setOpenEmoji] = useState(false);
  const [text, setText] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);

  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked, chatStatus, toggleDetail } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleEmoji = (e) => {
    setText((prev) => prev + e.emoji);
    setOpenEmoji(false);
  };

  const getMsgTime = (ts) =>
    ts?.toMillis ? ts.toMillis() : new Date(ts).getTime();

  const canModify = (createdAt) => {
    const elapsed = Date.now() - getMsgTime(createdAt);
    return elapsed < 24 * 60 * 60 * 1000;
  };

  const handleSend = async () => {
    if (text === "") return;

    if (editingMessage) {
      await handleEdit();
      return;
    }

    try {
      const message = {
        id: crypto.randomUUID(),
        senderId: currentUser.id,
        text: text,
        createdAt: new Date(),
      };

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(message),
      });

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
            userChatsData.chats[chatIndex].lastMessage = text;
            userChatsData.chats[chatIndex].isSeen =
              id === currentUser.id ? true : false;
            userChatsData.chats[chatIndex].updatedAt = Date.now();

            await updateDoc(userChatsRef, {
              chats: userChatsData.chats,
            });
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }

    setText("");
  };

  const handleEdit = async () => {
    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      const messages = [...chatSnap.data().messages];
      const idx = messages.findIndex((m) => m.id === editingMessage.id);

      if (idx !== -1) {
        messages[idx] = {
          ...messages[idx],
          text,
          edited: true,
          editedAt: new Date(),
        };
        await updateDoc(chatRef, { messages });
      }
    } catch (error) {
      console.error("Error editing message:", error);
    }

    setEditingMessage(null);
    setText("");
  };

  const handleDelete = async (messageId) => {
    if (!window.confirm("Hapus pesan?")) return;

    try {
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);
      const messages = chatSnap.data().messages.filter(
        (m) => m.id !== messageId
      );
      await updateDoc(chatRef, { messages });
    } catch (error) {
      console.error("Error deleting message:", error);
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

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat?.messages]);

  useEffect(() => {
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });

    return () => {
      unSub();
    };
  }, [chatId]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === "Escape" && editingMessage) {
      cancelEdit();
    }
  };

  const avatar = user ? getAvatar(user.username) : null;

  const isPending = chatStatus === "pending";
  const isEditing = !!editingMessage;

  return (
    <div className="chat">
      <div className="top">
        <div className="user">
          {avatar && (
            <div className="avatar-letter" style={{ background: avatar.color }}>
              {avatar.letter}
            </div>
          )}
          <div className="texts">
            <span>{user?.username}</span>
            <p>{isPending ? "Menunggu respon..." : "Online"}</p>
          </div>
        </div>
        <div className="icons">
          <img src="./info.png" alt="Info" onClick={toggleDetail} />
        </div>
      </div>
      {isPending ? (
        <div className="pending-banner">
          <p>Permintaan chat telah dikirim. Menunggu pengguna menerima undanganmu.</p>
        </div>
      ) : (
        <>
          <div className="center" onClick={() => setOpenMenuId(null)}>
            {chat?.messages?.map((message) => {
              const isOwn = message.senderId === currentUser?.id;
              return (
                <div
                  className={`message ${isOwn ? "own" : ""}`}
                  key={message.id || message.createdAt}
                >
                  <div className="texts">
                    <p className="message-text">
                      {message.text}
                      {message.edited && (
                        <span className="edited-label"> (diedit)</span>
                      )}
                    </p>
                  </div>
                  {isOwn && message.id && canModify(message.createdAt) && (
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
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(message);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(message.id);
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            <div ref={endRef}></div>
          </div>
          <div className={`bottom ${isEditing ? "editing" : ""}`}>
            <div className="emoji">
              <img
                src="./emoji.png"
                alt=""
                onClick={() => setOpenEmoji((prev) => !prev)}
              />
              <div className="picker">
                <EmojiPicker open={openEmoji} onEmojiClick={handleEmoji} />
              </div>
            </div>
            {isEditing && (
              <button className="cancel-btn" onClick={cancelEdit}>
                ✕
              </button>
            )}
            <input
              type="text"
              placeholder={
                isCurrentUserBlocked || isReceiverBlocked
                  ? "You cannot send a message"
                  : "Type a message..."
              }
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isCurrentUserBlocked || isReceiverBlocked}
            />
            <button
              className="sendButton"
              onClick={handleSend}
              disabled={isCurrentUserBlocked || isReceiverBlocked || text === ""}
            >
              {isEditing ? "Simpan" : "Send"}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Chat;
