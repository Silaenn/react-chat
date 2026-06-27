import { useState, useRef, useEffect } from "react";
import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useUserStore } from "@/lib/userStore";
import { SEARCH_DEBOUNCE_MS } from "@/lib/constants";
import { toast } from "react-toastify";

export const useUserSearch = () => {
  const [users, setUsers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [addedIds, setAddedIds] = useState(new Set());
  const [existingIds, setExistingIds] = useState(new Set());
  const [username, setUsername] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchQuery = useRef("");
  const debounceRef = useRef(null);
  const addingRef = useRef(false);
  const { currentUser } = useUserStore();
  const userchatsRef = collection(db, "userchats");

  useEffect(() => {
    const loadExisting = async () => {
      try {
        const snap = await getDoc(doc(userchatsRef, currentUser.id));
        const chats = snap.data()?.chats || [];
        setExistingIds(new Set(chats.map((c) => c.receiverId)));
      } catch (err) {
        console.error("Failed to load existing chats:", err);
      }
    };
    loadExisting();
  }, [currentUser.id, userchatsRef]);

  const searchFirestore = async () => {
    const name = searchQuery.current.trim();
    if (!name) {
      setUsers([]);
      setSearching(false);
      return;
    }

    try {
      const userRef = collection(db, "users");
      const prefix = name.toLowerCase();

      const q = query(
        userRef,
        where("username_lower", ">=", prefix),
        where("username_lower", "<", prefix + "\uf8ff"),
        limit(10)
      );

      const snap = await getDocs(q);
      const results = [];

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        if (data.id === currentUser.id) continue;
        results.push(data);
      }

      setUsers(results);
    } catch (error) {
      toast.error("Failed to search");
      setUsers([]);
    } finally {
      setSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    searchQuery.current = val;
    setUsername(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!val.trim()) {
      setShowResults(false);
      setUsers([]);
      setSearching(false);
    } else {
      setShowResults(true);
      setSearching(true);
      debounceRef.current = setTimeout(searchFirestore, SEARCH_DEBOUNCE_MS);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!searchQuery.current.trim()) return;
      setShowResults(true);
      setSearching(true);
      searchFirestore();
    }
  };

  const handleSearchClick = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!searchQuery.current.trim()) return;
    setShowResults(true);
    setSearching(true);
    searchFirestore();
  };

  const handleAdd = async (user) => {
    if (addingRef.current) return;
    if (addedIds.has(user.id) || existingIds.has(user.id)) return;
    addingRef.current = true;

    try {
      const newChatRef = doc(collection(db, "chats"));

      const batch = writeBatch(db);

      batch.set(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      batch.update(doc(userchatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          updatedAt: Date.now(),
          isSeen: false,
          status: "pending",
          requestedBy: currentUser.id,
          receiverId: currentUser.id,
        }),
      });

      batch.update(doc(userchatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          updatedAt: Date.now(),
          isSeen: false,
          status: "pending",
          requestedBy: currentUser.id,
          receiverId: user.id,
        }),
      });

      await batch.commit();

      setAddedIds((prev) => new Set([...prev, user.id]));
    } catch (error) {
      toast.error("Failed to add user");
    }

    addingRef.current = false;
  };

  return {
    users, searching, addedIds, existingIds, username, showResults,
    setUsername, handleInputChange, handleKeyDown, handleSearchClick, handleAdd,
  };
};
