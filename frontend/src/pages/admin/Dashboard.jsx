/**
 * Admin Dashboard
 * Main dashboard for institute administrators
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import "./Dashboard.css";

function AdminDashboard() {
    const [stats, setStats] = useState({
        totalStudents: 0,
        totalFaculty: 0,
        totalClasses: 0,
        activeStudents: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get("/admin/stats");
            setStats(response.data.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">Loading...</div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Admin Dashboard</h1>
                <p>Welcome back! Here's what's happening today.</p>
            </div>

            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">👨‍🎓</div>
                    <div className="stat-content">
                        <h3>{stats.totalStudents}</h3>
                        <p>Total Students</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">👩‍🏫</div>
                    <div className="stat-content">
                        <h3>{stats.totalFaculty}</h3>
                        <p>Total Faculty</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                        <h3>{stats.totalClasses}</h3>
                        <p>Total Classes</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>{stats.activeStudents}</h3>
                        <p>Active Students</p>
                    </div>
                </div>
            </div>

            <div className="quick-actions">
                <h2>Quick Actions</h2>
                <div className="action-grid">
                    <Link to="/admin/students" className="action-card">
                        <span className="action-icon">👨‍🎓</span>
                        <span className="action-title">Manage Students</span>
                    </Link>

                    <Link to="/admin/faculty" className="action-card">
                        <span className="action-icon">👩‍🏫</span>
                        <span className="action-title">Manage Faculty</span>
                    </Link>

                    <Link to="/admin/classes" className="action-card">
                        <span className="action-icon">📚</span>
                        <span className="action-title">Manage Classes</span>
                    </Link>

                    <Link to="/admin/subjects" className="action-card">
                        <span className="action-icon">📖</span>
                        <span className="action-title">Manage Subjects</span>
                    </Link>

                    <Link to="/admin/fees" className="action-card">
                        <span className="action-icon">💰</span>
                        <span className="action-title">Fee Management</span>
                    </Link>

                    <Link to="/admin/announcements" className="action-card">
                        <span className="action-icon">📢</span>
                        <span className="action-title">Announcements</span>
                    </Link>

                    <Link to="/admin/settings" className="action-card">
                        <span className="action-icon">⚙️</span>
                        <span className="action-title">Settings</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
