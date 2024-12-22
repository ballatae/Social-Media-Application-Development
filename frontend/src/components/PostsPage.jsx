import React from "react";
import { useNavigate } from "react-router-dom";
import "./PostsPage.css";

const PostsPage = ({ username, handleLogout }) => {
  const navigate = useNavigate();

  const logout = () => {
    handleLogout();
    navigate("/");
  };

  return (
    <div className="page-container">
      <nav className="navbar">
        <div className="navbar-left">
          <span className="active">Home</span>
        </div>
        <div className="navbar-right">
          <button className="profile-button" onClick={() => navigate("/profile")}>
            Profile
          </button>
          <button className="logout-button" onClick={logout}>
            Logout
          </button>
        </div>
      </nav>
      <div className="content">
        <h2>Hello, {username}</h2>
      </div>
    </div>
  );
};

export default PostsPage;
