import Info from "@mui/icons-material/Info";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { getAvatar } from "@/lib/avatar";
import { formatLastSeen } from "@/lib/time";

const ChatHeader = ({ user, isOnline, lastSeen, isCurrentUserBlocked, chatStatus, requestedBy, currentUserId, toggleDetail, setShowList }) => {
  const avatar = user ? getAvatar(user.username) : null;

  const isPending = chatStatus === "pending";
  const isPendingForMe = isPending && requestedBy !== currentUserId;
  const isSenderPending = isPending && requestedBy === currentUserId;

  return (
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
  );
};

export default ChatHeader;
