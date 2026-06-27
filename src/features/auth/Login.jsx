import { useState } from "react";
import "./Login.css";
import { useAuth } from "./useAuth";

const Login = () => {
  const [mode, setMode] = useState("login");
  const { loading, handleLogin, handleRegister } = useAuth();

  return (
    <div className="login">
      <div className="card">
        <div className="header">
          <img src="/logo.webp" alt="Chat App logo" width="120" height="120" className="logo" />
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
          <form key="login" onSubmit={handleLogin} className="form">
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
          <form key="register" onSubmit={handleRegister} className="form">
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
