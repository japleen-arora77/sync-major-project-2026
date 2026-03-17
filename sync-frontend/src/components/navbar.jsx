import React from "react";
import { useNavigate } from "react-router-dom"; 
import { logout } from "../utils/auth"; 
import "./navbar.css";

const Navbar = () =>{
    const navigate = useNavigate();
    const careerAnalysisPage = () => {
        navigate("/skill-gap");
      };
    const resumeAuditPage = () => {
        navigate("/resume-audit");
      };
      const timelineRoadmap = () =>{
        navigate("/timeline-roadmap");
      };
      const handleLogout = () => {
        logout();
        navigate("/", { replace: true });
      };
      const handleUpdateProfile = () => {
        navigate("/complete-profile");
      };

    return(
        <div>
            <nav className="navbar skill-navbar"> 
              <div className="container-fluid px-4 d-flex justify-content-between align-items-center">
                {/* Logo */}
                  <span className="navbar-brand skill-logo">
                    <span>Sync</span>
                  </span>
                {/* PROFILE DROPDOWN */}
                <div className="dropdown profile-dropdown">
                  <button className="profile-icon-btn" type="button" data-bs-toggle="dropdown" aria-expanded="false" >
                    <i className="bi bi-person-circle"></i>
                  </button>
                    <ul className="dropdown-menu dropdown-menu-end">
                     <li>
                        <button className="dropdown-item" onClick={careerAnalysisPage}>
                          Career Analysis 
                        </button>
                      </li>
                      <li>   {/* resume evaluator other option*/}
                        <button className="dropdown-item" onClick={resumeAuditPage}>
                          Resume Audit 
                        </button>
                      </li>
                      <li>   {/* resume evaluator other option*/}
                        <button className="dropdown-item" onClick={timelineRoadmap}>
                          Timeline Based Roadmap
                        </button>
                      </li>
                      <li>
                        <button className="dropdown-item" onClick={handleUpdateProfile}>
                          Update Profile
                        </button>
                      </li>
                      <li><hr className="dropdown-divider" /></li>
                      <li>
                        <button className="dropdown-item logout-item" onClick={handleLogout}>
                          Logout
                        </button>
                      </li>
                    </ul>
                </div>
              </div>
          </nav>    
        </div>

    )
}
export default Navbar;