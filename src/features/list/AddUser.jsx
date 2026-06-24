import {
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import "./AddUser.css";
import { db } from "../../lib/firebase";
import { useState } from "react";
import { createPortal } from "react-dom";
import { useUserStore } from "../../lib/userStore";
import { getAvatar } from "../../lib/avatar";

const AddUser = ({ onClose }) => {
  const [user, setUser] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [added, setAdded] = useState(false);
  const [alreadyAdded, setAlreadyAdded] = useState(false);
  const [username, setUsername] = useState("");
  const { currentUser } = useUserStore();
  const userchatsRef = collection(db, "userchats");

  const handleSearch = async () => {
    const name = username.trim();
    if (!name) return;

    setUser(null);
    setNotFound(false);
    setAdded(false);
    setAlreadyAdded(false);
    setSearching(true);

    try {
      const userRef = collection(db, "users");
      const usernameLower = name.toLowerCase();

      const q = query(userRef, where("username", "==", name));
      let snap = await getDocs(q);

      if (snap.empty) {
        const qLower = query(userRef, where("username_lower", "==", usernameLower));
        snap = await getDocs(qLower);
      }

      if (snap.empty) {
        setNotFound(true);
      } else {
        const found = snap.docs[0].data();
        if (found.id === currentUser.id) {
          setNotFound(true);
        } else {
          const currentUserChats = await getDoc(doc(userchatsRef, currentUser.id));
          const existingChats = currentUserChats.data()?.chats || [];
          const exists = existingChats.some((c) => c.receiverId === found.id);
          setAlreadyAdded(exists);
          setUser(found);
        }
      }
    } catch (error) {
      console.log(error);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleAdd = async () => {
    if (!user || alreadyAdded) return;
    const chatRef = collection(db, "chats");
    try {
      const currentUserChats = await getDoc(doc(userchatsRef, currentUser.id));
      const existingChats = currentUserChats.data()?.chats || [];
      const exists = existingChats.some((c) => c.receiverId === user.id);

      if (exists) {
        setAlreadyAdded(true);
        return;
      }

      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      const pendingEntry = {
        chatId: newChatRef.id,
        lastMessage: "",
        receiverId: "",
        updatedAt: Date.now(),
        isSeen: false,
        status: "pending",
        requestedBy: currentUser.id,
      };

      await updateDoc(doc(userchatsRef, user.id), {
        chats: arrayUnion({
          ...pendingEntry,
          receiverId: currentUser.id,
        }),
      });

      await updateDoc(doc(userchatsRef, currentUser.id), {
        chats: arrayUnion({
          ...pendingEntry,
          receiverId: user.id,
        }),
      });

      setAdded(true);
      setUser(null);
      setUsername("");
    } catch (error) {
      console.log(error);
    }
  };

  const result = user ? getAvatar(user.username) : null;

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
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        {!username && !searching && !notFound && !added && !user && (
          <p className="status empty-hint">Type a username above to find users</p>
        )}
        {searching && <p className="status">Searching...</p>}
        {notFound && <p className="status not-found">User not found</p>}
        {added && <p className="status success">User added!</p>}
        {user && result && (
          <div className="addUser-result">
            <div className="avatar-letter" style={{ background: result.color }}>
              {result.letter}
            </div>
            <span className="result-name">{user.username}</span>
            <button
              className={`add-btn ${alreadyAdded ? "added" : ""}`}
              onClick={handleAdd}
              disabled={alreadyAdded}
            >
              {alreadyAdded ? "Added" : "Add"}
            </button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AddUser;
