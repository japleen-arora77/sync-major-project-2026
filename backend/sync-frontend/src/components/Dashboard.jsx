import React, { useEffect,useState } from "react";
import "./dashboard.css";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [showJobs, setShowJobs] = useState(false);
  const [selectedJobIndex, setSelectedJobIndex] = useState(null);
  const [jobRoles, setJobRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{
    const checkTargetJob = async()=>{
      try{
        const res=await api.get("/accounts/profile");
        if(res.data.target_job){
          navigate("/skill-gap", {replace:true});
        }
      }
      catch(err){
        console.error("Profile check failed",err);
      }
    };
    checkTargetJob();
  },[]);

  const fetchJobSuggestions  = async () => {
    setShowJobs(true);
    setLoading(true); 

    try {
      const response = await api.get("http://127.0.0.1:8000/api/accounts/suggest-jobs/");
      setJobRoles(response.data.job_roles);
    } catch (error) {
      console.error("Failed to fetch job roles", error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmJob = async () => {
    if (selectedJobIndex === null) {
      alert("Please select a job role first");
      return;
    }
  
    const selectedJob = jobRoles[selectedJobIndex];
  
    try {
      await api.put("/accounts/complete-profile/", {
        target_job: selectedJob.role,
      });
  
      // redirect to skill gap page
      navigate("/skill-gap");
    } catch (error) {
      console.error("Failed to save target job", error);
      alert("Something went wrong while saving job role");
    }
  };
  

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h3>You haven’t selected any job role yet</h3>

        <button
          className="btn suggest-btn"
          onClick={fetchJobSuggestions}
        >
          Suggest job roles
        </button>

        {showJobs && (
          <div className="job-list">
             {loading && <p style={{ textAlign: "center" }}>Loading job roles...</p>}

            { !loading && 
            jobRoles.map((job, index) => (
              <div key={index} className={`job-item ${selectedJobIndex === index ? "selected" : ""}`} 
                    onClick={() => setSelectedJobIndex(index)}>

                <div className="job-header">
                  <strong>
                    {index + 1}. {job.role}
                  </strong>

                  {selectedJobIndex === index && (
                    <span className="tick">✓</span>
                  )}
                </div>

                <p>{job.description}</p>
              </div>

            ))
            }
            {!loading && jobRoles.length > 0 && (
              <button className="btn suggest-btn" onClick={handleConfirmJob}>
                Confirm and Proceed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
