import { useEffect } from "react";
import Chat from "@/features/chat/Chat";
import Detail from "@/features/detail/Detail";
import List from "@/features/list/List";
import Login from "@/features/auth/Login";
import Notification from "@/components/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useUserStore } from "@/lib/userStore";
import { useChatStore } from "@/lib/chatStore";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { useWelcomeDismiss } from "@/hooks/useWelcomeDismiss";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId, resetChat, welcomeDismissed, dismissWelcome } = useChatStore();

  useOnlineStatus(currentUser?.id);
  useWelcomeDismiss(chatId, welcomeDismissed, dismissWelcome);

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
      resetChat();
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo, resetChat]);

  if (isLoading)
    return (
      <div className="loading">
        <div className="loading-spinner" />
        <span>Loading...</span>
      </div>
    );
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
        {chatId ? (
          <>
            <Chat />
            <Detail />
          </>
        ) : (
          <div className="welcome">
            <div className="welcome-icon"><img src="/logo.webp" alt="Chat App" width="120" height="120" /></div>
            <h2>Welcome to Chat App</h2>
            <p>Select a conversation from the sidebar to start chatting</p>
          </div>
        )}
      </div>
      <Notification />
    </div>
  );
};

export default App;
