import { useEffect, useState } from "react";
import { doc, onSnapshot, runTransaction } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-toastify";

export const useChatMessages = (chatId, currentUserId) => {
  const [chat, setChat] = useState(null);

  useEffect(() => {
    setChat(null);
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    const unSub = onSnapshot(doc(db, "chats", chatId), (res) => {
      setChat(res.data());
    });
    return () => unSub();
  }, [chatId]);

  useEffect(() => {
    if (!chat?.messages || !chatId) return;

    const unreadOthers = chat.messages.filter(
      (m) => m.senderId !== currentUserId && !m.readAt
    );
    if (unreadOthers.length === 0) return;

    const markAsRead = async () => {
      try {
        const chatRef = doc(db, "chats", chatId);
        await runTransaction(db, async (transaction) => {
          const snap = await transaction.get(chatRef);
          const messages = snap.data().messages.map((m) => {
            if (m.senderId !== currentUserId && !m.readAt) {
              return { ...m, readAt: new Date() };
            }
            return m;
          });
          transaction.update(chatRef, { messages });
        });
      } catch (error) {
        toast.error("Failed to mark message as read");
      }
    };

    markAsRead();
  }, [chat?.messages, chatId, currentUserId]);

  return { chat, loading: !chat };
};
