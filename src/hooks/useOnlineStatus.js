import { useEffect, useRef } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useOnlineStatus = (currentUserId) => {
  const userRef = useRef(null);

  const setOnline = (online) => {
    if (!userRef.current) return;
    if (online) {
      updateDoc(userRef.current, { online: true }).catch(() => {});
    } else {
      updateDoc(userRef.current, { online: false, lastSeen: serverTimestamp() }).catch(() => {});
    }
  };

  useEffect(() => {
    if (!currentUserId) {
      userRef.current = null;
      return;
    }

    const ref = doc(db, "users", currentUserId);
    userRef.current = ref;

    const handleVisibility = () => {
      setOnline(!document.hidden);
    };

    const handleBeforeUnload = () => {
      updateDoc(ref, { online: false, lastSeen: serverTimestamp() }).catch(
        (err) => console.error("Failed to set offline on unload:", err)
      );
    };

    setOnline(true);

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      updateDoc(ref, { online: false, lastSeen: serverTimestamp() }).catch(() => {});
    };
  }, [currentUserId]);
};
