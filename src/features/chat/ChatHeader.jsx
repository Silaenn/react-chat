import Info from "@mui/icons-material/Info";
import ArrowBack from "@mui/icons-material/ArrowBack";
import { getAvatar } from "@/lib/avatar";
import { formatLastSeen } from "@/lib/time";

const ChatHeader = ({ user, status, currentUserId, onToggleDetail, onBack }) => {
  const { isOnline, lastSeen, isCurrentUserBlocked, chatStatus, requestedBy } = status;
  const avatar = user ? getAvatar(user.username) : null;

  const isPending = chatStatus === "pending";
  const isPendingForMe = isPending && requestedBy !== currentUserId;
  const isSenderPending = isPending && requestedBy === currentUserId;

  const statusText = (() => {
    if (isCurrentUserBlocked) return "Offline";
    if (isPendingForMe) return "Wants to chat";
    if (isSenderPending) return "Waiting for response...";
    if (isOnline) return "Online";
    if (lastSeen) return `Last seen ${formatLastSeen(lastSeen)}`;
    return "Offline";
  })();

  const statusClass = isCurrentUserBlocked ? "offline" : isOnline ? "online" : "offline";

  return (
    <div className="top">
      <div className="top-left">
        <button className="back-btn" onClick={onBack}>
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
          <p className={`status-text ${statusClass}`}>
            <span className={`status-dot ${statusClass}`} />
            {statusText}
          </p>
        </div>
      </div>
      <div className="top-right">
        <Info className="chat-icon" onClick={onToggleDetail} />
      </div>
    </div>
  );
};

export default ChatHeader;
