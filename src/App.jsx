import { useEffect, useRef } from "react";
import Chat from "./features/chat/Chat";
import Detail from "./features/detail/Detail";
import List from "./features/list/List";
import Login from "./features/auth/Login";
import Notification from "./features/notification/Notification";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "./lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useUserStore } from "./lib/userStore";
import { useChatStore } from "./lib/chatStore";

const App = () => {
  const { currentUser, isLoading, fetchUserInfo } = useUserStore();
  const { chatId, resetChat, welcomeDismissed, dismissWelcome } = useChatStore();
  const userRef = useRef(null);

  const setOnline = (online) => {
    if (!userRef.current) return;
    if (online) {
      updateDoc(userRef.current, { online: true });
    } else {
      updateDoc(userRef.current, { online: false, lastSeen: serverTimestamp() });
    }
  };

  useEffect(() => {
    const unSub = onAuthStateChanged(auth, (user) => {
      fetchUserInfo(user?.uid);
      resetChat();
    });

    return () => {
      unSub();
    };
  }, [fetchUserInfo, resetChat]);

  useEffect(() => {
    if (!currentUser?.id) {
      userRef.current = null;
      return;
    }

    const ref = doc(db, "users", currentUser.id);
    userRef.current = ref;

    const handleVisibility = () => {
      setOnline(!document.hidden);
    };

    const handleBeforeUnload = () => {
      updateDoc(ref, { online: false, lastSeen: serverTimestamp() });
    };

    setOnline(true);

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updateDoc(ref, { online: false, lastSeen: serverTimestamp() });
    };
  }, [currentUser?.id]);

  useEffect(() => {
    if (chatId || welcomeDismissed) return;
    const mql = window.matchMedia('(max-width: 768px)');
    if (mql.matches) {
      const timer = setTimeout(() => dismissWelcome(), 4000);
      return () => clearTimeout(timer);
    }
    const handleChange = (e) => {
      if (e.matches) dismissWelcome();
    };
    mql.addEventListener('change', handleChange);
    return () => mql.removeEventListener('change', handleChange);
  }, [chatId, welcomeDismissed, dismissWelcome]);

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
