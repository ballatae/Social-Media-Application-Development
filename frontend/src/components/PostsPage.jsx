import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostsPage.css";

const PostsPage = ({ username, handleLogout }) => {
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
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
  
          const data = await res.json(); // Parse JSON response
          if (res.status === 200) {
              setPosts((prevPosts) =>
                  prevPosts.map((post) =>
                      post.id === postId
                          ? {
                                ...post,
                                likes: data.message === "Like added."
                                    ? post.likes + 1
                                    : post.likes - 1,
                                likedBy: data.message === "Like added."
                                    ? [...(post.likedBy || []), username]
                                    : (post.likedBy || []).filter((user) => user !== username),
                            }
                          : post
                  )
              );
          } else {
              console.error("Error toggling like:", data.message);
          }
      } catch (err) {
          console.error("Error toggling like:", err);
      }
  };
  
  const addComment = async (postId, comment) => {
    if (!comment || !postId) {
        console.error("Comment and Post ID are required.");
        return;
    }
    try {
        const res = await fetch("http://localhost:5000/api/addComment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ postId, username, comment }),
        });

        if (res.status === 200) {
            setPosts((prevPosts) =>
                prevPosts.map((post) =>
                    post.id === postId
                        ? {
                              ...post,
                              commentsList: [...(post.commentsList || []), comment],
                          }
                        : post
                )
            );
        } else {
            console.error("Failed to add comment.");
        }
    } catch (err) {
        console.error("Error adding comment:", err);
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
                <button className="add-post-button" onClick={() => navigate("/add-post")}>
                    Add New Post
                </button>
                <div className="posts-list">
                {posts.map((post) => {
    const isLiked = (post.likedBy || []).includes(username); 
    return (
        <div key={post.id} className="post-card">
            <h3 className="post-username">{post.username}</h3>
            <img
                src={`http://localhost:5000${post.photo}`}
                alt="Post"
                className="post-image"
            />
            <p className="post-text">{post.text}</p>
            
            <div className="post-info">
                <span className="likes-counter">{post.likes} Likes</span>
                <span className="comments-counter">{post.comments || 0} Comments</span>
            </div>
            
            <div className="buttons-container">
                <button
                    className={`like-button ${isLiked ? "liked" : ""}`}
                    onClick={() => toggleLike(post.id)}
                >
                    {isLiked ? "Liked" : "Like"}
                </button>
                <button
                    className="comment-button"
                    onClick={() => addComment(post.id, post.newComment)}
                >
                    Comment
                </button>
            </div>
            
            <input
                type="text"
                placeholder="Write a comment..."
                className="comment-input"
                onChange={(e) =>
                    setPosts((prevPosts) =>
                        prevPosts.map((p) =>
                            p.id === post.id ? { ...p, newComment: e.target.value } : p
                        )
                    )
                }
            />

            <div className="comments-section">
                <p className="comments-header">Comments:</p>
                {post.commentsList && post.commentsList.length > 0 ? (
                    post.commentsList.map((comment, index) => (
                        <p key={index} className="comment-text">
                            {comment.username}: {comment.text}
                        </p>
                    ))
                ) : (
                    <p className="no-comments">No comments</p>
                )}
            </div>
        </div>
    );
})}


</div>



            </div>
        </div>
    );
};

export default PostsPage;
