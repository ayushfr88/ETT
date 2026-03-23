import React from "react";

export default function AuthForm({
  mode,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  loading,
  disableSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="auth-form">
      <label className="auth-label" htmlFor="email">
        Email
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => onEmailChange(e.target.value)}
        className="auth-input"
        placeholder="you@example.com"
        required
        autoComplete="email"
        inputMode="email"
      />

      <label className="auth-label" htmlFor="password">
        Password
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => onPasswordChange(e.target.value)}
        className="auth-input"
        placeholder="••••••••"
        required
        autoComplete={mode === "signup" ? "new-password" : "current-password"}
      />

      <button
        type="submit"
        className="auth-submit"
        disabled={loading || disableSubmit}
      >
        {loading ? "Please wait..." : mode === "login" ? "Log in" : "Sign up"}
      </button>
    </form>
  );
}

