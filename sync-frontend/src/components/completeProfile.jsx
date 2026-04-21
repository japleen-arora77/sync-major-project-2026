import React, { useState,useEffect } from "react";
import TagInput from "./tagInput.jsx";
import "./completeProfile.css";
import api from '../api/axios.js';
import { useNavigate } from "react-router-dom";


const CompleteProfile = () => {
  const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [education, setEducation] = useState("");
    const [stream, setStream] = useState("");
    const [skills, setSkills] = useState([]);
    const [interests, setInterests] = useState([]);
    const [targetJob, setTargetJob] = useState("");
    const [error, setError] = useState("");
/* 🔹 Autofill name & email from login */
useEffect(() => {
  setFullName(localStorage.getItem("full_name") || "");
  setEmail(localStorage.getItem("email") || "");
}, []);
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await api.get("/accounts/profile/");
      const data = res.data;
      setFullName(data.full_name || "");
      setEmail(data.email || "");
      setEducation(data.education_level || "");
      setStream(data.stream || "");
      setSkills(data.skills || []);
      setInterests(data.interests || []);
      setTargetJob(data.target_job || "");
    } catch (err) {
      console.error("Failed to load profile", err);
    }
  };
  fetchProfile();
}, []);

    const isValidEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      };
    const calculateCompletion = () => {
    let completed = 0;
    if (fullName) completed++;
    if (isValidEmail(email)) completed++;
    if (education) completed++;
    if (stream) completed++;
    if (skills.length > 0) completed++;
    if (interests.length > 0) completed++;
    return Math.round((completed / 6) * 100);
  };
  const completion = calculateCompletion();
  const handleSave = async (e) => {
    e.preventDefault();
    setError("");

    if (!education || !stream || skills.length === 0 || interests.length === 0) {
      setError("Please complete all required fields");
      return;
    }
    try {
      await api.put("/accounts/complete-profile/", {
        education_level: education,
        stream,
        skills,
        interests,
        target_job:targetJob,
      });

      localStorage.setItem("profile_completed", "true");
      localStorage.setItem("target_job",targetJob);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setError("Failed to save profile. Try again.");
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-card m-5">
      <div className="profile-header">
  <h2 className="text-left">Complete Profile</h2>

  <div className="progress-circle">
    <svg width="70" height="70">
      <circle
        cx="35"
        cy="35"
        r="30"
        stroke="#eee"
        strokeWidth="6"
        fill="none"
      />
      <circle
        cx="35"
        cy="35"
        r="30"
        stroke="var(--green)"
        strokeWidth="6"
        fill="none"
        strokeDasharray="188.5"
        strokeDashoffset={188.5 - (188.5 * completion) / 100}
        strokeLinecap="round"
        transform="rotate(-90 35 35)"
      />
    </svg>

    <span>{completion}%</span> 
  </div>
</div>

{error && <p className="text-danger">{error}</p>}
        <form onSubmit={handleSave}>
            <div className="row">
                <div className="col-lg-6 col-md-6 col-sm-12">
                    <div className="form-group">
                        <label style={{color:'var(--dark-grey)'}}>Full Name *</label>
                        <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
                    </div>
                </div>
                <div className="col-lg-6 col-md-6 col-sm-12">
                    <div className="form-group">
                        <label style={{color:'var(--dark-grey)'}}>Email *</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                </div>
            </div>
            
          

          

          {/* Education */}
          <div className="form-group">
  <label style={{color:'var(--dark-grey)'}}>Education Level *</label>

  <div className="radio-group-inline">
    <label className="radio-inline" style={{color:'var(--dark-grey)'}}>
    <input
  type="radio"
  name="education"
  value="UG"
  checked={education === "UG"}
  onChange={(e) => setEducation(e.target.value)}
/>
      <span>UG</span>
    </label>

    <label className="radio-inline" style={{color:'var(--dark-grey)'}}>
      <input
        type="radio"
        name="education"
        value="PG"
        onChange={(e) => setEducation(e.target.value)}
      />
      <span>PG</span>
    </label>
  </div>
</div>



          {/* Stream */}
          <div className="form-group">
            <label style={{color:'var(--dark-grey)'}}>Stream *</label>
            <input type="text"  value={stream} onChange={(e) => setStream(e.target.value)} placeholder="e.g. Computer Science" required />
          </div>
 
          {/* Skills */}
          <div className="form-group">
            <label style={{color:'var(--dark-grey)'}}>Skills (max 5) *</label>
            <TagInput tags={skills} setTags={setSkills} limit={5} />
          </div>

          

          {/* Interests */}
          <div className="form-group">
            <label style={{color:'var(--dark-grey)'}}>Interests (max 5) *</label>
            <TagInput tags={interests} setTags={setInterests} limit={5} />
          </div>



          {/* Target Job */}
          <div className="form-group">
            <label style={{color:'var(--dark-grey)'}}>Target Job Role (optional)</label>
            <input type="text"  value={targetJob} onChange={(e) => setTargetJob(e.target.value)} placeholder="e.g. Frontend Developer" />
          </div>

          <button className="btn save-btn">Save Profile</button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;
