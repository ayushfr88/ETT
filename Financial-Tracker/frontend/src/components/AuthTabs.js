import React from "react";

export default function AuthTabs({ mode, onChange }) {
  return (
    <div className="auth-tabs">
      <button
        type="button"
        className={mode === "login" ? "auth-tab active" : "auth-tab"}
        onClick={() => onChange("login")}
      >
        Login
      </button>
      <button
        type="button"
        className={mode === "signup" ? "auth-tab active" : "auth-tab"}
        onClick={() => onChange("signup")}
      >
        Sign up
      </button>
    </div>
  );
}

