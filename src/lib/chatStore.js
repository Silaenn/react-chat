import { create } from "zustand";
import { useUserStore } from "./userStore";

export const useChatStore = create((set) => ({
  chatId: null,
  user: null,
  isCurrentUserBlocked: false,
  isReceiverBlocked: false,
  chatStatus: null,
  requestedBy: null,
  changeChat: (chatId, user, chatStatus = "active", requestedBy = null) => {
    const currentUser = useUserStore.getState().currentUser;

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

    if (user.blocked.includes(currentUser.id)) {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: true,
        isReceiverBlocked: false,
        chatStatus: null,
        requestedBy: null,
      });
    } else if (currentUser.blocked.includes(user.id)) {
      return set({
        chatId,
        user: user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: true,
        chatStatus: null,
        requestedBy: null,
      });
    } else {
      return set({
        chatId,
        user,
        isCurrentUserBlocked: false,
        isReceiverBlocked: false,
        chatStatus,
        requestedBy,
      });
    }
  },

  changeBlock: () => {
    set((state) => ({
      ...state,
      isReceiverBlocked: !state.isReceiverBlocked,
    }));
  },
  resetChat: () =>
    set({ chatId: null, showList: false, showDetail: false, chatStatus: null, welcomeDismissed: false, requestedBy: null }),
  showDetail: false,
  toggleDetail: () => set((state) => ({ showDetail: !state.showDetail })),
  showList: true,
  toggleList: () => set((state) => ({ showList: !state.showList })),
  setShowList: (val) => set({ showList: val }),
  welcomeDismissed: false,
  dismissWelcome: () => set({ welcomeDismissed: true, showList: true }),
}));
