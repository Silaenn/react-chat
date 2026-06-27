import ChatList from "./ChatList";
import "./List.css";
import UserInfo from "./UserInfo";
import { useChatStore } from "@/lib/chatStore";
import { useUserStore } from "@/lib/userStore";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import LogoutIcon from "@mui/icons-material/Logout";

const List = () => {
  const { showList } = useChatStore();

  const handleLogout = async () => {
    const currentUser = useUserStore.getState().currentUser;
    if (currentUser?.id) {
      await updateDoc(doc(db, "users", currentUser.id), {
        online: false,
        lastSeen: serverTimestamp(),
      });
    }
    auth.signOut();
  };

  return (
    <div className={`list ${!showList ? "hide-list" : ""}`}>
      <UserInfo />
      <ChatList />
      <div className="logout-bar" onClick={handleLogout}>
        <div className="logout-icon-wrap">
          <LogoutIcon className="logout-icon" />
        </div>
        <span>Log Out</span>
      </div>
    </div>
  );
};

export default List;
