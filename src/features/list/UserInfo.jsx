import { useUserStore } from "@/lib/userStore";
import "./UserInfo.css";
import { getAvatar } from "@/lib/avatar";

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const { letter, color } = getAvatar(currentUser.username);

  return (
    <div className="userInfo">
      <div className="user">
        <div className="avatar-letter" style={{ background: color }}>
          {letter}
        </div>
        <h2>{currentUser.username}</h2>
      </div>
    </div>
  );
};

export default UserInfo;
