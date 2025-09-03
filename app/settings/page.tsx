"use client";
import React, { useState } from "react";

export default function SettingsPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    if (newPassword !== confirmPassword) {
      setMessage("New passwords do not match.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });
    setLoading(false);
    if (res.ok) {
      setMessage("Password changed successfully.");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const data = await res.json();
      setMessage(data.error || "Failed to change password.");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto" }}>
      <h2>Change Password</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Old Password:
            <input
              type="password"
              value={oldPassword}
              onChange={e => setOldPassword(e.target.value)}
              required
              style={{ marginLeft: "1rem", padding: "6px", width: "70%" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            New Password:
            <input
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              style={{ marginLeft: "1rem", padding: "6px", width: "70%" }}
            />
          </label>
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label>
            Confirm New Password:
            <input
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              style={{ marginLeft: "1rem", padding: "6px", width: "70%" }}
            />
          </label>
        </div>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "8px 16px",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          {loading ? "Changing..." : "Change Password"}
        </button>
      </form>
      {message && (
        <div style={{ marginTop: "1rem", color: message.includes("success") ? "green" : "red" }}>
          {message}
        </div>
      )}
    </div>
  );
}