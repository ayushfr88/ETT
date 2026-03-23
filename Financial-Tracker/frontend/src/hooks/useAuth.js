import { useMemo, useState } from "react";
import { login, register } from "../api/auth";

const emailLooksValid = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export function useAuth(onLogin) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState({ text: "", variant: "success" });
  const [loading, setLoading] = useState(false);

  const emailNormalized = useMemo(() => String(email).trim().toLowerCase(), [email]);

  const clearMessage = () => setMessage({ text: "", variant: "success" });

  const canSubmit = useMemo(() => {
    if (!emailNormalized || !password) return false;
    if (!emailLooksValid(emailNormalized)) return false;
    if (mode === "signup" && password.length < 6) return false;
    return true;
  }, [emailNormalized, password, mode]);

  const submit = async () => {
    clearMessage();
    setLoading(true);

    try {
      const fn = mode === "signup" ? register : login;
      const data = await fn({ email: emailNormalized, password });

      if (data?.success) {
        if (mode === "login" && data.token && onLogin) {
          onLogin(data.token);
        } else {
          setMessage({ text: data.message || "Success. Please log in.", variant: "success" });
          if (mode === "signup") {
            setMode("login");
            setPassword("");
          }
        }
      } else {
        setMessage({
          text: data?.message || "Something went wrong.",
          variant: "error",
        });
      }
    } catch {
      setMessage({
        text: "Could not reach server. Is the backend running?",
        variant: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    clearMessage();
  };

  return {
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
  };
}
