import "./Detail.css";
import { useChatStore } from "@/lib/chatStore";
import { useUserStore } from "@/lib/userStore";
import { getAvatar } from "@/lib/avatar";
import { formatDetailLastSeen } from "@/lib/time";
import { useDetailUserStatus } from "./useDetailUserStatus";
import { useBlockUser } from "./useBlockUser";
import ExpandLess from "@mui/icons-material/ExpandLess";
import Settings from "@mui/icons-material/Settings";
import HelpOutline from "@mui/icons-material/HelpOutline";

const Detail = ({ showDetail, onToggleDetail }) => {
  const { chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser } = useUserStore();

  const { isOnline: detailOnline, lastSeen: detailLastSeen } = useDetailUserStatus(user?.id);
  const handleBlock = useBlockUser(currentUser, chatId, user, isReceiverBlocked);
  const handleBlockAndClose = () => { handleBlock(); onToggleDetail(); };

  const avatar = user ? getAvatar(user.username) : null;

  return (
    <div className={`detail ${showDetail ? "open" : ""}`}>
      <div className="detail-scrim" onClick={onToggleDetail} />
      <div className="detail-panel">
        <div className="detail-header">
          <button className="close-btn" onClick={onToggleDetail}>×</button>
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

          <button onClick={handleBlockAndClose}>
            {isReceiverBlocked ? "Unblock User" : "Block User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
