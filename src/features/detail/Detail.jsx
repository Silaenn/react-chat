import { useEffect, useState } from "react";
import {
  arrayRemove,
  arrayUnion,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { useChatStore } from "../../lib/chatStore";
import { db } from "../../lib/firebase";
import "./Detail.css";
import { useUserStore } from "../../lib/userStore";
import { getAvatar } from "../../lib/avatar";
import ExpandLess from "@mui/icons-material/ExpandLess";
import { toast } from "react-toastify";

const Detail = () => {
  const { changeBlock, user, isCurrentUserBlocked, isReceiverBlocked, showDetail, toggleDetail } =
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
      changeBlock();
      fetchUserInfo(currentUser.id);
    } catch (error) {
      toast.error("Gagal memblokir pengguna");
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
          <p className={detailOnline ? "online" : "offline"}>
            {detailOnline ? "Online" : "Offline"}
          </p>
        </div>
        <div className="info">
          <div className="option">
            <div className="title">
              <span>Pengaturan Chat</span>
              <ExpandLess />
            </div>
          </div>
          <div className="option">
            <div className="title">
              <span>Privasi & Bantuan</span>
              <ExpandLess />
            </div>
          </div>

          <button onClick={handleBlock}>
            {isCurrentUserBlocked
              ? "Kamu Diblokir!"
              : isReceiverBlocked
              ? "Pengguna diblokir"
              : "Blokir Pengguna"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Detail;
