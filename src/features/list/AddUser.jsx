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
import { useUserStore } from "../../lib/userStore";

const AddUser = () => {
  const [user, setUser] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [searching, setSearching] = useState(false);
  const [added, setAdded] = useState(false);
  const { currentUser } = useUserStore();

  const handleSearch = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const username = formData.get("username").trim();

    if (!username) return;

    setUser(null);
    setNotFound(false);
    setAdded(false);
    setSearching(true);

    try {
      const userRef = collection(db, "users");
      const usernameLower = username.toLowerCase();

      const q = query(userRef, where("username", "==", username));
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

  const handleAdd = async () => {
    const chatRef = collection(db, "chats");
    const userchatsRef = collection(db, "userchats");
    try {
      const currentUserChats = await getDoc(doc(userchatsRef, currentUser.id));
      const existingChats = currentUserChats.data()?.chats || [];
      const alreadyExists = existingChats.some((c) => c.receiverId === user.id);

      if (alreadyExists) {
        setNotFound(true);
        setUser(null);
        return;
      }

      const newChatRef = doc(chatRef);

      await setDoc(newChatRef, {
        createdAt: serverTimestamp(),
        messages: [],
      });

      await updateDoc(doc(userchatsRef, user.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: currentUser.id,
          updatedAt: Date.now(),
        }),
      });

      await updateDoc(doc(userchatsRef, currentUser.id), {
        chats: arrayUnion({
          chatId: newChatRef.id,
          lastMessage: "",
          receiverId: user.id,
          updatedAt: Date.now(),
        }),
      });

      setAdded(true);
      setUser(null);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="addUser">
      <form onSubmit={handleSearch}>
        <input type="text" placeholder="Username" name="username" />
        <button>Search</button>
      </form>
      {searching && <p className="status">Searching...</p>}
      {notFound && <p className="status not-found">User not found</p>}
      {added && <p className="status success">User added!</p>}
      {user && (
        <div className="user">
          <div className="detail">
            <img src={user.avatar || "./avatar.png"} alt="" />
            <span>{user.username}</span>
          </div>
          <button onClick={handleAdd}>Add User</button>
        </div>
      )}
    </div>
  );
};

export default AddUser;
