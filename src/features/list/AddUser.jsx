import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  where,
} from "firebase/firestore";
import "./AddUser.css";
import { db } from "../../lib/firebase";
import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useUserStore } from "../../lib/userStore";
import { getAvatar } from "../../lib/avatar";
import { toast } from "react-toastify";

const AddUser = ({ onClose }) => {
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
      debounceRef.current = setTimeout(searchFirestore, 300);
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

  return createPortal(
    <div className="addUser-overlay" onClick={onClose}>
      <div className="addUser-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-header">
          <h2 className="modal-title">Add User</h2>
          <p className="modal-subtitle">Search by username to start a new conversation</p>
        </div>
        <div className="addUser-form">
          <input
            type="text"
            placeholder="Enter username..."
            value={username}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearchClick}>Search</button>
        </div>
        {!showResults && !username && (
          <p className="status empty-hint">Type a username above to find users</p>
        )}
        {searching && <p className="status">Searching...</p>}
        {showResults && !searching && users.length === 0 && (
          <p className="status not-found">No users found</p>
        )}
        {users.length > 0 && (
          <div className="addUser-results">
            {users.map((u) => {
              const avatar = getAvatar(u.username);
              const isAdded = addedIds.has(u.id) || existingIds.has(u.id);
              return (
                <div className="addUser-result" key={u.id}>
                  <div className="avatar-letter" style={{ background: avatar.color }}>
                    {avatar.letter}
                  </div>
                  <span className="result-name">{u.username}</span>
                  <button
                    className={`add-btn ${isAdded ? "added" : ""}`}
                    onClick={() => handleAdd(u)}
                    disabled={isAdded || addingRef.current}
                  >
                    {isAdded ? "Added" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AddUser;
