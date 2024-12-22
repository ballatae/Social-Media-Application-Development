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

    const query = "INSERT INTO posts (username, text, photo, likedBy, comments) VALUES (?, ?, ?, ?, ?)";
    db.query(query, [username, text, photoPath, '[]', '[]'], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal server error.");
        }
        res.status(200).send("Post added successfully.");
    });
});



//add comment
app.post("/api/addComment", (req, res) => {
    const { postId, comment } = req.body;

    if (!postId || !comment) {
        return res.status(400).send("Post ID and comment are required.");
    }

    const getCommentsQuery = "SELECT comments FROM posts WHERE id = ?";
    db.query(getCommentsQuery, [postId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal server error.");
        }

        if (results.length === 0) {
            return res.status(404).send("Post not found.");
        }

        const existingComments = JSON.parse(results[0].comments || "[]");
        existingComments.push(comment);

        const updateCommentsQuery = "UPDATE posts SET comments = ? WHERE id = ?";
        db.query(updateCommentsQuery, [JSON.stringify(existingComments), postId], (err, results) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Internal server error.");
            }
            res.status(200).send("Comment added successfully.");
        });
    });
});

//like
app.post("/api/toggleLike", (req, res) => {
    const { postId, username } = req.body;

    const queryGetLikes = "SELECT likes, likedBy FROM posts WHERE id = ?";
    db.query(queryGetLikes, [postId], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal server error.");
        }

        if (results.length === 0) {
            return res.status(404).send("Post not found.");
        }

        const { likes, likedBy } = results[0];
        const likedByArray = likedBy ? JSON.parse(likedBy) : [];

        if (likedByArray.includes(username)) {
            const updatedLikedBy = likedByArray.filter(user => user !== username);
            const queryUpdateLikes = "UPDATE posts SET likes = ?, likedBy = ? WHERE id = ?";
            db.query(queryUpdateLikes, [likes - 1, JSON.stringify(updatedLikedBy), postId], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Internal server error.");
                }
                res.status(200).send("Like removed.");
            });
        } else {
            likedByArray.push(username);
            const queryUpdateLikes = "UPDATE posts SET likes = ?, likedBy = ? WHERE id = ?";
            db.query(queryUpdateLikes, [likes + 1, JSON.stringify(likedByArray), postId], (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send("Internal server error.");
                }
                res.status(200).send("Like added.");
            });
        }
    });
});


// Start server
app.listen(5000, () => {
    console.log("Server running on port 5000");
});
