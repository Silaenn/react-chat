import { useEffect, useRef } from "react";
import "./Detail.css";
import { useChatStore } from "@/lib/chatStore";
import { useUserStore } from "@/lib/userStore";
import { getAvatar } from "@/lib/avatar";
import { formatDetailLastSeen } from "@/lib/time";
import { useBlockUser } from "./useBlockUser";
import { useUserOnlineStatus } from "@/features/chat/useUserOnlineStatus";
import ExpandLess from "@mui/icons-material/ExpandLess";
import Settings from "@mui/icons-material/Settings";
import HelpOutline from "@mui/icons-material/HelpOutline";

const Detail = ({ showDetail, onToggleDetail }) => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();
  const closeBtnRef = useRef(null);

  const { isOnline: detailOnline, lastSeen: detailLastSeen } = useUserOnlineStatus(user?.id);
  const handleBlock = useBlockUser(currentUser, chatId, user, isReceiverBlocked);
  const handleBlockAndClose = () => { handleBlock(); onToggleDetail(); };

  const avatar = user ? getAvatar(user.username) : null;

  useEffect(() => {
    if (showDetail) {
      closeBtnRef.current?.focus();
    }
  }, [showDetail]);

  return (
    <div className={`detail ${showDetail ? "open" : ""}`}>
      <div className="detail-scrim" onClick={onToggleDetail} />
      <div className="detail-panel">
        <div className="detail-header">
          <button className="close-btn" onClick={onToggleDetail} aria-label="Close detail panel" ref={closeBtnRef}>×</button>
        </div>
        <div className="user">
          {avatar && (
            <div className="avatar-letter" style={{ background: avatar.color }}>
              {avatar.letter}
            </div>
          )}
          <h2>{user?.username}</h2>
          <p className={isCurrentUserBlocked ? "offline" : detailOnline ? "online" : "offline"}>
            {isCurrentUserBlocked ? "Offline" : detailOnline ? "Online" : formatDetailLastSeen(detailLastSeen)}
          </p>
        </div>
        <div className="info">
          <div className="option">
            <div className="title">
              <Settings className="option-icon" />
              <span>Chat Settings</span>
              <ExpandLess className="chevron-icon" />
            </div>
          </div>
          <div className="option">
            <div className="title">
              <HelpOutline className="option-icon" />
              <span>Privacy & help</span>
              <ExpandLess className="chevron-icon" />
            </div>
          </div>

          <button onClick={handleBlockAndClose} aria-label={isReceiverBlocked ? "Unblock this user" : "Block this user"}>
            {isReceiverBlocked ? "Unblock User" : "Block User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
