import React from "react";

export default function Message({ text, variant }) {
  if (!text) return null;

  return (
    <p className={variant === "error" ? "auth-message error" : "auth-message success"}>
      {text}
    </p>
  );
}

