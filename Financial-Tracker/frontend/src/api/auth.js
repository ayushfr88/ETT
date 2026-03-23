import { API_URL } from "./config";

async function postJson(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data;
  try {
    data = await res.json();
  } catch {
    data = { success: false, message: "Invalid server response." };
  }

  if (typeof data?.success !== "boolean") {
    return {
      success: false,
      message: res.ok ? "Unexpected server response." : "Request failed.",
    };
  }

  return data;
}

export function register({ email, password }) {
  return postJson("/auth/register", { email, password });
}

export function login({ email, password }) {
  return postJson("/auth/login", { email, password });
}

