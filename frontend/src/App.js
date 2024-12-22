// import logo from './logo.svg';
// import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import PostsPage from "./components/PostsPage";

function App() {
  const [loggedInUser, setLoggedInUser] = useState(localStorage.getItem("username") || null);

  const handleLogout = () => {
    localStorage.removeItem("username");
    setLoggedInUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            loggedInUser ? (
              <Navigate to="/posts" />
            ) : (
              <LoginForm setLoggedInUser={setLoggedInUser} />
            )
          }
        />
        <Route
          path="/posts"
          element={
            loggedInUser ? (
              <PostsPage username={loggedInUser} handleLogout={handleLogout} />
            ) : (
              <Navigate to="/" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;