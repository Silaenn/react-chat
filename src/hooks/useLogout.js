import { auth, db } from "@/lib/firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { useUserStore } from "@/lib/userStore";
import { useConfirm } from "@/context/ConfirmContext";

export const useLogout = () => {
  const confirm = useConfirm();

  const handleLogout = async () => {
    const ok = await confirm("Are you sure you want to log out?");
    if (!ok) return;

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
