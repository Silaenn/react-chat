import { useState } from "react";
import { useUserStore } from "../../../lib/userStore";
import "./userinfo.css";
import { auth } from "../../../lib/firebase";

const UserInfo = () => {
  const { currentUser } = useUserStore();

  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div className="userInfo">
      <div className="user">
        <img src={currentUser.avatar || "./avatar.png"} alt="" />
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
        <img src="./video.png" alt="" />
        <img src="./edit.png" alt="" />
      </div>
    </div>
  );
};

export default UserInfo;
