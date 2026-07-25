import React, { useState } from "react";
import { useSearchParams, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Login() {
  const [searchParams] = useSearchParams();
  const [redirecting, setRedirecting] = useState(false);
  const { user, loading } = useAuth();

  const error = searchParams.get("error");

  const handleGoogleLogin = () => {
    setRedirecting(true);
    // Full page redirect to backend, which kicks off the Google OAuth flow
    window.location.href = `${API_URL}/auth/google`;
  };

  if (loading) {
    return (
      <div className="center-screen">
        <div className="spinner-lg"></div>
      </div>
    );
  }

  // Already logged in -> skip login page
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="center-screen">
      <div className="card">
        <h1>Welcome</h1>
        <p className="subtitle">Sign in to continue to your dashboard</p>

        {error === "auth_failed" && (
          <div className="error-msg">
            Google sign-in failed or was cancelled. Please try again.
          </div>
        )}

        <button
          className="google-btn"
          onClick={handleGoogleLogin}
          disabled={redirecting}
        >
          {redirecting ? (
            <span className="spinner"></span>
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.7 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.9 5.1 29.7 3 24 3 16 3 9 7.5 6.3 14.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 45c5.6 0 10.7-2.1 14.5-5.6l-6.7-5.5C29.6 35.7 27 36.5 24 36.5c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9 40.5 16 45 24 45z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.7 5.5C41.5 35.4 45 30.1 45 24c0-1.2-.1-2.4-.4-3.5z"
              />
            </svg>
          )}
          {redirecting ? "Redirecting..." : "Continue with Google"}
        </button>
      </div>
    </div>
  );
}
