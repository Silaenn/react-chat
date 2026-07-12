import { useEffect, useState } from "react";
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
import { WELCOME_DISMISS_MS } from "@/lib/constants";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId, resetChat, setShowList } = useChatStore();
  const [welcomeDismissed, setWelcomeDismissed] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const toggleDetail = () => setShowDetail((prev) => !prev);

  useOnlineStatus(currentUser?.id);

  useEffect(() => {
    if (!currentUser || chatId || welcomeDismissed) return;
    const mql = window.matchMedia('(max-width: 768px)');
    if (mql.matches) {
      const timer = setTimeout(() => {
        setWelcomeDismissed(true);
        setShowList(true);
      }, WELCOME_DISMISS_MS);
      return () => clearTimeout(timer);
    }
    const handleChange = (e) => {
      if (e.matches) setWelcomeDismissed(true);
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [chatId, welcomeDismissed, setShowList, currentUser]);

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
  return (
    <>
      {!currentUser ? (
        <Login />
      ) : (
        <div className="container">
          <List />
          <div className="main">
            {chatId ? (
              <>
                <Chat onToggleDetail={toggleDetail} />
                <Detail showDetail={showDetail} onToggleDetail={toggleDetail} />
              </>
            ) : (
              <div className="welcome">
                <div className="welcome-icon"><img src="/logo.webp" alt="Chat App" width="120" height="120" /></div>
                <h2>Welcome to Chat App</h2>
                <p>Select a conversation from the sidebar to start chatting</p>
              </div>
            )}
          </div>
        </div>
      )}
      <Notification />
    </>
  );
};

export default App;
