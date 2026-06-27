import { formatTime } from "@/lib/time";

const MessageItem = ({ message, isOwn, canEditMessage, actions, isMenuOpen, menuUp, currentUserId }) => {
  const { onDeleteForEveryone, onDeleteForMe, onStartEdit, onToggleMenu } = actions;

  return (
    <div
      className={`message ${isOwn ? "own" : ""} ${isMenuOpen ? "menu-open" : ""} ${menuUp ? "menu-up" : ""}`}
      key={message.id || message.createdAt}
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
            <span className={`msg-status ${message.readAt ? "read" : "sent"}`}>
              {message.readAt ? "✓✓" : "✓"}
            </span>
          )}
        </div>
      </div>
      {isOwn && message.id && !(message.deletedFor || []).includes(currentUserId) && (
        <div className="message-menu" onClick={(e) => e.stopPropagation()}>
          <button
            className="menu-trigger"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMenu(message.id);
            }}
          >
            ⋯
          </button>
          {isMenuOpen && (
            <div className="menu-dropdown">
              {!message.deleted && canEditMessage && (
                <button onClick={(e) => { e.stopPropagation(); onStartEdit(message); }}>
                  Edit
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); onDeleteForMe(message.id); }}>
                Delete for me
              </button>
              {!message.deleted && (
                <button className="danger" onClick={(e) => { e.stopPropagation(); onDeleteForEveryone(message.id); }}>
                  Delete for everyone
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageItem;
