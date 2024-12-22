import React from "react";
import { useNavigate } from "react-router-dom";

const PostsPage = ({ username, handleLogout }) => {
  const navigate = useNavigate();

  const logout = () => {
    handleLogout();
    navigate("/");
  };

  return (
    <div>
      <h2>Hello, {username}</h2>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

export default PostsPage;
