import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostsPage.css";

const PostsPage = ({ username, handleLogout }) => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch posts from the backend
        fetch("http://localhost:5000/api/getPosts")
            .then((res) => res.json())
            .then((data) => setPosts(data))
            .catch((err) => console.error("Error fetching posts:", err));
    }, []);

    const toggleLike = async (postId) => {
        try {
            const res = await fetch("http://localhost:5000/api/toggleLike", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ postId, username }),
            });

            if (res.status === 200) {
                setPosts((prevPosts) =>
                    prevPosts.map((post) =>
                        post.id === postId
                            ? {
                                  ...post,
                                  likes: post.likedBy.includes(username)
                                      ? post.likes - 1
                                      : post.likes + 1,
                                  likedBy: post.likedBy.includes(username)
                                      ? post.likedBy.filter((user) => user !== username)
                                      : [...post.likedBy, username],
                              }
                            : post
                    )
                );
            }
        } catch (err) {
            console.error("Error toggling like:", err);
        }
    };

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
                <button
                    className="add-post-button"
                    onClick={() => navigate("/add-post")}
                >
                    Add New Post
                </button>
                <div className="posts-list">
                    {posts.map((post) => (
                        <div key={post.id} className="post-card">
                            <img src={post.photo} alt="Post" />
                            <p>{post.text}</p>
                            <button
                                className={`like-button ${
                                    post.likedBy.includes(username) ? "liked" : ""
                                }`}
                                onClick={() => toggleLike(post.id)}
                            >
                                {post.likedBy.includes(username) ? "Unlike" : "Like"}
                            </button>
                            <span>{post.likes} Likes</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default PostsPage;
