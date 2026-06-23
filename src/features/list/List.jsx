import ChatList from "./ChatList";
import "./List.css";
import UserInfo from "./UserInfo";
import { useChatStore } from "../../lib/chatStore";
import { auth } from "../../lib/firebase";

const List = () => {
  const { showList } = useChatStore();

  return (
    <div className={`list ${!showList ? "hide-list" : ""}`}>
      <UserInfo />
      <ChatList />
      <div className="logout-bar" onClick={() => auth.signOut()}>
        <img src="./download.png" alt="Logout" />
        <span>Log Out</span>
      </div>
    </div>
  );
};

export default List;
