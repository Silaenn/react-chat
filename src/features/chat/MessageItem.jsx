import { formatTime } from "@/lib/time";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";

const MessageItem = ({ message, isOwn, canEditMessage, actions, isMenuOpen, menuUp, currentUserId }) => {
  const { onDeleteForEveryone, onDeleteForMe, onStartEdit, onToggleMenu } = actions;

  const handleDeleteForMe = async (id) => {
    await onDeleteForMe(id);
    onToggleMenu(null);
  };

  const handleDeleteForEveryone = async (id) => {
    await onDeleteForEveryone(id);
    onToggleMenu(null);
  };

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
            <span className={`msg-status ${message.readAt ? "read" : "sent"}`} aria-label={message.readAt ? "Read" : "Sent"}>
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
            aria-label="Message options"
            aria-expanded={isMenuOpen}
          >
            <KeyboardArrowDown />
          </button>
          {isMenuOpen && (
            <div className="menu-dropdown">
              {!message.deleted && canEditMessage && (
                <button onClick={(e) => { e.stopPropagation(); onStartEdit(message); }}>
                  Edit
                </button>
              )}
              <button onClick={(e) => { e.stopPropagation(); handleDeleteForMe(message.id); }}>
                Delete for me
              </button>
              {!message.deleted && (
                <button className="danger" onClick={(e) => { e.stopPropagation(); handleDeleteForEveryone(message.id); }}>
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
