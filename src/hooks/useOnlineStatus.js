import { useEffect, useRef } from "react";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

const THROTTLE_MS = 30000;

export const useOnlineStatus = (currentUserId) => {
  const userRef = useRef(null);
  const lastWriteRef = useRef(0);
  const unloadedRef = useRef(false);

  useEffect(() => {
    if (!currentUserId) {
      userRef.current = null;
      return;
    }

    const writeStatus = (online) => {
      if (!userRef.current) return;
      const ref = userRef.current;
      if (online) {
        updateDoc(ref, { online: true }).catch(() => {});
      } else {
        updateDoc(ref, { online: false, lastSeen: serverTimestamp() }).catch(() => {});
      }
    };

    const throttledWrite = (online) => {
      const now = Date.now();
      if (now - lastWriteRef.current < THROTTLE_MS) return;
      lastWriteRef.current = now;
      writeStatus(online);
    };

    unloadedRef.current = false;
    const ref = doc(db, "users", currentUserId);
    userRef.current = ref;

    const handleVisibility = () => {
      throttledWrite(!document.hidden);
    };

    const handleBeforeUnload = () => {
      unloadedRef.current = true;
      updateDoc(ref, { online: false, lastSeen: serverTimestamp() }).catch(() => {});
    };

    writeStatus(true);
    lastWriteRef.current = Date.now();

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      if (!unloadedRef.current) {
        updateDoc(ref, { online: false, lastSeen: serverTimestamp() }).catch(() => {});
      }
    };
  }, [currentUserId]);
};
