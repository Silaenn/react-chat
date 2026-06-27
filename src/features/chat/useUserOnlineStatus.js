import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const useUserOnlineStatus = (userId) => {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSeen, setLastSeen] = useState(null);

  useEffect(() => {
    if (!userId) return;
    const unSub = onSnapshot(doc(db, "users", userId), (res) => {
      const data = res.data();
      setIsOnline(data?.online ?? false);
      setLastSeen(data?.lastSeen ?? null);
    });
    return () => unSub();
  }, [userId]);

  return { isOnline, lastSeen };
};
