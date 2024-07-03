import ChatList from "./chatList/ChatList";
import "./list.css";
import UserInfro from "./userInfo/UserInfo";

const List = () => {
  return (
    <div className="list">
      <UserInfro />
      <ChatList />
    </div>
  );
};

export default List;
