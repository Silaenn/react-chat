import { useEffect } from "react";
import Chat from "./components/chat/Chat";
import Detail from "./components/detail/Detail";
import List from "./components/list/List";
import Login from "./components/login/Login";
import Notification from "./components/notification/Notification";
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
      {chatId && <Chat />}
      {chatId && <Detail />}
      <Notification />
    </div>
  );
};

export default App;
