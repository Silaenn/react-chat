import {
  arrayRemove,
  arrayUnion,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebase";
import "./Detail.css";
import { useUserStore } from "../../lib/userStore";
import { getAvatar } from "../../lib/avatar";
import ExpandLess from "@mui/icons-material/ExpandLess";

const Detail = () => {
  const { changeBlock, user, isCurrentUserBlocked, isReceiverBlocked, showDetail, toggleDetail } =
    useChatStore();
  const { currentUser, fetchUserInfo } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;
    const userRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
      fetchUserInfo(currentUser.id);
    } catch (error) {
      console.log(error);
    }
  };

  const avatar = user ? getAvatar(user.username) : null;

  return (
    <div className={`detail ${showDetail ? "open" : ""}`}>
      <div className="detail-scrim" onClick={toggleDetail} />
      <div className="detail-panel">
        <div className="detail-header">
          <button className="close-btn" onClick={toggleDetail}>×</button>
        </div>
        <div className="user">
          {avatar && (
            <div className="avatar-letter" style={{ background: avatar.color }}>
              {avatar.letter}
            </div>
          )}
          <h2>{user?.username}</h2>
          <p>Online</p>
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
            {isCurrentUserBlocked
              ? "You are Blocked!"
              : isReceiverBlocked
              ? "User blocked"
              : "Block User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
