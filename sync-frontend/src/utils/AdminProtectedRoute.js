import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

const AdminProtectedRoute = ({ children }) => {
    const [isChecking, setIsChecking] = useState(true);
    const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  
    useEffect(() => {
      const adminToken = localStorage.getItem("adminToken");
  
      if (adminToken) {
        setIsAdminAuthenticated(true);
      }
  
      setIsChecking(false);
    }, []);
  
    if (isChecking) return null;
  
    if (!isAdminAuthenticated) {
      return <Navigate to="/admin-login" replace />;
    }
  
    return children;
  };
  
  export default AdminProtectedRoute;