import React, { useState } from "react";
import "../log_regis.css";
import axios from "../../api/axios.js"; 
import { useNavigate } from "react-router-dom";

const AdminLogin = () => { 
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post("/accounts/admin/login/", {
        email,
        password,
      });
      // Save admin token
      localStorage.setItem("adminToken", res.data.access);
      navigate("/admin-dashboard");
    } catch (err) {
      setError("Invalid admin credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-mode">

        {/* LEFT PANEL */}
        <div className="auth-left">
          <h2>Admin Access</h2>
          <h4>Login to manage users and monitor the system.</h4>
          <br/>
          <p>Not an admin?</p>
          <button
            className="btn log-btn1"
            onClick={() => navigate("/")}
          >
            Go to User Login
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right">
          <h2>Admin Login</h2>

          {error && <p className="text-danger">{error}</p>}

          <form onSubmit={handleAdminLogin}>
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="password-field">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <i
                className={`bi ${showPassword ? "bi-eye" : "bi-eye-slash"}`}
                onClick={() => setShowPassword(!showPassword)}
              ></i>
            </div>

            <button className="btn log-btn" type="submit" disabled={loading}>
              {loading ? "Logging in…" : "LOGIN"}
            </button>

            {loading && (
              <div className="inline-loader">
                <div className="dot-loader small">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p className="loader-text">
                  Verifying admin credentials…
                </p>
              </div>
            )}
          </form>
        </div>

      </div>
    </div>
  );
};

export default AdminLogin;