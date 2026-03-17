import React, { useEffect, useState } from "react";
import "./adminDashboard.css";
import axios from "../../api/axios";

const UserDetails = ({ userId, onBack }) => {
  
  const formatField = (value) => {
    if (!value) {
      return <span className="not-provided">Not provided</span>;
    }
  
    if (Array.isArray(value)) {
      return value.length > 0
        ? value.join(", ")
        : <span className="not-provided">Not provided</span>;
    }
  
    if (typeof value === "string") {
      return value.trim() !== ""
        ? value
        : <span className="not-provided">Not provided</span>;
    }
  
    return <span className="not-provided">Not provided</span>;
  };
  
  const [user, setUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal]=useState(false);
  const [showUpdateModal,setShowUpdateModal]=useState(false);
  const [adminDeleteWarning, setAdminDeleteWarning]=useState(false);

  const [formData,setFormData]=useState({
    education_level:"",
    stream:"",
    skills:"",
    interests:"",
  });

  const handleUpdateClick = () =>{
    setFormData({
      education_level:user.education_level || "",
      stream:user.stream || "",
      skills:user.skills || "",
      interests:user.interests || ""
    });
    setShowUpdateModal(true);
  };
  const handleChange = (e) =>{
    setFormData({
      ...formData,
      [e.target.name]:e.target.value,
    });
  };

  
    const handleSaveChanges = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const res = await axios.put(
          `/accounts/admin/users/${userId}/update/`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(res.data);
        setShowUpdateModal(false);
      } catch (error) {
        console.error("Error updating user:", error);
      }
    };
  
  const handleDeleteUser =async () =>{
    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(
        `/accounts/admin/users/${userId}/delete/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("User deleted successfully");
      onBack();
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  }
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const res = await axios.get(
          `/accounts/admin/users/${userId}/`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(res.data);
      } catch (error) {
        console.error("Error fetching user details:", error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  if (!user) return <p>Loading user details...</p>;

  return (
    <div className="user-detail-card">
      <button className="back-btn" onClick={onBack}>
        ← Back
      </button>

      <div className="user-header">
        <div className="user-icon large">👤</div>
        <div>
          <h4 style={{color: "var(--green)"}}>{user.full_name}</h4>
          <small style={{color: "var(--dark-grey)"}}>{user.email}</small>
        </div>
      </div>
      


<p>
  <strong style={{color: "var(--dark-green)"}}>Education:</strong>{" "}
  {formatField(user.education_level)}
</p>

<p>
  <strong style={{color: "var(--dark-green)"}}>Stream:</strong>{" "}
  {formatField(user.stream)}
</p>

<p><strong style={{color: "var(--dark-green)"}}>Skills:</strong> {formatField(user.skills)}</p>
<p><strong style={{color: "var(--dark-green)"}}>Interests:</strong> {formatField(user.interests)}</p>

<p>
  <strong style={{color: "var(--dark-green)"}}>Target Job Role:</strong>{" "}
  {formatField(user.target_job, "Not selected yet")}
</p>

<p>
  <strong style={{color: "var(--dark-green)"}}>Date Joined:</strong>{" "}
  {user.date_joined
    ? new Date(user.date_joined).toLocaleDateString()
    : <span className="not-provided">Not available</span>}
</p>

<p>
  <strong style={{color: "var(--dark-green)"}}>Admin:</strong>{" "}
  {user.is_staff ? "Yes" : "No"}
</p>
      <div className="admin-actions">
        <button className="update-btn" onClick={handleUpdateClick}>Update</button>
        <button className="delete-btn" 
          onClick={() => {
            if (user.is_staff) {
              setAdminDeleteWarning(true);
            } else {
            setShowDeleteModal(true)}
          }}>Delete</button>
      </div>

      
        
  {showDeleteModal && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h3 className="modal-head">Delete User</h3>
      <p>Are you sure you want to delete this user?</p>

      <div className="modal-actions">
        <button
          className="cancel-btn btn"
          onClick={() => setShowDeleteModal(false)}
        >
          Cancel
        </button>

        <button
          className="delete-confirm-btn btn"
          onClick={handleDeleteUser}
        >
          Delete
        </button>
      </div>

            </div>
          </div>
        )
      }


{adminDeleteWarning && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h3>Action Not Allowed</h3>
      <p>You cannot delete an admin account.</p>

      <div className="modal-actions">
        <button
          className="cancel-btn"
          onClick={() => setAdminDeleteWarning(false)}
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}


{showUpdateModal && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h3 className="modal-head">Update User Details</h3>

      <input
        type="text"
        name="education_level"
        placeholder="Education"
        value={formData.education_level}
        onChange={handleChange}
      />

      <input
        type="text"
        name="stream"
        placeholder="Stream"
        value={formData.stream}
        onChange={handleChange}
      />

      <input
        type="text"
        name="skills"
        placeholder="Skills"
        value={formData.skills}
        onChange={handleChange}
      />

      <input
        type="text"
        name="interests"
        placeholder="Interests"
        value={formData.interests}
        onChange={handleChange}
      />

      <div className="modal-actions">
        <button
          className="cancel-btn btn"
          onClick={() => setShowUpdateModal(false)}
        >
          Cancel
        </button>
        <button
          className="up-save-btn btn"
          onClick={handleSaveChanges}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}


    </div>
  );
};

export default UserDetails;