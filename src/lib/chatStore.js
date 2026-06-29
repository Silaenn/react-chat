import { create } from "zustand";

const isMobile = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  chatStatus: null,
  requestedBy: null,
  changeChat: (chatId, user, currentUser, chatStatus = "active", requestedBy = null) => {
    if (!currentUser || !user) {
      return set({
        chatId: null,
        user: null,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
        chatStatus: null,
        requestedBy: null,
      });
    }

    if (chatStatus === "pending") {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
        chatStatus,
        requestedBy,
      });
    }

    return set({
      chatId,
      user,
      isCurrentUserBlocked: user.blocked.includes(currentUser.id),
      isReceiverBlocked: currentUser.blocked.includes(user.id),
      chatStatus,
      requestedBy: user.blocked.includes(currentUser.id) || currentUser.blocked.includes(user.id) ? null : requestedBy,
    });
  },

  changeBlock: (blocked) => {
    set((state) => ({
      ...state,
      isReceiverBlocked: blocked !== undefined ? blocked : !state.isReceiverBlocked,
    }));
  },
  resetChat: () =>
    set({
      chatId: null,
      user: null,
      isCurrentUserBlocked: false,
      isReceiverBlocked: false,
      showList: !isMobile(),
      chatStatus: null,
      requestedBy: null,
    }),
  showList: !isMobile(),
  toggleList: () => set((state) => ({ showList: !state.showList })),
  setShowList: (val) => set({ showList: val }),
}));
