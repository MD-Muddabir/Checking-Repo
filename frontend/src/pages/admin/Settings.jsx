/**
 * Settings Page
 * Manage institute details and user security
 */

import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./Dashboard.css";

function Settings() {
    const { user } = useContext(AuthContext);
    const [activeTab, setActiveTab] = useState("institute"); // 'institute' or 'security'
    const [loading, setLoading] = useState(false);

    // Institute Details State
    const [institute, setInstitute] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        logo: ""
    });

    // Password Change State
    const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });

    useEffect(() => {
        if (user && user.institute_id) {
            fetchInstituteDetails();
        }
    }, [user]);

    const fetchInstituteDetails = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/institutes/${user.institute_id}`);
            setInstitute(res.data.data);
        } catch (error) {
            console.error("Error fetching institute details", error);
        } finally {
            setLoading(false);
        }
    };

    const handleInstituteUpdate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/institutes/${user.institute_id}`, institute);
            alert("Institute details updated successfully");
        } catch (error) {
            alert(error.response?.data?.message || "Error updating settings");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            alert("New passwords do not match");
            return;
        }
        try {
            await api.post("/auth/change-password", {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            alert("Password changed successfully");
            setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            alert(error.response?.data?.message || "Error changing password");
        }
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>⚙️ Settings</h1>
                </div>
                <Link to="/admin/dashboard" className="btn" style={{ backgroundColor: "#6b7280", color: "white" }}>
                    ← Back to Dashboard
                </Link>
            </div>

            <div className="tabs" style={{ marginBottom: "20px", borderBottom: "1px solid #ddd" }}>
                <button
                    className={`tab-btn ${activeTab === "institute" ? "active" : ""}`}
                    onClick={() => setActiveTab("institute")}
                    style={{
                        padding: "10px 20px",
                        border: "none",
                        background: "none",
                        borderBottom: activeTab === "institute" ? "2px solid #6366f1" : "none",
                        fontWeight: activeTab === "institute" ? "bold" : "normal",
                        cursor: "pointer"
                    }}
                >
                    Institute Details
                </button>
                <button
                    className={`tab-btn ${activeTab === "security" ? "active" : ""}`}
                    onClick={() => setActiveTab("security")}
                    style={{
                        padding: "10px 20px",
                        border: "none",
                        background: "none",
                        borderBottom: activeTab === "security" ? "2px solid #6366f1" : "none",
                        fontWeight: activeTab === "security" ? "bold" : "normal",
                        cursor: "pointer"
                    }}
                >
                    Security
                </button>
            </div>

            <div className="card" style={{ maxWidth: "800px" }}>
                <div style={{ padding: "1.5rem" }}>
                    {activeTab === "institute" ? (
                        <form onSubmit={handleInstituteUpdate}>
                            <h3 style={{ marginBottom: "1rem" }}>Institute Information</h3>
                            <div className="form-group">
                                <label className="form-label">Institute Name</label>
                                <input
                                    type="text"
                                    className="form-input"
                                    value={institute.name}
                                    onChange={e => setInstitute({ ...institute, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Email Address</label>
                                <input
                                    type="email"
                                    className="form-input"
                                    value={institute.email}
                                    readOnly
                                    style={{ backgroundColor: "#f3f4f6", cursor: "not-allowed" }}
                                    title="Contact Super Admin to change email"
                                />
                                <small style={{ color: "#6b7280", fontSize: "0.8rem" }}>
                                    Email cannot be changed directly. Contact support for updates.
                                </small>
                            </div>
                            <div className="form-group">
                                <label className="form-label">Phone Number</label>
                                <input
                                    type="tel"
                                    className="form-input"
                                    value={institute.phone || ""}
                                    onChange={e => setInstitute({ ...institute, phone: e.target.value })}
                                    placeholder="+91 9876543210"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-input"
                                    rows="3"
                                    value={institute.address || ""}
                                    onChange={e => setInstitute({ ...institute, address: e.target.value })}
                                    placeholder="Full address"
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: "1rem" }}>
                                Save Changes
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handlePasswordChange}>
                            <h3 style={{ marginBottom: "1rem" }}>Change Password</h3>
                            <div className="form-group">
                                <label className="form-label">Current Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwords.oldPassword}
                                    onChange={e => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwords.newPassword}
                                    onChange={e => setPasswords({ ...passwords, newPassword: e.target.value })}
                                    required
                                    minLength="6"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={passwords.confirmPassword}
                                    onChange={e => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                    required
                                    minLength="6"
                                />
                            </div>
                            <button type="submit" className="btn btn-danger" style={{ marginTop: "1rem" }}>
                                Update Password
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Settings;
