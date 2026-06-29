import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  onSnapshot,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useChatStore } from "@/lib/chatStore";
import { toast } from "react-toastify";

export const useChatList = (currentUser) => {
  const [chats, setChats] = useState([]);
  const [chatsLoading, setChatsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  const { changeChat, setShowList } = useChatStore();

  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, "userchats", currentUser.id),
      async (res) => {
        const data = res.data();
        if (!data) {
          setChatsLoading(false);
          return;
        }
        const items = data.chats || [];

        const promises = items.map(async (item) => {
          const userDocRef = doc(db, "users", item.receiverId);
          const userDocSnap = await getDoc(userDocRef);
          const user = userDocSnap.data();
          if (!user) {
            return { ...item, user: { username: "Unknown User", blocked: [] } };
          }
          return { ...item, user };
        });

        const chatData = await Promise.all(promises);
        setChats(chatData.sort((a, b) => b.updatedAt - a.updatedAt));
        setChatsLoading(false);
      }
    );

    return () => unsub();
  }, [currentUser.id]);

  const handleSelect = async (chat) => {
    const userChats = chats.map((item) => {
      const { chatId, lastMessage, isSeen, updatedAt, receiverId } = item;
      const entry = { chatId, lastMessage, isSeen, updatedAt, receiverId };
      if (item.status) entry.status = item.status;
      if (item.requestedBy) entry.requestedBy = item.requestedBy;
      return entry;
    });

    const chatIndex = userChats.findIndex(
      (item) => item.chatId === chat.chatId
    );

    const updatedUserChats = userChats.map((item, i) =>
      i === chatIndex ? { ...item, isSeen: true } : item
    );

    const userChatsRef = doc(db, "userchats", currentUser.id);

    try {
      await updateDoc(userChatsRef, {
        chats: updatedUserChats,
      });
      const status = chat.status === "pending" ? "pending" : "active";
      changeChat(chat.chatId, chat.user, currentUser, status, chat.requestedBy);
      setShowList(false);
    } catch (error) {
      toast.error("Failed to select conversation");
    }
  };

  const handleAccept = async (chat) => {
    setActionLoading(chat.chatId);
    const userIds = [currentUser.id, chat.user.id];
    try {
      for (const id of userIds) {
        const ref = doc(db, "userchats", id);
        const snap = await getDoc(ref);
        const data = snap.data();
        if (!data) continue;
        const updated = data.chats.map((c) => {
          if (c.chatId === chat.chatId) {
            const updated = { ...c, status: "active" };
            delete updated.requestedBy;
            return updated;
          }
          return c;
        });
        await updateDoc(ref, { chats: updated });
      }

      const chatRef = doc(db, "chats", chat.chatId);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(chatRef);
        const messages = (snap.data()?.messages || []).map((m) => {
          if (m.pending) {
            // eslint-disable-next-line no-unused-vars
            const { pending, ...rest } = m;
            return rest;
          }
          return m;
        });
        transaction.update(chatRef, { messages });
      });
    } catch (error) {
      toast.error("Failed to accept request");
    }
    setActionLoading(null);
  };

  const handleDecline = async (chat) => {
    setActionLoading(chat.chatId);
    try {
      const userIds = [currentUser.id, chat.user.id];
      for (const id of userIds) {
        const ref = doc(db, "userchats", id);
        await runTransaction(db, async (transaction) => {
          const snap = await transaction.get(ref);
          if (!snap.exists()) return;
          const updated = snap.data().chats.filter((c) => c.chatId !== chat.chatId);
          transaction.update(ref, { chats: updated });
        });
      }
    } catch (error) {
      toast.error("Failed to decline request");
    }
    setActionLoading(null);
  };

  return { chats, chatsLoading, actionLoading, handleSelect, handleAccept, handleDecline };
};
