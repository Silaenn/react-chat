import { getAvatar } from "@/lib/avatar";

const ChatListItem = ({ chat, currentUserId, onSelect }) => {
  const { letter, color } = getAvatar(chat.user.username);
  const isSenderPending = chat.status === "pending" && chat.requestedBy === currentUserId;

  return (
    <div
      className={`item ${isSenderPending ? "pending-item" : ""} ${!chat?.isSeen ? "unread" : ""}`}
      key={chat.chatId}
      onClick={() => onSelect(chat)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onSelect(chat); }}
      aria-label={`Chat with ${chat.user.username}`}
    >
      <div className="avatar-letter" style={{ background: color }}>
        {letter}
      </div>
      <div className="texts">
        <div className="row">
          <span>{chat.user.username}</span>
        </div>
        {isSenderPending ? (
          <p className="empty-msg">Waiting to be accepted...</p>
        ) : chat.lastMessage ? (
          <p className={`last-msg ${chat.lastMessage === "This message was deleted" ? "deleted" : ""}`}>
            {chat.lastMessage}
          </p>
        ) : (
          <p className="empty-msg">No messages yet</p>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
