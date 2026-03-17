import { Routes, Route } from "react-router-dom";
import AdminLogin from "./components/Admin/AdminLogin.jsx";
import AdminDashboard from "./components/Admin/AdminDashboard.jsx";
import LogRegis from "./components/log_regis.jsx";
import Dashboard from "./components/Dashboard.jsx";
import CompleteProfile from "./components/completeProfile.jsx";
import SkillGap from "./components/skillGap.jsx";
import ResumeAudit from "./components/resumeAudit.jsx";
import TimelineRoadmap from "./components/timelineRoadmap.jsx";
import ProtectedRoute from "./utils/protectedRoute.js";
import AdminProtectedRoute from "./utils/AdminProtectedRoute.js";

function App() {
  return (
    <Routes>
      {/*public route anyone can access*/}
      <Route path="/" element={<LogRegis />} />
      <Route path="/admin-login" element={<AdminLogin />} />

      {/*admin dashboard is protected route- accessed only after admin login*/}
      <Route path="/admin-dashboard" element={<AdminProtectedRoute>
        <AdminDashboard />
      </AdminProtectedRoute>} />

      {/*all below are protected routes- accessed only after login*/}
      <Route path="/complete-profile" 
        element={ <ProtectedRoute>
                      <CompleteProfile />
                  </ProtectedRoute>
                } />

      <Route path="/dashboard" 
        element={ <ProtectedRoute>
                      <Dashboard />
                  </ProtectedRoute>
                } />
                
      <Route path="/skill-gap" 
        element={ <ProtectedRoute>
                    <SkillGap />
                  </ProtectedRoute>
              } />

      <Route path="/resume-audit" 
        element={ <ProtectedRoute>
                    <ResumeAudit />
                  </ProtectedRoute>
              } />
      
      <Route path="/timeline-roadmap" 
        element={ <ProtectedRoute>
                    <TimelineRoadmap />
                  </ProtectedRoute>
              } />

    </Routes>
  );
}

export default App;
