import "./Detail.css";
import { useChatStore } from "@/lib/chatStore";
import { useUserStore } from "@/lib/userStore";
import { getAvatar } from "@/lib/avatar";
import { formatDetailLastSeen } from "@/lib/time";
import { useDetailUserStatus } from "./useDetailUserStatus";
import { useBlockUser } from "./useBlockUser";
import ExpandLess from "@mui/icons-material/ExpandLess";

const Detail = ({ showDetail, onToggleDetail }) => {
  const { changeBlock, changeChat, chatId, user, isCurrentUserBlocked, isReceiverBlocked } =
    useChatStore();
  const { currentUser, fetchUserInfo } = useUserStore();

  const { isOnline: detailOnline, lastSeen: detailLastSeen } = useDetailUserStatus(user?.id);
  const handleBlock = useBlockUser(currentUser, chatId, user, isReceiverBlocked, changeBlock, fetchUserInfo, changeChat);

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
          <p className={isCurrentUserBlocked || isReceiverBlocked ? "offline" : detailOnline ? "online" : "offline"}>
            {isCurrentUserBlocked ? "Offline" : isReceiverBlocked ? "Offline" : detailOnline ? "Online" : formatDetailLastSeen(detailLastSeen)}
          </p>
        </div>
        <div className="info">
          <div className="option">
            <div className="title">
              <span>Chat Settings</span>
              <ExpandLess />
            </div>
          </div>
          <div className="option">
            <div className="title">
              <span>Privacy & help</span>
              <ExpandLess />
            </div>
          </div>

          <button onClick={handleBlock}>
            {isReceiverBlocked ? "Unblock User" : "Block User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
