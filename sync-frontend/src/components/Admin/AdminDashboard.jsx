import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";
import "./adminDashboard.css";
// import Navbar from "../navbar";
// import Footer from "../footer";
import UserDetails from "./UserDetails";
import axios from "../../api/axios";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const res = await axios.get("/accounts/admin/users/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin-login");
  };

  return (
    <div className="admin-container">
      <div className="container my-5">
    <div className="admin-header">
      <h2 className="admin-title" style={{color: "var(--dark-green)"}}>
        Admin Panel
      </h2>
      
      <button className="btn admin-logout-btn" onClick={handleLogout}>
        Admin Logout
      </button>
      <div></div> {/* empty div for balance */}
    </div>


       

        {loading && <p>Loading users...</p>}

        {/* USER LIST VIEW */}
        {!selectedUserId &&
          users.map((user) => (
            <div
              key={user.id}
              className="admin-user-card"
              onClick={() => setSelectedUserId(user.id)}
            >
              <div className="user-header">
                <div className="user-icon">👤</div>
                <div>
                  <h5 style={{color: "var(--green)"}}>{user.full_name}</h5>
                  <small style={{color: "var(--dark-grey)"}}>{user.email}</small>
                </div>
              </div>
 
              <p className='detail-user'><strong className='detail-user-head' >User ID:</strong> {user.id}</p>
              <p className='detail-user'><strong className='detail-user-head' >Target Job:</strong> {user.target_job}</p>
              <p className='detail-user'><strong className='detail-user-head' >Date Joined:</strong> {user.date_joined}</p>
              <p className='detail-user'><strong className='detail-user-head' >Admin:</strong>{" "} {user.is_staff ? "Yes" : "No"}</p>
            </div>
          ))}

        {/* DETAIL VIEW */}
        {selectedUserId && (
          <UserDetails
            userId={selectedUserId}
            onBack={() => setSelectedUserId(null)}
          />
        )}
      </div>


    </div>
  );
};

export default AdminDashboard;