import { doc, getDoc } from "firebase/firestore";
import { create } from "zustand";
import { db } from "./firebase";

let fetchEpoch = 0;

export const useUserStore = create((set) => ({
  currentUser: null,
  isLoading: true,
  error: null,
  fetchUserInfo: async (uid) => {
    const epoch = ++fetchEpoch;

    if (!uid) return set({ currentUser: null, isLoading: false, error: null });

    set({ currentUser: null, isLoading: true, error: null });

    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      if (epoch !== fetchEpoch) return;

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (!data.id || !data.username) {
          console.error("Invalid user document", data);
          return set({ currentUser: null, isLoading: false, error: "Invalid user data" });
        }
        set({ currentUser: data, isLoading: false, error: null });
      } else {
        set({ currentUser: null, isLoading: false, error: null });
      }
    } catch (error) {
      console.error("fetchUserInfo failed:", error);
      if (epoch === fetchEpoch) {
        return set({ currentUser: null, isLoading: false, error: error.message || "Failed to load user" });
      }
    }
  },
}));
