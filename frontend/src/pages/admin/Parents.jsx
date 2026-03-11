import { useState, useEffect, useContext } from "react";
import ThemeSelector from "../../components/ThemeSelector";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import "./Dashboard.css";

function Parents() {
    const { user } = useContext(AuthContext);
    const [parents, setParents] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [search, setSearch] = useState("");
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        id: null,
        name: "",
        email: "",
        phone: "",
        password: "",
        status: "active",
        student_ids: [],
        relationships: []
    });

    useEffect(() => {
        fetchParents();
        fetchStudents();
    }, []);

    useEffect(() => {
        if (!loading) {
            fetchParents();
        }
    }, [search]);

    const fetchParents = async () => {
        try {
            const res = await api.get(`/parents${search ? `?search=${encodeURIComponent(search)}` : ""}`);
            setParents(res.data.data || []);
        } catch (error) {
            console.error("Error fetching parents:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStudents = async () => {
        try {
            const response = await api.get("/students?limit=1000");
            setStudents(response.data.data || []);
        } catch (error) {
            console.error("Error fetching students:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            if (editMode) {
                await api.put(`/parents/${formData.id}`, formData);
                alert("Parent updated successfully");
            } else {
                await api.post("/parents", formData);
                alert("Parent added successfully");
            }
            setShowModal(false);
            resetForm();
            fetchParents();
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = async (parent) => {
        // Load full parent data including linked students
        try {
            const res = await api.get(`/parents/${parent.id}`);
            const p = res.data.data;
            setFormData({
                id: p.id,
                name: p.name,
                email: p.email,
                phone: p.phone || "",
                password: "",
                status: p.status,
                student_ids: (p.LinkedStudents || []).map(s => String(s.id)),
                relationships: []
            });
            setEditMode(true);
            setShowModal(true);
        } catch (err) {
            alert("Failed to load parent details");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this parent? This cannot be undone.")) return;
        try {
            await api.delete(`/parents/${id}`);
            alert("Parent deleted successfully");
            fetchParents();
        } catch (error) {
            alert(error.response?.data?.message || "Error deleting parent");
        }
    };

    const resetForm = () => {
        setFormData({
            id: null,
            name: "",
            email: "",
            phone: "",
            password: "",
            status: "active",
            student_ids: [],
            relationships: []
        });
        setEditMode(false);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleStudentChange = (e) => {
        const options = e.target.options;
        const selected = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) selected.push(options[i].value);
        }
        setFormData({ ...formData, student_ids: selected });
    };

    if (loading) {
        return <div className="dashboard-container">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '2rem', lineHeight: 1 }}>👨‍👩‍👧</span>
                        Parent Management
                    </h1>
                    <p>Manage parents and link them to students</p>
                </div>
                <div className="dashboard-header-right">
                    <ThemeSelector />
                    <Link to="/admin/dashboard" className="btn btn-secondary">← Back</Link>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="btn btn-primary"
                    >
                        + Add Parent
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: "2rem" }}>
                <div style={{ padding: "1.5rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="Search by name, email, or phone..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={{ flex: "1", minWidth: "250px" }}
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="stats-grid" style={{ marginBottom: "2rem" }}>
                <div className="stat-card">
                    <div className="stat-icon">👨‍👩‍👧</div>
                    <div className="stat-content">
                        <h3>{parents.length}</h3>
                        <p>Total Parents</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">🔗</div>
                    <div className="stat-content">
                        <h3>{parents.reduce((sum, p) => sum + (p.LinkedStudents?.length || 0), 0)}</h3>
                        <p>Linked Students</p>
                    </div>
                </div>
            </div>

            {/* Parents Table */}
            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">All Parents ({parents.length})</h3>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Linked Students</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parents.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                                        No parents found. Click "+ Add Parent" to create one.
                                    </td>
                                </tr>
                            ) : (
                                parents.map((parent, idx) => (
                                    <tr key={parent.id}>
                                        <td>{idx + 1}</td>
                                        <td><strong>{parent.name}</strong></td>
                                        <td>{parent.email}</td>
                                        <td>{parent.phone}</td>
                                        <td>
                                            {parent.LinkedStudents && parent.LinkedStudents.length > 0 ? (
                                                <ul style={{ margin: 0, paddingLeft: "20px" }}>
                                                    {parent.LinkedStudents.map(s => (
                                                        <li key={s.id}>{s.User?.name} ({s.roll_number})</li>
                                                    ))}
                                                </ul>
                                            ) : (
                                                <span className="badge badge-secondary">None</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge badge-${parent.status === "active" ? "success" : "danger"}`}>
                                                {parent.status}
                                            </span>
                                        </td>
                                        <td>
                                            <div style={{ display: "flex", gap: "0.5rem" }}>
                                                <button
                                                    className="btn btn-sm btn-primary"
                                                    onClick={() => handleEdit(parent)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(parent.id)}
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Parent Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "700px" }}>
                        <div className="modal-header">
                            <h3>{editMode ? "Edit Parent" : "Add New Parent"}</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-sm">×</button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-input"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="form-input"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div className="form-group">
                                        <label className="form-label">Phone *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            className="form-input"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">
                                            Password {editMode ? "(Leave blank to keep current)" : "* (Min 6 chars)"}
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            className="form-input"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required={!editMode}
                                            minLength={editMode ? 0 : 6}
                                        />
                                    </div>
                                </div>

                                {editMode && (
                                    <div className="form-group">
                                        <label className="form-label">Status</label>
                                        <select
                                            name="status"
                                            className="form-select"
                                            value={formData.status}
                                            onChange={handleChange}
                                        >
                                            <option value="active">Active</option>
                                            <option value="blocked">Blocked</option>
                                        </select>
                                    </div>
                                )}

                                <div className="form-group" style={{ marginTop: "1rem" }}>
                                    <label className="form-label">Link Students (Ctrl/Cmd to select multiple)</label>
                                    <select
                                        name="student_ids"
                                        className="form-select"
                                        multiple
                                        value={formData.student_ids}
                                        onChange={handleStudentChange}
                                        style={{ height: "150px" }}
                                    >
                                        {students.map((s) => (
                                            <option key={s.id} value={String(s.id)}>
                                                {s.User?.name} (Roll: {s.roll_number})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="modal-footer">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={saving}>
                                        {saving ? "Saving..." : editMode ? "Update Parent" : "Add Parent"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Parents;
