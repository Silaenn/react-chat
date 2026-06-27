import { useEffect, useState } from "react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useChatStore } from "@/lib/chatStore";
import { db } from "@/lib/firebase";
import "./Detail.css";
import { useUserStore } from "@/lib/userStore";
import { getAvatar } from "@/lib/avatar";
import { formatDetailLastSeen } from "@/lib/time";
import ExpandLess from "@mui/icons-material/ExpandLess";
import { toast } from "react-toastify";

const Detail = () => {
  const { changeBlock, changeChat, chatId, user, isCurrentUserBlocked, isReceiverBlocked, showDetail, toggleDetail } =
    useChatStore();
  const { currentUser, fetchUserInfo } = useUserStore();

  const [detailOnline, setDetailOnline] = useState(false);
  const [detailLastSeen, setDetailLastSeen] = useState(null);

  useEffect(() => {
    if (!user?.id) return;
    const unSub = onSnapshot(doc(db, "users", user.id), (res) => {
      const data = res.data();
      setDetailOnline(data?.online ?? false);
      setDetailLastSeen(data?.lastSeen ?? null);
    });
    return () => unSub();
  }, [user?.id]);

  const handleBlock = async () => {
    if (!user) return;
    const userRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock(!isReceiverBlocked);
      await fetchUserInfo(currentUser.id);
      changeChat(chatId, user, "active");
    } catch (error) {
      toast.error("Failed to block user");
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
