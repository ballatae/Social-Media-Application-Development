import React, { useState } from "react";
import "./AddPostPage.css";

const AddPostPage = ({ username, handleAddPost }) => {
    const [text, setText] = useState("");
    const [photo, setPhoto] = useState(null);
    const [message, setMessage] = useState("");

    const handleSubmit = async () => {
        if (!text.trim() || !photo) {
            setMessage("Text and photo are required.");
            return;
        }

        const formData = new FormData();
        formData.append("username", username);
        formData.append("text", text);
        formData.append("photo", photo);

        try {
            const res = await fetch("http://localhost:5000/api/addPost", {
                method: "POST",
                body: formData,
            });

            const data = await res.text();
            if (res.status === 200) {
                setMessage("Post added successfully!");
                setText("");
                setPhoto(null);
                setTimeout(() => setMessage(""), 3000);
            } else {
                setMessage(data);
            }
        } catch (error) {
            console.error("Error adding post:", error);
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div className="add-post-container">
            <div className="add-post-card">
                <h2>Add New Post</h2>
                <textarea
                    className="add-post-input add-post-textarea"
                    placeholder="Write your post..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    aria-label="Post text"
                />
                <input
                    type="file"
                    className="add-post-input"
                    accept="image/*"
                    onChange={(e) => setPhoto(e.target.files[0])}
                    aria-label="Upload photo"
                />
                <button
                    className={`add-post-button ${
                        !text.trim() || !photo ? "disabled" : ""
                    }`}
                    disabled={!text.trim() || !photo}
                    onClick={handleSubmit}
                >
                    Post
                </button>
                {message && <p className="message">{message}</p>}
            </div>
        </div>
    );
};

export default AddPostPage;
