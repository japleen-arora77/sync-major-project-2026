import React, { useState, useRef, useEffect,useCallback } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./resumeAudit.css";
import Navbar from "./navbar.jsx";
import Footer from "./footer.jsx";
import axios from "../api/axios.js";

const ResumeAudit = () => {
  const [analysisData, setAnalysisData] = useState(null);
  const scoreRef = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [openSkills, setOpenSkills] = useState([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const fileInputRef = useRef();

  // Hardcoded Data
  // const analysisData = {
  //   resume_score: 80,
  //   missing_skills: [
  //     {
  //       name: "Ruby",
  //       reason:
  //         "Ruby is frequently required for backend-heavy roles and Rails-based systems. Your resume does not demonstrate experience in Ruby-based development."
  //     },
  //     {
  //       name: "PHP",
  //       reason:
  //         "Several legacy enterprise systems still rely on PHP. Adding PHP knowledge improves compatibility with traditional backend stacks."
  //     },
  //     {
  //       name: "AWS",
  //       reason:
  //         "Cloud deployment and infrastructure management using AWS is highly demanded. Your resume lacks cloud deployment exposure."
  //     }
  //   ],
  
  //   recommended_certifications: [
  //     {
  //       title: "Full Stack Development",
  //       description:
  //         "Strengthens your frontend and backend integration skills including modern frameworks and API architecture."
  //     },
  //     {
  //       title: "Cloud Computing",
  //       description:
  //         "Validates your understanding of scalable cloud infrastructure, deployment pipelines and DevOps fundamentals."
  //     }
  //   ],
  
  //   recommended_projects: {
  //     major: [
  //       {
  //         title: "E-commerce Website",
  //         description:
  //           "A scalable full-stack platform with authentication, payments and admin dashboard.",
  //         tech: ["React", "Node.js", "MongoDB", "Stripe"]
  //       },
  //       {
  //         title: "Social Media Platform",
  //         description:
  //           "Real-time content sharing application with messaging and notification system.",
  //         tech: ["React", "Firebase", "Express", "Socket.io"]
  //       }
  //     ],
  
  //     minor: [
  //       {
  //         title: "To-Do List App",
  //         description:
  //           "Task tracking application with CRUD functionality and local storage persistence.",
  //         tech: ["React", "CSS", "LocalStorage"]
  //       },
  //       {
  //         title: "Personal Portfolio Website",
  //         description:
  //           "Professional portfolio website to showcase projects and skills.",
  //         tech: ["React", "Bootstrap"]
  //       }
  //     ]
  //   }
  // };
  

  // Upload simulation
  const simulateUpload = () => {
    setUploading(true);
    let value = 0;
    const interval = setInterval(() => {
      value += 5;
      setProgress(value);
      if (value >= 100) {
        clearInterval(interval);
        setUploading(false);
      }
    }, 100);
  };

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setProgress(0);
    setShowResult(false);
    simulateUpload();
  };

  const handleChange = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files[0]);
  };

  const removeFile = () => {
    setFile(null);
    setProgress(0);
    setUploading(false);
    setShowResult(false);
    setScore(0);
    setHasAnimated(false);
  };

  // Handle Analyze Click
  const handleAnalyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setShowResult(false);
    const formData = new FormData();
    formData.append("resume", file);
    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/accounts/resume-analysis/",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access")}`,
          },
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        setAnalysisData(data.analysis);
        setShowResult(true);
      } else {
        console.error("Error:", data);
      }
    } catch (error) {
      console.error("API Error:", error);
    }
    setAnalyzing(false);
  };
  
  // Score Animation
  const animateScore = useCallback(() => {
    if (!analysisData) return;
  
    let current = 0;
    const target = analysisData?.resume_score || 0;
  
    const interval = setInterval(() => {
      current += 2;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      setScore(current);
    }, 20);
  },[analysisData]);
  

  const toggleSkill = (skillName) => {
    setOpenSkills((prev) => {
      if (prev.includes(skillName)) {
        console.log("Removing:", skillName);
        return prev.filter((s) => s !== skillName);
      } else {
        console.log("Adding:", skillName);
        return [...prev, skillName];
      }
    });
  };
  

  useEffect(() => {
    const currentRef = scoreRef.current; 
    if (!showResult) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && !hasAnimated) {
          animateScore();
          setHasAnimated(true);
        }
      },
      { threshold: 0.5 } // 50% visible
    );
    if (scoreRef.current) {
      observer.observe(currentRef);
    }
  
    return () => {
      if (scoreRef.current) {
        observer.unobserve(currentRef);
      }
    };
  }, [showResult, hasAnimated, animateScore]);

  useEffect(() => {
    const fetchSavedAnalysis = async () => {
      try {
        const response = await axios.get("/accounts/resume-analysis/");
        setAnalysisData(response.data.analysis);
        setShowResult(true);
        setHasAnimated(false);
  
        if (response.data.resume_name) {
          setFile({ name: response.data.resume_name }); // fake file object
          setProgress(100);
        }
  
      } catch (error) {
        console.log("No previous resume analysis found.");
      }
    };
  
    fetchSavedAnalysis();
  }, []);
  
  




  return (
    <div>
      <Navbar />
      <div className="resume-card mt-5 p-3">
        <h1 className="mb-4">Upload Resume</h1>

        {/* Upload Area */}
        <div
          className="upload-area"
          onClick={() => !file && fileInputRef.current.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          {file && progress === 100 ? (
            <div className="uploaded-file text-center">
              <i className="bi bi-file-earmark-text-fill file-icon mb-2" ></i>
              <h6 className="mb-1">{file.name}</h6>
              <small className="text-success">
                Uploaded Successfully
              </small>
              <div className="mt-3">
                  <button
                    className="btn btn-sm analyze-btn me-2"
                    onClick={(e) => {
                      e.stopPropagation();
                     handleAnalyze();
                   }}
                   disabled={analyzing}
                 >
                   {analyzing ? "Analyzing..." : "Analyze"}
                 </button>
                 <button
                    className="btn btn-sm remove-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile();
                    }}
                    disabled={analyzing}
                 >
                    Remove
                  </button>
                </div>
              {analyzing && (
                <div className="ai-loader-container text-center">
                 <div className="dot-loader">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p className="loader-text small">
                    Analyzing your resume and calculating score…
                  </p>
                </div>
                )}
            </div>
          ) : (
            <>
              <div className="upload-icon mb-3">
                <i className="bi bi-cloud-arrow-up"></i>
              </div>
              <p className="mb-1">
                <strong>Drop your resume here</strong> or browse
              </p>
              <small className="text-muted">
                Supports PDF, DOC, DOCX
              </small>
            </>
          )}

          <input
            type="file"
            className="d-none"
            ref={fileInputRef}
            onChange={handleChange}
          />
        </div>

        {/* Upload Progress */}
        {file && uploading && (
          <div className="mt-4">
            <div className="progress custom-progress">
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="text-end small mt-1">
              Uploading... {progress}%
            </div>
          </div>
        )}
      </div>

      {/*  RESULTS SECTION  */}
      {showResult && (
  <div className="analysis-wrapper mt-5">

    {/* SCORE CARD */}
    <div ref={scoreRef} className="analysis-card p-4 mb-4">
      <div className="row align-items-center">
        <div className="col-md-8">
          <h2 className="analysis-heading">Resume Score</h2>
          <p className="analysis-desc">
            Calculated by comparing your resume against the target role
            using skills, projects, experience and certifications.
          </p>
        </div>

        <div className="col-md-4 text-md-end text-center mt-3 mt-md-0">
          <div className="score-box">
            <h1>{score}</h1>
            <span>/100</span>
          </div>
          <div className="score-bar mt-2">
            <div
              className="score-progress"
              style={{ width: `${score}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>

    {/* MISSING SKILLS */}
    <div className="analysis-card p-4 mb-4">
  <h2 className="analysis-heading mb-3">Missing Skills</h2>

 
  {analysisData?.missing_skills?.map((skill, index) => {
  console.log("Rendering skill:", skill);
  console.log("Is open?", openSkills.includes(skill.name));
  console.log("Reason value:", skill.reason);

  return (
    <div key={index} className="skill-item mb-3">

      <span
        className={`modern-badge clickable ${
          openSkills.includes(skill.name) ? "active-badge" : ""
        }`}
        onClick={() => toggleSkill(skill.name)}
      >
        {skill.name}
      </span>

      {openSkills.includes(skill.name) && (
        <div className="skill-reason1 mt-2" >
          {skill.reason || "NO REASON FOUND"}
        </div>
      )}

    </div>
  );
})}
</div>



    {/* CERTIFICATIONS */}
    <div className="analysis-card p-4 mb-4">
  <h2 className="analysis-heading mb-3">
    Recommended Certifications
  </h2>

  {analysisData?.recommended_certifications?.map((cert, index) => (
    <div key={index} className="cert-item mb-3">
      <h6 className="fw-semibold mb-1">{cert.title}</h6>
      <p className="text-muted small mb-0 cert-desc">
        {cert.description}
      </p>
    </div>
  ))}
