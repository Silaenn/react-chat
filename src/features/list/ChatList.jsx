import { useState } from "react";
import "./ChatList.css";
import { useChatList } from "./useChatList";
import ChatListItem from "./ChatListItem";
import IncomingRequest from "./IncomingRequest";
import AddUser from "./AddUser";
import { useUserStore } from "@/lib/userStore";
import Search from "@mui/icons-material/Search";
import PersonAdd from "@mui/icons-material/PersonAdd";

const ChatList = () => {
  const [addMode, setAddMode] = useState(false);
  const [input, setInput] = useState("");

  const { currentUser } = useUserStore();
  const { chats, chatsLoading, actionLoading, handleSelect, handleAccept, handleDecline } = useChatList(currentUser);

  const activeChats = chats.filter(
    (c) => !c.status || c.status === "active" || (c.status === "pending" && c.requestedBy === currentUser.id)
  ).filter((c) =>
    c.user.username.toLowerCase().includes(input.toLowerCase())
  );

  const incomingRequests = chats.filter(
    (c) =>
      c.status === "pending" &&
      c.requestedBy &&
      c.requestedBy !== currentUser.id &&
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
        <div className="add" onClick={() => setAddMode((prev) => !prev)} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setAddMode((prev) => !prev); }} aria-label="Add user">
          <div className="add-icon-wrap">
            <PersonAdd />
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
            {incomingRequests.map((chat) => (
              <IncomingRequest
                key={chat.chatId}
                chat={chat}
                isLoading={actionLoading === chat.chatId}
                onAccept={handleAccept}
                onDecline={handleDecline}
              />
            ))}

            {activeChats.map((chat) => (
              <ChatListItem
                key={chat.chatId}
                chat={chat}
                currentUserId={currentUser.id}
                onSelect={handleSelect}
              />
            ))}

            {activeChats.length === 0 && incomingRequests.length === 0 && input && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                </div>
                <p>No users found matching your search.</p>
              </div>
            )}

            {activeChats.length === 0 && incomingRequests.length === 0 && !input && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
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
