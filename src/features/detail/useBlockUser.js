import { arrayRemove, arrayUnion, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserStore } from "@/lib/userStore";
import { toast } from "react-toastify";
import { useChatStore } from "@/lib/chatStore";

export const useBlockUser = (currentUser, chatId, user, isReceiverBlocked) => {
  const handleBlock = async () => {
    if (!user) return;
    const userRef = doc(db, "users", currentUser.id);

    try {
      await updateDoc(userRef, {
        blocked: isReceiverBlocked ? arrayRemove(user.id) : arrayUnion(user.id),
      });
      const updatedBlocked = isReceiverBlocked
        ? currentUser.blocked.filter((id) => id !== user.id)
        : [...currentUser.blocked, user.id];
      const freshCurrentUser = { ...currentUser, blocked: updatedBlocked };
      useUserStore.setState({ currentUser: freshCurrentUser });
      useChatStore.getState().changeChat(chatId, user, freshCurrentUser, "active");
    } catch (error) {
      toast.error("Failed to block user");
    }
  };

  return handleBlock;
};
