import { useEffect } from "react";
import Chat from "./features/chat/Chat";
import Detail from "./features/detail/Detail";
import List from "./features/list/List";
import Login from "./features/auth/Login";
import Notification from "./features/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./lib/firebase";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId, resetChat } = useChatStore();

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
      resetChat();
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo, resetChat]);

  if (isLoading) return <div className="loading">Loading...</div>;
  if (!currentUser)
    return (
      <>
        <Login />
        <Notification />
      </>
    );
  return (
    <div className="container">
      <List />
      <div className="main">
        {chatId && <Chat />}
        {chatId && <Detail />}
      </div>
      <Notification />
    </div>
  );
};

export default App;
