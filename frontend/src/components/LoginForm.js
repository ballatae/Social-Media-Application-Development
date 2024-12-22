import React, { useState } from "react";

const LoginForm = ({ setLoggedInUser }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);

  const handleLogin = async () => {
    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.text();
    if (res.status === 200) {
      localStorage.setItem("username", username);
      setLoggedInUser(username);
    } else {
      setMessage(data);
    }
  };

  const handleRegister = async () => {
    try {
      console.log("Sending register request:", { username, password }); // Debug log
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
  
      const data = await res.text();
      console.log("Register response:", res.status, data); // Debug log
  
      if (res.status === 200) {
        setMessage("Registration successful! Please log in.");
        setIsRegistering(false); // Switch back to login mode
      } else {
        setMessage(data);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      setMessage("An error occurred. Please try again.");
    }
  };
  

  return (
    <div>
      <h2>{isRegistering ? "Register" : "Login"}</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {isRegistering ? (
        <button onClick={handleRegister}>Register</button>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
      <p>{message}</p>
      <p>
        {isRegistering ? (
          <span>
            Already have an account?{" "}
            <button onClick={() => setIsRegistering(false)}>Login</button>
          </span>
        ) : (
          <span>
            Don't have an account?{" "}
            <button onClick={() => setIsRegistering(true)}>Register</button>
          </span>
        )}
      </p>
    </div>
  );
};

export default LoginForm;