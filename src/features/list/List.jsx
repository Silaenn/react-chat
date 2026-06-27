import ChatList from "./ChatList";
import "./List.css";
import UserInfo from "./UserInfo";
import { useChatStore } from "@/lib/chatStore";
import { useLogout } from "@/hooks/useLogout";
import LogoutIcon from "@mui/icons-material/Logout";

const List = () => {
  const { showList } = useChatStore();
  const handleLogout = useLogout();

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
