import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useUserStore } from "@/lib/userStore";

export const useLogout = () => {
  const handleLogout = async () => {
    const currentUser = useUserStore.getState().currentUser;
    if (currentUser?.id) {
      await updateDoc(doc(db, "users", currentUser.id), {
        online: false,
        lastSeen: serverTimestamp(),
      });
    }
    auth.signOut();
  };

  return handleLogout;
};
