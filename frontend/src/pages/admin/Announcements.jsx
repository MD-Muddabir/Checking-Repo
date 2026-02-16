/**
 * Announcements Management Page
 * Handles creating and listing announcements
 */

import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./Dashboard.css";

function Announcements() {
    const { user } = useContext(AuthContext);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    const [form, setForm] = useState({
        title: "",
        content: "",
        target_audience: "all",
        priority: "normal"
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        try {
            const res = await api.get("/announcements");
            setAnnouncements(res.data.data?.announcements || []);
        } catch (error) {
            console.error("Error fetching announcements", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/announcements", form);
            alert("Announcement created successfully");
            setShowModal(false);
            fetchAnnouncements();
            setForm({
                title: "",
                content: "",
                target_audience: "all",
                priority: "normal"
            });
        } catch (error) {
            alert(error.response?.data?.message || "Error creating announcement");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this announcement?")) return;
        try {
            await api.delete(`/announcements/${id}`);
            alert("Announcement deleted successfully");
            fetchAnnouncements();
        } catch (error) {
            alert(error.response?.data?.message || "Error deleting announcement");
        }
    };

    if (loading) return <div className="dashboard-container">Loading...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>📢 Announcements</h1>
                    <p>Manage institute-wide announcements</p>
                </div>
                {['admin', 'faculty'].includes(user?.role) && (
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                    >
                        + New Announcement
                    </button>
                )}
            </div>

            <div className="card-grid">
                {announcements.length === 0 ? (
                    <div className="card" style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}>
                        <p>No announcements found.</p>
                    </div>
                ) : (
                    announcements.map(ann => (
                        <div key={ann.id} className="card announcement-card">
                            <div className="card-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                                <div>
                                    <span className={`badge badge-${ann.priority === 'urgent' ? 'danger' : ann.priority === 'high' ? 'warning' : 'info'}`}>
                                        {ann.priority}
                                    </span>
                                    <span className="badge badge-secondary" style={{ marginLeft: "0.5rem" }}>
                                        To: {ann.target_audience}
                                    </span>
                                </div>
                                {user?.role === 'admin' && (
                                    <button
                                        className="btn btn-sm btn-danger"
                                        onClick={() => handleDelete(ann.id)}
                                        style={{ padding: "0.2rem 0.5rem" }}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <h3>{ann.title}</h3>
                            <p style={{ whiteSpace: "pre-wrap", color: "#4b5563" }}>{ann.content}</p>
                            <div className="card-footer" style={{ marginTop: "1rem", fontSize: "0.85rem", color: "#9ca3af", borderTop: "1px solid #eee", paddingTop: "0.5rem" }}>
                                Posted by {ann.creator?.name || "Unknown"} on {new Date(ann.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: "500px" }}>
                        <div className="modal-header">
                            <h3>Create Announcement</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-sm">×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Title</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={form.title}
                                        onChange={e => setForm({ ...form, title: e.target.value })}
                                        required
                                        placeholder="e.g. Exam Schedule Release"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Content</label>
                                    <textarea
                                        className="form-input"
                                        rows="4"
                                        value={form.content}
                                        onChange={e => setForm({ ...form, content: e.target.value })}
                                        required
                                        placeholder="Enter full details..."
                                    ></textarea>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Target Audience</label>
                                    <select
                                        className="form-select"
                                        value={form.target_audience}
                                        onChange={e => setForm({ ...form, target_audience: e.target.value })}
                                    >
                                        <option value="all">All (Everyone)</option>
                                        <option value="students">Students Only</option>
                                        <option value="faculty">Faculty Only</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Priority</label>
                                    <select
                                        className="form-select"
                                        value={form.priority}
                                        onChange={e => setForm({ ...form, priority: e.target.value })}
                                    >
                                        <option value="normal">Normal</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn btn-primary">Post Announcement</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Announcements;
