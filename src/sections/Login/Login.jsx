import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginStyles.module.css";

const Login = () => {
  const [email, setEmail] = useState("admin@admin.com");
  const [password, setPassword] = useState("admin@123");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("authToken", data.token);
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("userEmail", data.email);
        localStorage.setItem("userName", `${data.firstName} ${data.lastName}`);
        localStorage.setItem("userRole", data.role);
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Connection error: Make sure the backend server is running on port 8080");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <div className={styles.loginHeader}>
          <h1>Expense Manager</h1>
          <p>Professional Expense & Loan Management</p>
        </div>

        <form onSubmit={handleLogin} className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.loginBtn}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className={styles.defaultCredentials}>
          <p>📝 Demo Credentials:</p>
          <p><strong>Email:</strong> admin@admin.com</p>
          <p><strong>Password:</strong> admin@123</p>
        </div>
      </div>

      <div className={styles.backgroundGradient}></div>
    </div>
  );
};

export default Login;
