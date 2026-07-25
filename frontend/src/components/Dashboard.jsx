import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.get("/auth/logout");
      setUser(null);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    } finally {
      setLoggingOut(false);
    }
  };

  if (!user) return null;

  return (
    <div className="center-screen">
      <div className="dashboard-card">
        <span className="badge">Logged in with Google</span>
        <img
          src={user.profilePicture}
          alt={user.name}
          className="avatar"
          referrerPolicy="no-referrer"
        />
        <h2>{user.name}</h2>
        <p className="email">{user.email}</p>
        <button className="logout-btn" onClick={handleLogout} disabled={loggingOut}>
          {loggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
}
