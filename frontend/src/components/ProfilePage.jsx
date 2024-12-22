import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfilePage.css";

const ProfilePage = ({ username, handleLogout }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [updatedUsername, setUpdatedUsername] = useState(username);
  const [tempUsername, setTempUsername] = useState(username);
  const [message, setMessage] = useState("");

  const handleEdit = () => {
    setTempUsername(updatedUsername);
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/updateProfile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldUsername: updatedUsername,
          newUsername: tempUsername,
        }),
      });

      const data = await res.text();
      if (res.status === 200) {
        setUpdatedUsername(tempUsername);
        setMessage("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setMessage(data);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage("An error occurred. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/deleteAccount", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: updatedUsername }),
      });

      if (res.status === 200) {
        alert("Account deleted successfully!");
        handleLogout();
        navigate("/");
      } else {
        alert("Failed to delete account.");
      }
    } catch (error) {
      console.error("Error deleting account:", error);
    }
  };

  return (
    <div className="page-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left">
          <span className="navbar-home" onClick={() => navigate("/posts")}>
            Home
          </span>
        </div>
        <div className="navbar-right">
          <h2 className="navbar-hello">Hello, {username}</h2>
          <div className="navbar-buttons">
            <button
              className="navbar-button"
              onClick={() => navigate("/add-post")}
            >
              New Post
            </button>
            <button
              className="navbar-button"
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>
            <button
              className="navbar-button logout-button"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Profile Section */}
      <div className="profile-container">
        <h2>Profile</h2>
        <div className="profile-field">
          <h4>{updatedUsername}</h4>
          {isEditing ? (
            <input
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
            />
          ) : (
            <button className="edit-button" onClick={handleEdit}>
              Edit
            </button>
          )}
          {isEditing && (
            <button className="save-button" onClick={handleSave}>
              Save Changes
            </button>
          )}
        </div>
        <button className="delete-button" onClick={handleDeleteAccount}>
          Delete Account
        </button>
        {message && <p className="message">{message}</p>}
      </div>
    </div>
  );
};

export default ProfilePage;
