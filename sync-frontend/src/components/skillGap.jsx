import React, { useEffect, useRef, useState } from "react";
import "./skillGap.css";
import Roadmap from "./roadmap.jsx";
import OverallReadiness from "./overallReadiness.jsx";
import "./footer.jsx";
import Footer from "./footer.jsx";
import axios from "../api/axios.js";
import Navbar from "./navbar.jsx";
 
const SkillGap = () => {
  const [loading, setLoading] = useState(true); //to showing loader 
  const [apiError, setApiError] = useState(""); // if ai error is there..
    const [animatedProgress, setAnimatedProgress] = useState({}); //progress bar animation
    const sectionRef = useRef(null);
    const [openReason, setOpenReason] = useState([]);
   //STATES (from backend)
   const [currentSkills, setCurrentSkills] = useState([]);
   const [requiredSkills, setRequiredSkills] = useState([]);
   const [skillsAnalysis, setSkillsAnalysis] = useState([]);

    const getBarClass = (priority) => {
    if (priority === "high") return "progress-bar high";
    if (priority === "medium") return "progress-bar medium";
    return "progress-bar low";
  };

  // FETCH SKILL GAP DATA from backend
  useEffect(() => {
    const fetchSkillGap = async () => { 
      try {
        setLoading(true);
        const res = await axios.get("/accounts/career-analysis/");
        const data = res.data;
        setCurrentSkills(data.current_skills || []);
        setSkillsAnalysis(data.skill_gap || []);
        // fetch required skills from skill_gap
        setRequiredSkills(
          data.skill_gap ? data.skill_gap.map((s) => s.name) : []
        );
      } catch (error) {
        console.error("Skill gap API error:", error);
        setApiError("Failed to load skill analysis, please try again");
      } finally{
        setLoading(false);
      }
    };
    fetchSkillGap();
  }, []);

  useEffect(() => {
    if (!skillsAnalysis.length) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const progressMap = {};
          skillsAnalysis.forEach((skill) => {
            progressMap[skill.name] = skill.confidence;
          });
          setAnimatedProgress(progressMap);
          observer.disconnect(); // animate only once
        }
      },
      { threshold: 0.3 }
    );
    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, [skillsAnalysis]);
  if (loading) {
    return (
      <div className="ai-loader-container">
        <div className="dot-loader">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <p className="loader-text">Analyzing your skills…</p>
      </div>
    );
  }
  
  if (apiError) {
    return (
      <div className="loading-container">
        <p className="text-danger">{apiError}</p>
      </div>
    );
  }
  

  return (
        <div className='skill-container'>  
          {/*Navbar*/}
          <Navbar />

            <div className="container  my-5" >
              <h1 className="text-center mb-3 skill-head">Skill Gap Analysis</h1>
                {/* Top cards */}
                <div className="row mb-5">
                    <div className="col-md-6 mb-3 mb-md-0">
                      <div className="skill-card">
                        <h3>Current Skills</h3>
                        <ul>
                          {currentSkills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="col-md-6">
                      <div className="skill-card">
                        <h3>Required Skills</h3>
                        <ul>
                          {requiredSkills.map((skill, index) => (
                            <li key={index}>{skill}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                </div>
                {/* Confidence Section */}
                <h3 className="mb-3 skill-head" ref={sectionRef}>Confidence Percentage</h3>
                <div className="row">
                  {["high", "medium", "low"].map((level) => (
                    <div className="col-md-4" key={level}>
                      <h5 className="priority-title"  >
                         {level.charAt(0).toUpperCase() + level.slice(1)} Priority Skills
                      </h5>
                          {skillsAnalysis.filter((skill) => skill.priority === level).map((skill, index) => (
                            <div className="mb-3" key={index}>
                              <div className="skill-label d-flex justify-content-between">
                                <span>{skill.name}</span>
                                    <span className="reason-toggle"
                                    // onClick={() => setOpenReason(openReason === skill.name ? null : skill.name)}  
                                    onClick={() => {
                                      if (openReason.includes(skill.name)) {
                                        setOpenReason(openReason.filter((name) => name !== skill.name));
                                      } else {
                                        setOpenReason([...openReason, skill.name]);
                                      }
                                    }}
                                    
                                    >
                                      
                                      {openReason.includes(skill.name) ? "Hide reason" : "Read reason"}
                                      
                                    </span>
                              </div>
                            <div className="progress">
                              <div className={getBarClass(skill.priority)} style={{ width: `${animatedProgress[skill.name] || 0}%` }}>
                                <span className="progress-text">
                                    {animatedProgress[skill.name] || 0}%
                                </span>
                              </div>
                            </div>
                            <div className={`skill-reason ${openReason.includes(skill.name) ? "open" : ""}`}>
                              {skill.reason}
                            </div>
                          </div>
                        ))}
                    </div>
                  ))}
                </div>

                

                {/*Overall Readiness of user againts target job role*/}
                <h1 className="text-center mb-3 mt-5 skill-head">Overall Readiness</h1>
                  <OverallReadiness />


                {/*Roadmap to attain target job role*/}
                <h1 className="text-center mb-3 mt-5 skill-head">Learning Roadmap</h1>
                  <Roadmap />
            </div>

          {/*Footer*/}
          <Footer />
        </div>
  );
};

export default SkillGap;
