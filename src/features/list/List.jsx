import ChatList from "./ChatList";
import "./List.css";
import UserInfo from "./UserInfo";

const List = () => {
  return (
    <div className="list">
      <UserInfo />
      <ChatList />
    </div>
  );
};

export default List;
