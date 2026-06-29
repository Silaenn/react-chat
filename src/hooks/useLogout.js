import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useUserStore } from "@/lib/userStore";

export const useLogout = () => {
  const handleLogout = async () => {
    if (!window.confirm("Are you sure you want to log out?")) return;

    const currentUser = useUserStore.getState().currentUser;
    try {
      if (currentUser?.id) {
        await updateDoc(doc(db, "users", currentUser.id), {
          online: false,
          lastSeen: serverTimestamp(),
        });
      }
    } catch {
      // continue sign out even if Firestore write fails
    }
    auth.signOut();
  };

  return handleLogout;
};
