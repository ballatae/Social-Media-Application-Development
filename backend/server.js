const express = require("express");
const bodyParser = require("body-parser");
const redis = require("redis");
const cors = require("cors");


const app = express();
app.use(bodyParser.json());
app.use(cors());

// Redis connection
const redisClient = redis.createClient();
redisClient.on("connect", () => {
  console.log("Connected to Redis");
});


app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
