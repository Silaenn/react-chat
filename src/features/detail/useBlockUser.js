import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-toastify";

export const useBlockUser = (currentUser, chatId, user, isReceiverBlocked, changeBlock, fetchUserInfo, changeChat) => {
  const handleBlock = async () => {
    if (!user) return;
    const userRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      changeBlock(!isReceiverBlocked);
      await fetchUserInfo(currentUser.id);
      changeChat(chatId, user, currentUser, "active");
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  return handleBlock;
};
