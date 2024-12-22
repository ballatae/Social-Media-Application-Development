import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./PostsPage.css";

const PostsPage = ({ username, handleLogout }) => {
    const [posts, setPosts] = useState([]);
    const [searchTerm, setSearchTerm] = useState(""); 
    const [originalPosts, setOriginalPosts] = useState([]);
    const [searchError, setSearchError] = useState("")
    const navigate = useNavigate();

    useEffect(() => {
        fetch("http://localhost:5000/api/getPosts")
            .then((res) => res.json())
            .then((data) => {
                setPosts(data);
                setOriginalPosts(data); // in order to save the order of the posts
            })
            .catch((err) => console.error("Error fetching posts:", err));
    }, []);

    // Adjust content padding dynamically
    useEffect(() => {
        const navbarHeight = document.querySelector(".navbar").offsetHeight;
        document.querySelector(".content").style.paddingTop = `${navbarHeight}px`;
    }, []);

    const logout = () => {
        handleLogout();
        navigate("/");
    };

    const toggleLike = async (postId) => {
      try {
          const res = await fetch("http://localhost:5000/api/toggleLike", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ postId, username }),
          });
  
          const data = await res.json(); 
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


// Search for a user by username
const handleSearch = async () => {
    setSearchError(""); // Reset error message
    try {
        const res = await fetch(
            `http://localhost:5000/api/getUserDetails?username=${searchTerm}`
        );

        if (res.status === 404) {
            setSearchError("User not found!");
            shakeInput();
            return;
        }

        const data = await res.json();

        if (res.status === 200) {
            navigate(`/user/${searchTerm}`, { state: { userData: data } });

        }
    } catch (error) {
        console.error("Error searching for user:", error);
        setSearchError("Error fetching user.");
    }
};



// Shake effect for the input field
const shakeInput = () => {
    const input = document.querySelector(".search-input");
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 500);
};


const sortByLikes = () => {
    const sortedPosts = [...posts].sort((a, b) => b.likes - a.likes);
    setPosts(sortedPosts);
}

const resetOrder = () => {
    setPosts([...originalPosts]);
}

    return (
        <div className="page-container">
            <nav className="navbar">
              <div className="navbar-left">
                <span className="navbar-home">Home</span>
              </div>
              <div className="navbar-right">
                <h2 className="navbar-hello">Hello, {username}</h2>
                <div className="navbar-buttons">
                 <button className="navbar-button" onClick={() => navigate("/add-post")}>
                    New Post
                 </button>
                  <button className="navbar-button" onClick={() => navigate("/profile")}>
                    Profile
                  </button>
                  <button className="navbar-button logout-button" onClick={logout}>
                    Logout
                 </button>
               </div>
             </div>
            </nav>

            {/* Search bar for user search */}
            <div className="sidebar">
                    <div className="search-bar">
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search by username"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <button className="search-button" onClick={handleSearch}>
                            Search
                        </button>
                        {searchError && (
                            <p className="error-message">{searchError}</p>
                        )}
                        <button className="sort_button" onClick={sortByLikes}>
                            Sort by Likes
                        </button>
                        <button className="reset_button" onClick={resetOrder}>
                            Reset Order
                        </button>
                    </div>
                </div>


            <div className="content">
                

                {/* Display posts */}
                <div className="posts-list">
                {posts.map((post) => {
                        const isLiked = (post.likedBy || []).includes(username); 
                        return (
                            <div key={post.id} className="post-card">
                            <h3 className="post-username">{post.username}</h3>
                            <img src={`http://localhost:5000${post.photo}`} alt="Post" className="post-image"/>
                            <p className="post-text">{post.text}</p>
            
                            <div className="post-info">
                                <span className="likes-counter">{post.likes} Likes</span>
                                <span className="comments-counter">{post.comments || 0} Comments</span>
                            </div>
            
                            <div className="buttons-container">
                                <button className={`like-button ${isLiked ? "liked" : ""}`} onClick={() => toggleLike(post.id)}>
                                    {isLiked ? "Liked" : "Like"}
                                </button>
                                <button className="comment-button" onClick={() => addComment(post.id, post.newComment)}>
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