</div>


    {/* PROJECTS */}
    <div className="analysis-card p-4">
  <h2 className="analysis-heading mb-3">
    Recommended Projects
  </h2>

  <div className="row">
    {/* MAJOR */}
    <div className="col-md-6 mb-4">
      <h4 className="sub-heading">Major Projects</h4>

      {analysisData?.recommended_projects?.major.map(
        (proj, index) => (
          <div key={index} className="project-card mb-3">
            <h6 className="fw-semibold">{proj.name}</h6>
            <p className="small text-muted">
              {proj.description}
            </p>

            <div className="d-flex flex-wrap gap-2">
              {proj.tech.map((tech, i) => (
                <span key={i} className="tech-badge">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )
      )}
    </div>

    {/* MINOR */}
    <div className="col-md-6">
      <h4 className="sub-heading">Minor Projects</h4>

      {analysisData?.recommended_projects?.minor.map(
        (proj, index) => (
          <div key={index} className="project-card mb-3">
            <h6 className="fw-semibold">{proj.name}</h6>
            <p className="small text-muted">
              {proj.description}
            </p>

            <div className="d-flex flex-wrap gap-2">
              {proj.tech.map((tech, i) => (
                <span key={i} className="tech-badge">
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )
      )}
    </div>
  </div>
</div>


  </div>
)}
<Footer />
    </div>
  );
};

export default ResumeAudit;
