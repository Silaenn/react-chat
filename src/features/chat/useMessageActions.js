import { useRef } from "react";
import {
  arrayUnion,
  doc,
  runTransaction,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "react-toastify";
import { canModify } from "@/lib/time";

const updateUserChat = async (userId, chatId, updater) => {
  const ref = doc(db, "userchats", userId);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(ref);
    if (!snap.exists()) return;
    const chats = snap.data().chats || [];
    const updated = updater(chats);
    transaction.update(ref, { chats: updated });
  });
};

export const useMessageActions = (chatId, user, currentUser, isCurrentUserBlocked, isReceiverBlocked, chatStatus, requestedBy) => {
  const sendingRef = useRef(false);
  const editingRef = useRef(false);
  const deletingRef = useRef(null);

  const handleSend = async (text, onClear) => {
    if (text === "" || sendingRef.current) return;
    sendingRef.current = true;

    const msgText = text;
    onClear();

    try {
      const isBlocked = isCurrentUserBlocked || isReceiverBlocked;
      const isPendingChat = chatStatus === "pending" && requestedBy === currentUser.id;
      const message = {
        id: crypto.randomUUID(),
        senderId: currentUser.id,
        text: msgText,
        createdAt: new Date(),
        readAt: null,
        ...(isBlocked && { blocked: true }),
        ...(isPendingChat && { pending: true }),
      };

      await updateDoc(doc(db, "chats", chatId), {
        messages: arrayUnion(message),
      });

      const notifIds = isBlocked ? [currentUser.id] : [currentUser.id, user.id];

      for (const id of notifIds) {
        await updateUserChat(id, chatId, (chats) => {
          const idx = chats.findIndex((c) => c.chatId === chatId);
          if (idx !== -1) {
            return chats.map((c, i) => {
              if (i !== idx) return c;
              return {
                ...c,
                lastMessage: !isBlocked || id === currentUser.id ? msgText : c.lastMessage,
                isSeen: id === currentUser.id,
                updatedAt: Date.now(),
                ...(id !== currentUser.id && isPendingChat ? { status: "pending", requestedBy: currentUser.id } : {}),
              };
            });
          }
          if (id !== currentUser.id && isPendingChat) {
            return [...chats, {
              chatId,
              receiverId: currentUser.id,
              lastMessage: msgText,
              updatedAt: Date.now(),
              isSeen: false,
              status: "pending",
              requestedBy: currentUser.id,
            }];
          }
          return chats;
        });
      }
    } catch (error) {
      toast.error("Failed to send message.");
    }

    sendingRef.current = false;
  };

  const handleEdit = async (msgId, msgText) => {
    if (editingRef.current) return;
    editingRef.current = true;

    try {
      const chatRef = doc(db, "chats", chatId);
      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(chatRef);
        const messages = [...snap.data().messages];
        const idx = messages.findIndex((m) => m.id === msgId);

        if (idx !== -1 && canModify(messages[idx].createdAt)) {
          // eslint-disable-next-line no-unused-vars
          const { pending, blocked, ...rest } = messages[idx];
          messages[idx] = {
            ...rest,
            text: msgText,
            edited: true,
            editedAt: new Date(),
          };
          transaction.update(chatRef, { messages });
        }
      });
    } catch (error) {
      toast.error("Failed to edit message");
    }

    editingRef.current = false;
  };

  const handleDeleteForEveryone = async (messageId) => {
    if (deletingRef.current === messageId) return;
    deletingRef.current = messageId;

    if (!window.confirm("Delete for everyone?")) {
      deletingRef.current = null;
      return;
    }

    try {
      const chatRef = doc(db, "chats", chatId);
      let newLastMsg = "";

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(chatRef);
        const messages = snap.data().messages.map((m) => {
          if (m.id === messageId) {
            return { ...m, pending: undefined, blocked: undefined, deleted: true, text: "", edited: false };
          }
          return m;
        });
        transaction.update(chatRef, { messages });

        const sorted = [...messages]
          .filter(
            (m) =>
              m.id !== messageId &&
              !(m.deletedFor || []).includes(currentUser.id)
          )
          .sort((a, b) => (a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()) - (b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()));

        const lastVisible = sorted[sorted.length - 1];
        if (lastVisible) {
          newLastMsg = lastVisible.deleted
            ? "This message was deleted"
            : lastVisible.text;
        }
      });

      const userIDs = [currentUser.id, user.id];
      for (const id of userIDs) {
        await updateUserChat(id, chatId, (chats) =>
          chats.map((c) =>
            c.chatId === chatId ? { ...c, lastMessage: newLastMsg, updatedAt: Date.now() } : c
          )
        );
      }
    } catch (error) {
      toast.error("Failed to delete message");
    }

    deletingRef.current = null;
  };

  const handleDeleteForMe = async (messageId) => {
    if (deletingRef.current === messageId) return;
    deletingRef.current = messageId;

    if (!window.confirm("Delete for me?")) {
      deletingRef.current = null;
      return;
    }

    try {
      const chatRef = doc(db, "chats", chatId);
      let newLastMsg = "";

      await runTransaction(db, async (transaction) => {
        const snap = await transaction.get(chatRef);
        const messages = snap.data().messages.map((m) => {
          if (m.id === messageId) {
            return {
              ...m,
              deletedFor: [...(m.deletedFor || []), currentUser.id],
            };
          }
          return m;
        });
        transaction.update(chatRef, { messages });

        const sorted = [...messages]
          .filter(
            (m) =>
              m.id !== messageId &&
              !(m.deletedFor || []).includes(currentUser.id)
          )
          .sort((a, b) => (a.createdAt?.toMillis ? a.createdAt.toMillis() : new Date(a.createdAt).getTime()) - (b.createdAt?.toMillis ? b.createdAt.toMillis() : new Date(b.createdAt).getTime()));

        const lastVisible = sorted[sorted.length - 1];
        if (lastVisible) {
          newLastMsg = lastVisible.deleted
            ? "This message was deleted"
            : lastVisible.text;
        }
      });

      await updateUserChat(currentUser.id, chatId, (chats) =>
        chats.map((c) =>
          c.chatId === chatId ? { ...c, lastMessage: newLastMsg, updatedAt: Date.now() } : c
        )
      );
    } catch (error) {
      toast.error("Failed to delete message");
    }

    deletingRef.current = null;
  };

  return { handleSend, handleEdit, handleDeleteForEveryone, handleDeleteForMe, sendingRef };
};
