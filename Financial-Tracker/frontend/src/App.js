import React, { useState } from "react";
import "./App.css";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./components/Dashboard";

function App() {
  const [token, setToken] = useState(null);

  const handleLogout = () => {
    setToken(null);
  };

  if (token) {
    return <Dashboard token={token} onLogout={handleLogout} />;
  }

  return <AuthPage onLogin={setToken} />;
}

export default App;
 