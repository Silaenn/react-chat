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

const ChatList = () => {
  const [chats, setChats] = useState([]);
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
      console.log(error);
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
      console.log(error);
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
      console.log(error);
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
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        {addMode ? (
          <Close className="add" onClick={() => setAddMode((prev) => !prev)} />
        ) : (
          <PersonAdd className="add" onClick={() => setAddMode((prev) => !prev)} />
        )}
      </div>
      <div className="items">
        {incomingRequests.length > 0 && (
          <div className="section-label">Request Masuk</div>
        )}
        {incomingRequests.map((chat) => {
          const { letter, color } = getAvatar(chat.user.username);
          return (
            <div className="item request-item" key={chat.chatId}>
              <div className="avatar-letter" style={{ background: color }}>
                {letter}
              </div>
              <div className="texts">
                <div className="row">
                  <span>{chat.user.username}</span>
                </div>
                <p className="empty-msg">Menunggu responmu</p>
              </div>
              <div className="request-actions">
                <button
                  className="accept-btn"
                  onClick={() => handleAccept(chat)}
                >
                  Terima
                </button>
                <button
                  className="decline-btn"
                  onClick={() => handleDecline(chat)}
                >
                  Tolak
                </button>
              </div>
            </div>
          );
        })}

        {outgoingPending.map((chat) => {
          const { letter, color } = getAvatar(chat.user.username);
          return (
            <div
              className="item pending-item"
              key={chat.chatId}
              onClick={() => handleSelect(chat)}
            >
              <div className="avatar-letter" style={{ background: color }}>
                {letter}
              </div>
              <div className="texts">
                <div className="row">
                  <span>{chat.user.username}</span>
                </div>
                <p className="empty-msg">Menunggu diterima...</p>
              </div>
            </div>
          );
        })}

        {activeChats.map((chat) => {
          const { letter, color } = getAvatar(chat.user.username);
          return (
            <div
              className={`item ${!chat?.isSeen ? "unread" : ""}`}
              key={chat.chatId}
              onClick={() => handleSelect(chat)}
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
                  <p>{chat.lastMessage}</p>
                ) : (
                  <p className="empty-msg">No messages yet</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {addMode && <AddUser />}
    </div>
  );
};

export default ChatList;
