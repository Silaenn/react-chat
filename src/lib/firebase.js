import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "react-chat-f6969.firebaseapp.com",
  projectId: "react-chat-f6969",
  storageBucket: "react-chat-f6969.appspot.com",
  messagingSenderId: "53420857255",
  appId: "1:53420857255:web:4d374128b9a0c1d9204882",
};

initializeApp(firebaseConfig);

export const auth = getAuth();
export const db = getFirestore();

enableIndexedDbPersistence(db).catch((err) => {
  if (err.code === 'failed-precondition') {
    console.warn("Offline persistence unavailable (multiple tabs open)");
  } else if (err.code === 'unimplemented') {
    console.warn("Offline persistence not supported in this browser");
  }
});
