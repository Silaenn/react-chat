import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { auth, db } from "../../lib/firebase";
import "./Detail.css";
import { useUserStore } from "../../lib/userStore";
import { getAvatar } from "../../lib/avatar";

const Detail = () => {
  const { changeBlock, user, isCurrentUserBlocked, isReceiverBlocked, chatId, showDetail, toggleDetail } =
    useChatStore();
  const { currentUser } = useUserStore();

  const handleBlock = async () => {
    if (!user) return;
    const userRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock();
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
              <img src="./arrowUp.png" alt="" />
            </div>
          </div>
          <div className="option">
            <div className="title">
              <span>Privacy & help</span>
              <img src="./arrowUp.png" alt="" />
            </div>
          </div>
          <div className="option">
            <div className="title">
              <span>Shared photos</span>
              <img src="./arrowDown.png" alt="" />
            </div>
            <div className="photos">
              <div className="photoItem">
                <div className="photoDetail">
                  <img src="./avatar.png" alt="" />
                  <span>photo_2024_2.png</span>
                </div>
                <img src="./download.png" className="icon" alt="" />
              </div>
              <div className="photoItem">
                <div className="photoDetail">
                  <img src="./avatar.png" alt="" />
                  <span>photo_2024_2.png</span>
                </div>
                <img src="./download.png" className="icon" alt="" />
              </div>
            </div>
          </div>
          <div className="option">
            <div className="title">
              <span>Shared Files</span>
              <img src="./arrowUp.png" alt="" />
            </div>
          </div>
          <button onClick={handleBlock}>
            {isCurrentUserBlocked
              ? "You are Blocked!"
              : isReceiverBlocked
              ? "User blocked"
              : "Block User"}
          </button>
          <button className="logout" onClick={() => auth.signOut()}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
