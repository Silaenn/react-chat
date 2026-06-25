import { useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.target);
    const { email, password } = Object.fromEntries(formData);

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.target);

    const { username, email, password } = Object.fromEntries(formData);

    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);

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

      toast.success("Account created! You can login now!");
      setMode("login");
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="card">
        <div className="header">
          <img src="/logo.png" alt="Chat App logo" className="logo" />
          <p className="subtitle">
            {mode === "login"
              ? "Selamat datang! Masuk untuk melanjutkan."
              : "Buat akun untuk memulai."}
          </p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Masuk
          </button>
          <button
            className={`tab ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Daftar
          </button>
        </div>

        {mode === "login" ? (
          <form key="login" onSubmit={handleLogin} className="form">
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="email@anda.com"
                name="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Kata Sandi</label>
              <input
                id="login-password"
                type="password"
                placeholder="Masukkan kata sandi"
                name="password"
                required
              />
            </div>
            <button className="submit-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Masuk"}
            </button>
          </form>
        ) : (
          <form key="register" onSubmit={handleRegister} className="form">
            <div className="field">
              <label htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                type="text"
                placeholder="Pilih username"
                name="username"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                placeholder="email@anda.com"
                name="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="reg-password">Kata Sandi</label>
              <input
                id="reg-password"
                type="password"
                placeholder="Buat kata sandi"
                name="password"
                required
              />
            </div>
            
            <button className="submit-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Buat Akun"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
