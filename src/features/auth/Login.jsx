import { useState } from "react";
import "./Login.css";
import { toast } from "react-toastify";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth, db } from "../../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import upload from "../../lib/upload";

const Login = () => {
  const [mode, setMode] = useState("login");
  const [avatar, setAvatar] = useState({ file: null, url: "" });
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    if (e.target.files[0]) {
      setAvatar({
        file: e.target.files[0],
        url: URL.createObjectURL(e.target.files[0]),
      });
    }
  };

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

      const imgUrl = avatar.file ? await upload(avatar.file) : null;

      await setDoc(doc(db, "users", res.user.uid), {
        username,
        username_lower: username.toLowerCase(),
        avatar: imgUrl || "./avatar.png",
        email,
        id: res.user.uid,
        blocked: [],
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

  const switchMode = () => {
    setMode((m) => (m === "login" ? "register" : "login"));
    setAvatar({ file: null, url: "" });
  };

  return (
    <div className="login">
      <div className="card">
        <div className="header">
          <h1>Chat App</h1>
          <p className="subtitle">
            {mode === "login"
              ? "Welcome back! Sign in to continue."
              : "Create an account to get started."}
          </p>
        </div>

        <div className="tabs">
          <button
            className={`tab ${mode === "login" ? "active" : ""}`}
            onClick={() => setMode("login")}
          >
            Sign In
          </button>
          <button
            className={`tab ${mode === "register" ? "active" : ""}`}
            onClick={() => setMode("register")}
          >
            Sign Up
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={handleLogin} className="form">
            <div className="field">
              <label htmlFor="login-email">Email</label>
              <input
                id="login-email"
                type="email"
                placeholder="your@email.com"
                name="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="login-password">Password</label>
              <input
                id="login-password"
                type="password"
                placeholder="Enter your password"
                name="password"
                required
              />
            </div>
            <button className="submit-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Sign In"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="form">
            <div className="field avatar-field">
              <label htmlFor="file" className="avatar-label">
                <img src={avatar.url || "./avatar.png"} alt="avatar" />
                <span>{avatar.url ? "Change photo" : "Add photo"}</span>
              </label>
              <input
                type="file"
                id="file"
                accept="image/*"
                onChange={handleAvatar}
              />
            </div>
            <div className="field">
              <label htmlFor="reg-username">Username</label>
              <input
                id="reg-username"
                type="text"
                placeholder="Choose a username"
                name="username"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                placeholder="your@email.com"
                name="email"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="reg-password">Password</label>
              <input
                id="reg-password"
                type="password"
                placeholder="Create a password"
                name="password"
                required
              />
            </div>
            
            <button className="submit-btn" disabled={loading}>
              {loading ? <span className="spinner" /> : "Create Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
