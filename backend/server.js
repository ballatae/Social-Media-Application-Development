const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const cors = require("cors");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, "uploads"));
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});
const upload = multer({ storage: storage });

// MySQL connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "ArtAmbika23",
    database: "social_app", 
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.stack);
        return;
    }
    console.log("Connected to MySQL database.");
});


// Registration endpoint
app.post("/api/register", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("Username and password are required.");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = "INSERT INTO users (username, password) VALUES (?, ?)";
        db.query(query, [username, hashedPassword], (err, results) => {
            if (err) {
                if (err.code === "ER_DUP_ENTRY") {
                    return res.status(400).send("User already exists.");
                }
                console.error(err);
                return res.status(500).send("Internal server error.");
            }
            res.send("User registered successfully.");
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error creating user.");
    }
});

// Login endpoint
app.post("/api/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).send("Username and password are required.");
    }

    const query = "SELECT * FROM users WHERE username = ?";
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal server error.");
        }

        if (results.length === 0) {
            return res.status(401).send("Invalid credentials.");
        }

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).send("Invalid credentials.");
        }

        res.send("Login successful.");
    });
});


// update acc endqpoint
app.post("/api/updateProfile", (req, res) => {
    const { oldUsername, newUsername } = req.body;
  
    const query = "UPDATE users SET username = ? WHERE username = ?";
    db.query(query, [newUsername, oldUsername], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal server error.");
      }
      if (results.affectedRows === 0) {
        return res.status(400).send("User not found.");
      }
      res.status(200).send("Profile updated successfully.");
    });
  });


//delete acount endpoint
app.delete("/api/deleteAccount", (req, res) => {
    const { username } = req.body;
  
    const query = "DELETE FROM users WHERE username = ?";
    db.query(query, [username], (err, results) => {
      if (err) {
        console.error(err);
        return res.status(500).send("Internal server error.");
      }
      if (results.affectedRows === 0) {
        return res.status(400).send("User not found.");
      }
      res.status(200).send("Account deleted successfully.");
    });
  });
  
//add post
app.post("/api/addPost", upload.single("photo"), (req, res) => {
    const { username, text } = req.body;

    if (!username || !text) {
        return res.status(400).send("Username and text are required.");
    }

    // If a photo is uploaded, save its path
    const photoPath = req.file ? `/uploads/${req.file.filename}` : null;

    const query = "INSERT INTO posts (username, text, photo) VALUES (?, ?, ?)";
    db.query(query, [username, text, photoPath], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal server error.");
        }
        res.status(200).send("Post added successfully.");
    });
});



//add comment
app.post("/api/addComment", (req, res) => {
    const { postId, username, comment } = req.body;

    if (!postId || !username || !comment) {
        return res.status(400).send("Post ID, username, and comment are required.");
    }

    const query = "INSERT INTO comments (post_id, username, comment) VALUES (?, ?, ?)";
    db.query(query, [postId, username, comment], (err) => {
        if (err) {
            console.error("Error adding comment:", err);
            return res.status(500).send("Internal server error.");
        }
        res.status(200).send("Comment added successfully.");
    });
});


//like
app.post("/api/toggleLike", (req, res) => {
    const { postId, username } = req.body;

    const queryGetLikes = "SELECT * FROM likes WHERE post_id = ? AND username = ?";
    db.query(queryGetLikes, [postId, username], (err, results) => {
        if (err) {
            console.error("Error checking like:", err);
            return res.status(500).json({ message: "Internal server error." });
        }

        if (results.length > 0) {
            // Unlike the post
            const queryDelete = "DELETE FROM likes WHERE post_id = ? AND username = ?";
            db.query(queryDelete, [postId, username], (err) => {
                if (err) {
                    console.error("Error unliking post:", err);
                    return res.status(500).json({ message: "Internal server error." });
                }
                res.status(200).json({ message: "Like removed." });
            });
        } else {
            // Like the post
            const queryInsert = "INSERT INTO likes (post_id, username) VALUES (?, ?)";
            db.query(queryInsert, [postId, username], (err) => {
                if (err) {
                    console.error("Error liking post:", err);
                    return res.status(500).json({ message: "Internal server error." });
                }
                res.status(200).json({ message: "Like added." });
            });
        }
    });
});





// Get all posts
app.get("/api/getPosts", (req, res) => {
    const query = `
    SELECT 
        posts.id,
        posts.username,
        posts.text,
        posts.photo,
        COUNT(likes.id) AS likes,
        COUNT(comments.id) AS comments,
        GROUP_CONCAT(CONCAT(comments.username, ':', comments.comment) SEPARATOR '|') AS commentsList
    FROM posts
    LEFT JOIN likes ON posts.id = likes.post_id
    LEFT JOIN comments ON posts.id = comments.post_id
    GROUP BY posts.id
    ORDER BY posts.created_at DESC;
`;

db.query(query, (err, results) => {
    if (err) {
        console.error("Error fetching posts:", err);
        return res.status(500).send("Internal server error.");
    }

    const formattedResults = results.map((post) => ({
        ...post,
        commentsList: post.commentsList
            ? post.commentsList.split('|').map((comment) => {
                  const [username, text] = comment.split(':');
                  return { username, text };
              })
            : [],
    }));

    res.status(200).json(formattedResults);
});

});


// Delete Post 
app.delete("/api/deletePost", (req, res) => {
    const { postId } = req.body;

    if (!postId) {
        return res.status(400).send("Post ID is required.");
    }

    const query = "DELETE FROM posts WHERE id = ?";
    db.query(query, [postId], (err, results) => {
        if (err) {
            console.error("Error deleting post:", err);
            return res.status(500).send("Internal server error.");
        }

        if (results.affectedRows === 0) {
            return res.status(404).send("Post not found.");
        }

        res.status(200).send("Post deleted successfully.");
    });
});


// Get user details and posts
app.get("/api/getUserDetails", (req, res) => {
    const { username } = req.query;

    if (!username) {
        return res.status(400).send("Username is required.");
    }

    const userQuery = `
        SELECT id, username 
        FROM users 
        WHERE username = ?;
    `;
    const postsQuery = `
        SELECT id, text, photo, created_at 
        FROM posts 
        WHERE username = ?;
    `;

    db.query(userQuery, [username], (err, userResults) => {
        if (err || userResults.length === 0) {
            return res.status(404).send("User not found.");
        }

        const user = userResults[0];
        db.query(postsQuery, [username], (err, postResults) => {
            if (err) {
                return res.status(500).send("Error fetching user posts.");
            }

            user.posts = postResults; // Add posts to the user data
            res.status(200).json(user);
        });
    });
});



// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
