import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./UserProfilePage.css";

const UserProfilePage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { userData } = location.state || {};

    const handleLogout = () => {
        // Add logout functionality
        navigate("/");
    };

    if (!userData) {
        return <p>No user data found.</p>;
    }

    return (
        <div className="page-container">
            <nav className="navbar">
                <div className="navbar-left">
                    <span className="navbar-home" onClick={() => navigate("/")}>
                        Home
                    </span>
                </div>
                <div className="navbar-right">
                    <div className="navbar-buttons">
                        <button
                            className="navbar-button"
                            onClick={() => navigate("/add-post")}
                        >
                            New Post
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

            <div className="user-profile">
                <h1>{userData.username}'s Profile</h1>
                <h2>User Details:</h2>
                <ul>
                    <li>ID: {userData.id}</li>
                    <li>Username: {userData.username}</li>
                </ul>

                <h2>Posts:</h2>
                <p>Below are the posts from {userData.username}:</p>
                <div className="posts-grid">
                    {userData.posts.length > 0 ? (
                        userData.posts.map((post) => (
                            <div key={post.id} className="post-card">
                                <p>{post.text}</p>
                                {post.photo && (
                                    <img
                                        src={`http://localhost:5000${post.photo}`}
                                        alt="Post"
                                        className="post-image"
                                    />
                                )}
                                <p>Created At: {new Date(post.created_at).toLocaleString()}</p>
                            </div>
                        ))
                    ) : (
                        <p>No posts found for this user.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfilePage;
