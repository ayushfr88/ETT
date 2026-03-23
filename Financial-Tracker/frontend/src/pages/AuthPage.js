import React from "react";
import AuthForm from "../components/AuthForm";
import AuthTabs from "../components/AuthTabs";
import Message from "../components/Message";
import { useAuth } from "../hooks/useAuth";

export default function AuthPage({ onLogin }) {
  const {
    mode,
    switchMode,
    email,
    setEmail,
    password,
    setPassword,
    message,
    loading,
    canSubmit,
    submit,
  } = useAuth(onLogin);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthTabs mode={mode} onChange={switchMode} />

        <AuthForm
          mode={mode}
          email={email}
          password={password}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
          loading={loading}
          disableSubmit={!canSubmit}
        />

        <Message text={message.text} variant={message.variant} />
      </div>
    </div>
  );
}
