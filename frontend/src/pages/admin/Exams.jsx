/**
 * Exams Management Page
 * Handles creation and listing of exams
 * Supports single subject OR "All Subjects (Full Course)" bulk exam creation
 */

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import ThemeSelector from "../../components/ThemeSelector";
import "./Dashboard.css";

function Exams() {
    const [exams, setExams] = useState([]);
    const [classes, setClasses] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showModal, setShowModal] = useState(false);

    // "single" = one subject, "all" = all subjects for the class
    const [subjectMode, setSubjectMode] = useState("single");

    const [formData, setFormData] = useState({
        name: "",
        subject_id: "",
        class_id: "",
        exam_date: "",
        total_marks: "",
        passing_marks: "",
    });

    useEffect(() => {
        fetchExams();
        fetchClasses();
        fetchSubjects();
    }, []);

    const fetchExams = async () => {
        try {
            const response = await api.get("/exams");
            setExams(response.data.data.exams || []);
        } catch (error) {
            console.error("Error fetching exams:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClasses = async () => {
        try {
            const response = await api.get("/classes");
            setClasses(response.data.data || []);
        } catch (error) {
            console.error("Error fetching classes:", error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const response = await api.get("/subjects");
            setSubjects(response.data.data || []);
        } catch (error) {
            console.error("Error fetching subjects:", error);
        }
    };

    // Subjects for selected class
    const availableSubjects = formData.class_id
        ? subjects.filter((s) => s.class_id === parseInt(formData.class_id))
        : [];

    // Selected class info
    const selectedClass = classes.find((c) => c.id === parseInt(formData.class_id));

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleClassChange = (e) => {
        setFormData({
            ...formData,
            class_id: e.target.value,
            subject_id: "", // Reset subject when class changes
        });
        // Reset mode when class changes to avoid stale selections
        setSubjectMode("single");
    };

    const handleModeChange = (mode) => {
        setSubjectMode(mode);
        if (mode === "all") {
            setFormData((prev) => ({ ...prev, subject_id: "" }));
        }
    };

    const resetForm = () => {
        setFormData({
            name: "",
            subject_id: "",
            class_id: "",
            exam_date: "",
            total_marks: "",
            passing_marks: "",
        });
        setSubjectMode("single");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.class_id) {
            alert("Please select a class.");
            return;
        }

        if (subjectMode === "single" && !formData.subject_id) {
            alert("Please select a subject.");
            return;
        }

        if (subjectMode === "all" && availableSubjects.length === 0) {
            alert("No subjects are available for the selected class.");
            return;
        }

        setSubmitting(true);

        try {
            if (subjectMode === "single") {
                // Create one exam
                await api.post("/exams", formData);
                alert("Exam created successfully!");
            } else {
                // Create one exam per subject (bulk)
                const results = [];
                const errors = [];

                for (const subject of availableSubjects) {
                    try {
                        await api.post("/exams", {
                            name: formData.name,
                            subject_id: subject.id,
                            class_id: formData.class_id,
                            exam_date: formData.exam_date,
                            total_marks: formData.total_marks,
                            passing_marks: formData.passing_marks,
                        });
                        results.push(subject.name);
                    } catch (err) {
                        errors.push(`${subject.name}: ${err.response?.data?.message || "Failed"}`);
                    }
                }

                if (errors.length === 0) {
                    alert(
                        `✅ ${results.length} exam(s) created successfully!\n\nSubjects: ${results.join(", ")}`
                    );
                } else if (results.length > 0) {
                    alert(
                        `⚠️ Partial success:\n✅ Created: ${results.join(", ")}\n❌ Failed: ${errors.join("; ")}`
                    );
                } else {
                    alert(`❌ Failed to create exams:\n${errors.join("\n")}`);
                }
            }

            setShowModal(false);
            resetForm();
            fetchExams();
        } catch (error) {
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this exam?")) return;
        try {
            await api.delete(`/exams/${id}`);
            alert("Exam deleted successfully");
            fetchExams();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to delete exam");
        }
    };

    if (loading) {
        return <div className="dashboard-container">Loading...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>📝 Manage Exams</h1>
                    <p>Schedule and manage exams for your institute</p>
                </div>
                <div className="dashboard-header-right">
                    <ThemeSelector />
                    <Link to="/admin/dashboard" className="btn btn-secondary">
                        ← Back
                    </Link>
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="btn btn-primary btn-animated"
                    >
                        + Add Exam
                    </button>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">All Exams ({exams.length})</h3>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Exam Name</th>
                                <th>Subject</th>
                                <th>Class</th>
                                <th>Date</th>
                                <th>Total Marks</th>
                                <th>Passing Marks</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exams.length === 0 ? (
                                <tr>
                                    <td colSpan="7" style={{ textAlign: "center", padding: "2rem" }}>
                                        No exams found
                                    </td>
                                </tr>
                            ) : (
                                exams.map((exam) => {
                                    const classInfo = classes.find((c) => c.id === exam.class_id);
                                    return (
                                        <tr key={exam.id}>
                                            <td>
                                                <strong>{exam.name}</strong>
                                            </td>
                                            <td>{exam.Subject?.name || "N/A"}</td>
                                            <td>
                                                {classInfo
                                                    ? `${classInfo.name} ${classInfo.section || ""}`
                                                    : "N/A"}
                                            </td>
                                            <td>{new Date(exam.exam_date).toLocaleDateString()}</td>
                                            <td>{exam.total_marks}</td>
                                            <td>{exam.passing_marks}</td>
                                            <td>
                                                <button
                                                    onClick={() => handleDelete(exam.id)}
                                                    className="btn btn-sm btn-danger"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ── Create Exam Modal ── */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div
                        className="modal"
                        onClick={(e) => e.stopPropagation()}
                        style={{ maxWidth: "520px" }}
                    >
                        <div className="modal-header">
                            <h3>Create Exam</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-sm">
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit}>
                                {/* Exam Name */}
                                <div className="form-group">
                                    <label className="form-label">Exam Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        placeholder="e.g., Mid-Term, PT 1, Annual"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Class */}
                                <div className="form-group">
                                    <label className="form-label">Class *</label>
                                    <select
                                        name="class_id"
                                        className="form-select"
                                        value={formData.class_id}
                                        onChange={handleClassChange}
                                        required
                                    >
                                        <option value="">Select a class</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name} {c.section && `- ${c.section}`}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Subject Mode Selector — only show after class is selected */}
                                {formData.class_id && (
                                    <div className="form-group">
                                        <label className="form-label">Subject *</label>

                                        {/* Mode Toggle Pills */}
                                        <div className="exam-subject-mode-toggle">
                                            <button
                                                type="button"
                                                className={`exam-mode-btn ${subjectMode === "single" ? "active" : ""}`}
                                                onClick={() => handleModeChange("single")}
                                            >
                                                📖 Single Subject
                                            </button>
                                            <button
                                                type="button"
                                                className={`exam-mode-btn ${subjectMode === "all" ? "active" : ""}`}
                                                onClick={() => handleModeChange("all")}
                                                disabled={availableSubjects.length === 0}
                                                title={
                                                    availableSubjects.length === 0
                                                        ? "No subjects assigned to this class"
                                                        : `Create exams for all ${availableSubjects.length} subjects`
                                                }
                                            >
                                                📚 All Subjects (Full Course)
                                            </button>
                                        </div>

                                        {/* Single Subject Dropdown */}
                                        {subjectMode === "single" && (
                                            <select
                                                name="subject_id"
                                                className="form-select"
                                                value={formData.subject_id}
                                                onChange={handleChange}
                                                required
                                                disabled={availableSubjects.length === 0}
                                                style={{ marginTop: "0.5rem" }}
                                            >
                                                <option value="">
                                                    {availableSubjects.length === 0
                                                        ? "No subjects in this class"
                                                        : "Select a subject"}
                                                </option>
                                                {availableSubjects.map((s) => (
                                                    <option key={s.id} value={s.id}>
                                                        {s.name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {/* All Subjects Preview */}
                                        {subjectMode === "all" && (
                                            <div className="exam-all-subjects-preview" style={{ marginTop: "0.5rem" }}>
                                                {availableSubjects.length > 0 ? (
                                                    <>
                                                        <p className="exam-all-subjects-info">
                                                            ✅ {availableSubjects.length} exam(s) will be created — one per subject for{" "}
                                                            <strong>
                                                                {selectedClass?.name}
                                                                {selectedClass?.section ? ` - ${selectedClass.section}` : ""}
                                                            </strong>
                                                        </p>
                                                        <div className="exam-subjects-tag-list">
                                                            {availableSubjects.map((s) => (
                                                                <span key={s.id} className="exam-subject-tag">
                                                                    {s.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </>
                                                ) : (
                                                    <p className="exam-all-subjects-warn">
                                                        ⚠️ No subjects found for this class. Please assign subjects first.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Exam Date */}
                                <div className="form-group">
                                    <label className="form-label">Exam Date *</label>
                                    <input
                                        type="date"
                                        name="exam_date"
                                        className="form-input"
                                        value={formData.exam_date}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                {/* Marks Row */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                                    <div className="form-group">
                                        <label className="form-label">Total Marks *</label>
                                        <input
                                            type="number"
                                            name="total_marks"
                                            className="form-input"
                                            min="1"
                                            value={formData.total_marks}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Passing Marks *</label>
                                        <input
                                            type="number"
                                            name="passing_marks"
                                            className="form-input"
                                            min="0"
                                            max={formData.total_marks || 100}
                                            value={formData.passing_marks}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="btn btn-secondary"
                                        disabled={submitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={submitting}
                                    >
                                        {submitting
                                            ? "Creating..."
                                            : subjectMode === "all"
                                            ? `Create ${availableSubjects.length} Exam(s)`
                                            : "Create Exam"}
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

export default Exams;
