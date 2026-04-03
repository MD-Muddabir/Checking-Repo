import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import BackButton from "../../components/common/BackButton";
import "../admin/Dashboard.css";

function ViewMarks() {
    const { user } = useContext(AuthContext);
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchStudentIdAndMarks();
    }, []);

    const fetchStudentIdAndMarks = async () => {
        try {
            const studentRes = await api.get(`/students/me`);
            const studentId = studentRes.data.data.id;
            const marksRes = await api.get(`/exams/results/${studentId}`);
            setMarks(marksRes.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching marks:", err);
            setError("Failed to load marks.");
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="dashboard-container mobile-loading-page">
            <div className="spinner"></div>
            <p>Loading your marks…</p>
        </div>
    );
    if (error) return <div className="dashboard-container" style={{ color: "red" }}>{error}</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>📝 My Exam Marks</h1>
                    <p>View your performance across all exams</p>
                </div>
                <BackButton to="/student/dashboard" />
            </div>

            <div className="card mobile-slide-in">
                <div className="card-header">
                    <h3 className="card-title">Exam Results</h3>
                </div>

                {/* ── DESKTOP TABLE (hidden on mobile via CSS) ── */}
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Exam Name</th>
                                <th>Subject</th>
                                <th>Date</th>
                                <th>Marks Obtained</th>
                                <th>Total Marks</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {marks.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                                        No marks available yet.
                                    </td>
                                </tr>
                            ) : (
                                marks.map((mark) => {
                                    const passed = parseFloat(mark.marks_obtained) >= parseFloat(mark.Exam.passing_marks);
                                    return (
                                        <tr key={mark.id}>
                                            <td><strong>{mark.Exam?.name}</strong></td>
                                            <td>{mark.Exam?.Subject?.name || "N/A"}</td>
                                            <td>{new Date(mark.Exam?.exam_date).toLocaleDateString()}</td>
                                            <td>
                                                <strong>{mark.marks_obtained}</strong>
                                                <span style={{ color: "#6b7280", fontSize: "0.9em" }}> / {mark.Exam?.total_marks}</span>
                                            </td>
                                            <td>{mark.Exam?.passing_marks}</td>
                                            <td>
                                                <span className={`badge badge-${passed ? "success" : "error"}`}>
                                                    {passed ? "Pass" : "Fail"}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── MOBILE CARD LIST (shown on mobile via CSS) ── */}
                <div className="mobile-table-card card-stagger">
                    {marks.length === 0 ? (
                        <div className="empty-state-mobile">
                            <div className="empty-icon">📝</div>
                            <div className="empty-title">No Marks Yet</div>
                            <div className="empty-desc">No exam results have been published yet.</div>
                        </div>
                    ) : (
                        marks.map((mark) => {
                            const passed = parseFloat(mark.marks_obtained) >= parseFloat(mark.Exam.passing_marks);
                            const pct = mark.Exam?.total_marks
                                ? Math.round((parseFloat(mark.marks_obtained) / parseFloat(mark.Exam.total_marks)) * 100)
                                : 0;
                            return (
                                <div key={mark.id} className="marks-mobile-card">
                                    <div className="marks-info">
                                        <div className="marks-exam-name">{mark.Exam?.name}</div>
                                        <div className="marks-subject">{mark.Exam?.Subject?.name || "N/A"}</div>
                                        {mark.Exam?.exam_date && (
                                            <div className="marks-date">
                                                {new Date(mark.Exam.exam_date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                            </div>
                                        )}
                                    </div>
                                    <div className="marks-score">
                                        <div className="score" style={{ color: passed ? "#10b981" : "#ef4444" }}>
                                            {mark.marks_obtained}<span style={{ fontSize: "0.75rem", fontWeight: 600, color: "#888" }}>/{mark.Exam?.total_marks}</span>
                                        </div>
                                        <div className="score" style={{ fontSize: "0.85rem", color: "#888" }}>{pct}%</div>
                                        <span className={`result ${passed ? "pass" : "fail"}`}>
                                            {passed ? "✓ Pass" : "✗ Fail"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}

export default ViewMarks;
