import { useEffect, useState } from "react";
import "./ChatList.css";
import AddUser from "./AddUser";
import { useUserStore } from "../../lib/userStore";
import { doc, getDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useChatStore } from "../../lib/chatStore";
import { getAvatar } from "../../lib/avatar";

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { changeChat } = useChatStore();

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const items = res.data().chats;

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
      const { user, ...rest } = item;
      return rest;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    userChats[chatIndex].isSeen = true;

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: userChats,
      });
      changeChat(chat.chatId, chat.user);
    } catch (error) {
      console.log(error);
    }
  };

  const filteredChats = chats.filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  return (
    <div className="chatList">
      <div className="search">
        <div className="searchBar">
          <img src="./search.png" alt="" />
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => setInput(e.target.value)}
          />
        </div>
        <img
          src={addMode ? "./minus.png" : "./plus.png"}
          alt=""
          className="add"
          onClick={() => setAddMode((prev) => !prev)}
        />
      </div>
      <div className="items">
        {filteredChats.map((chat) => {
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
