import { useState } from "react";
import { useUserStore } from "../../lib/userStore";
import "./UserInfo.css";
import { auth } from "../../lib/firebase";
import { getAvatar } from "../../lib/avatar";

const UserInfo = () => {
  const { currentUser } = useUserStore();
  const [openMenu, setOpenMenu] = useState(false);
  const { letter, color } = getAvatar(currentUser.username);

  return (
    <div className="userInfo">
      <div className="user">
        <div className="avatar-letter" style={{ background: color }}>
          {letter}
        </div>
        <h2>{currentUser.username}</h2>
      </div>
      <div className="icons">
        <img src="./more.png" alt="" onClick={() => setOpenMenu(!openMenu)} />

        {openMenu && (
          <div className="menu">
            <div className="logOut">
              <p onClick={() => auth.signOut()}>Log Out</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserInfo;
