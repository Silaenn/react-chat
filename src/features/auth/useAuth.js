import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { getFirebaseErrorMessage } from "@/lib/errors";
import { toast } from "react-toastify";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    const formData = new FormData(e.target);
    const { username, email, password } = Object.fromEntries(formData);
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      try {
        await setDoc(doc(db, "users", res.user.uid), {
          username,
          username_lower: username.toLowerCase(),
          avatar: null,
          email,
          id: res.user.uid,
          blocked: [],
          online: false,
          lastSeen: null,
        });
        await setDoc(doc(db, "userchats", res.user.uid), {
          chats: [],
        });
      } catch (firestoreError) {
        await res.user.delete();
        toast.error("Failed to create account. Please try again.");
        setLoading(false);
        return;
      }
    } catch (error) {
      toast.error(getFirebaseErrorMessage(error.code));
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleLogin, handleRegister };
};
