import { useEffect, useState } from "react";
import "./ChatList.css";
import AddUser from "./AddUser";
import { useUserStore } from "../../lib/userStore";
import {
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { getAvatar } from "../../lib/avatar";
import Search from "@mui/icons-material/Search";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Close from "@mui/icons-material/Close";
import { toast } from "react-toastify";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat, setShowList } = useChatStore();

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats || [];

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        setChatsLoading(false);
      }
    );

    return () => {
      unsub();
    };
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { chatId, lastMessage, isSeen, updatedAt, receiverId } = item;
      const entry = { chatId, lastMessage, isSeen, updatedAt, receiverId };
      if (item.status) entry.status = item.status;
      if (item.requestedBy) entry.requestedBy = item.requestedBy;
      return entry;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    if (chatIndex !== -1) userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      const status = chat.status === "pending" ? "pending" : "active";
      changeChat(chat.chatId, chat.user, status);
      setShowList(false);
    } catch (error) {
      toast.error("Failed to select conversation");
    }
  };

  const handleAccept = async (chat) => {
    const userIds = [currentUser.id, chat.user.id];
    try {
      for (const id of userIds) {
        const ref = doc(db, "userchats", id);
        const snap = await getDoc(ref);
        const data = snap.data();
        const updated = data.chats.map((c) => {
          if (c.chatId === chat.chatId) {
            const updated = { ...c, status: "active" };
            delete updated.requestedBy;
            return updated;
          }
          return c;
        });
        await updateDoc(ref, { chats: updated });
      }
    } catch (error) {
      toast.error("Failed to accept request");
    }
  };

  const handleDecline = async (chat) => {
    const userIds = [currentUser.id, chat.user.id];
    try {
      for (const id of userIds) {
        const ref = doc(db, "userchats", id);
        const snap = await getDoc(ref);
        const data = snap.data();
        const updated = data.chats.filter((c) => c.chatId !== chat.chatId);
        await updateDoc(ref, { chats: updated });
      }
      await deleteDoc(doc(db, "chats", chat.chatId));
    } catch (error) {
      toast.error("Failed to decline request");
    }
  };

  const activeChats = chats.filter(
    (c) => !c.status || c.status === "active"
  ).filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  const incomingRequests = chats.filter(
    (c) =>
      c.status === "pending" &&
      c.requestedBy !== currentUser.id &&
      c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  const outgoingPending = chats.filter(
    (c) =>
      c.status === "pending" &&
      c.requestedBy === currentUser.id &&
      c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            disabled={chatsLoading}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <div className="add" onClick={() => setAddMode((prev) => !prev)}>
          <div className="add-icon-wrap">
            {addMode ? <Close /> : <PersonAdd />}
          </div>
        </div>
      </div>
      <div className="items">
        {chatsLoading ? (
          [1, 2, 3, 4, 5].map((i) => (
            <div className="item skeleton-item" key={i}>
              <div className="skeleton-avatar-chatlist" />
              <div className="texts">
                <div className="skeleton-line skeleton-name-chatlist" />
                <div className="skeleton-line skeleton-message-chatlist" />
              </div>
            </div>
          ))
        ) : (
          <>
            {incomingRequests.length > 0 && (
              <div className="section-label">Incoming Requests</div>
            )}
            {incomingRequests.map((chat, index) => {
              const { letter, color } = getAvatar(chat.user.username);
              return (
                <div className="item request-item" key={chat.chatId} style={{ '--i': index }}>
                  <div className="avatar-letter" style={{ background: color }}>
                    {letter}
                  </div>
                  <div className="texts">
                    <div className="row">
                      <span>{chat.user.username}</span>
                    </div>
                    <p className="empty-msg">Waiting for your response</p>
                  </div>
                  <div className="request-actions">
                    <button
                      className="accept-btn"
                      onClick={() => handleAccept(chat)}
                    >
                      Accept
                    </button>
                    <button
                      className="decline-btn"
                      onClick={() => handleDecline(chat)}
                    >
                      Decline
                    </button>
                  </div>
                </div>
              );
            })}

            {outgoingPending.map((chat, index) => {
              const { letter, color } = getAvatar(chat.user.username);
              return (
                <div
                  className="item pending-item"
                  key={chat.chatId}
                  onClick={() => handleSelect(chat)}
                  style={{ '--i': index }}
                >
                  <div className="avatar-letter" style={{ background: color }}>
                    {letter}
                  </div>
                  <div className="texts">
                    <div className="row">
                      <span>{chat.user.username}</span>
                    </div>
                    <p className="empty-msg">Waiting to be accepted...</p>
                  </div>
                </div>
              );
            })}

            {activeChats.map((chat, index) => {
              const { letter, color } = getAvatar(chat.user.username);
              return (
                <div
                  className={`item ${!chat?.isSeen ? "unread" : ""}`}
                  key={chat.chatId}
                  onClick={() => handleSelect(chat)}
                  style={{ '--i': index }}
                >
                  <div className="avatar-letter" style={{ background: color }}>
                    {letter}
                  </div>
                  <div className="texts">
                    <div className="row">
                      <span>
                        {chat.user.blocked.includes(currentUser.id)
                          ? "User"
                          : chat.user.username}
                      </span>
                    </div>
                    {chat.lastMessage ? (
                      <p className="last-msg">{chat.lastMessage}</p>
                    ) : (
                      <p className="empty-msg">No messages yet</p>
                    )}
                  </div>
                </div>
              );
            })}

            {activeChats.length === 0 && incomingRequests.length === 0 && outgoingPending.length === 0 && input && (
              <div className="empty-state">
                <p>No users found matching your search.</p>
              </div>
            )}

            {activeChats.length === 0 && incomingRequests.length === 0 && outgoingPending.length === 0 && !input && (
              <div className="empty-state">
                <p>No conversations yet. Search for users to start.</p>
              </div>
            )}
          </>
        )}
      </div>

      {addMode && <AddUser onClose={() => setAddMode(false)} />}
    </div>
  );
};

export default ChatList;
