import React, { useState } from "react";
import "./log_regis.css";
import api from "../api/axios";
import { saveAuthData } from "../utils/auth";
import { useNavigate } from "react-router-dom";

const LogRegis = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); //to showing loader 
  const [isRegister, setIsRegister] = useState(false);
  const [authAction, setAuthAction] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [fullName,setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  //Register handler
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthAction("register");
    setError(""); 
    setLoading(true);
    try {
      await api.post("/accounts/register/", {
        full_name: fullName,
        email,
        password,
      });
      setIsRegister(true); // switch to login after success
    } catch (err) {
      setError("Registration failed");
    } finally{
      setLoading(false);
      setAuthAction(null);
    }
  };
  //Login handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthAction("login");
    setError("");
    setLoading(true);
    try {
      const response = await api.post("/accounts/login/", {
        email,
        password,
      });
      saveAuthData(response.data);
      console.log(response.data);
      const { profile_completed, target_job } = response.data;
      if(!response.data.profile_completed){
        navigate("/complete-profile");
      }
      else if(response.data.target_job){
        navigate("/skill-gap");
      }
      else{
        navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError("Invalid email or password");
    } finally {
      setLoading(false);
      setAuthAction(null);
    }
  };

  


  return (
    <div className="auth-container">
      <div className={`auth-card ${isRegister ? "register-mode" : ""}`}>

        {/* LEFT PANEL */}
        <div className="auth-left">
          <h2>{isRegister ? "Welcome Back!" : "Hello, Friend!"}</h2>
          <h4>
            {isRegister
              ? "To keep connected with us please login with your personal info"
              : "Enter your personal details and start your journey with us"}
          </h4>
          <br/>
          <p>
            {isRegister
                ?"Not have an account. Click Below"
                :"Already Have an account. Click below"
            }
          </p>
          <button
            className="btn log-btn1"
            onClick={() => setIsRegister(!isRegister)}
          >          
            {isRegister ? "REGISTER" : "LOGIN"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="auth-right">
        {error && <p className="text-danger">{error}</p>}
          {!isRegister ? (
            <>
            {/* <div className="project-name">Sync</div> */}
              <h2>Create Account on Sync</h2>

              <form onSubmit={handleRegister}>
                <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                <input type="email" placeholder="Email"  value={email} onChange={(e) => setEmail(e.target.value)} required />

                {/* PASSWORD FIELD */}
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
                          {/* disabled loading to prevent double click */}
                <button className="btn log-btn" type="submit"  disabled={loading} >
                   {loading ? "Creating account…" : "REGISTER"}
                </button><br/>
                <button type="button" className="btn switch-btn" onClick={() => setIsRegister(true)}>
                        Already have an account? Login
                </button>



                {loading && (
  <div className="inline-loader">
    <div className="dot-loader small">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <p className="loader-text">
      {authAction === "login"
        ? "Verifying credentials…"
        : "Setting things up…"}
    </p>
  </div>
)}

{/*  Always visible admin option */}
<div className="admin-login-link">
  <p>
    Are you an admin?{" "}
    <span onClick={() => navigate("/admin-login")}>
      Admin Login
    </span>
  </p>
</div>

              </form>
            </>
          ) : (
            <>
            {/* <div className="project-name">Sync</div> */}
              <h2>Login to Sync</h2>

              <form onSubmit={handleLogin}>
                <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required/>

                {/* PASSWORD FIELD */}
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
                              {/* disabled loading to prevent double click */}
                <button className="btn log-btn" type="submit"  disabled={loading} >
                {loading ? "Logging in…" : "LOGIN"}
                </button><br/>
                <button type="button" className="btn switch-btn" onClick={() => setIsRegister(false)}>
                        Don’t have an account? Register
                </button>
                {loading && (
  <div className="inline-loader">
    <div className="dot-loader small">
      <span></span>
      <span></span>
      <span></span>
    </div>
    <p className="loader-text">
      {authAction === "login"
        ? "Verifying credentials…"
        : "Setting things up…"}
    </p>
  </div>
)}

              </form>
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default LogRegis;
