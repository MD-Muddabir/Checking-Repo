import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import api from "../../services/api";
import BackButton from "../../components/common/BackButton";
import "../admin/Dashboard.css";

/**
 * Renders attendance records as mobile-friendly cards (no table on mobile).
 * Table CSS is hidden via mobile-base.css; mobile-card-list is shown instead.
 */
function ViewAttendance() {
    const { user } = useContext(AuthContext);
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [studentData, setStudentData] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(""); // Phase 2: subject filter
    const [subjects, setSubjects] = useState([]);
    const [filterLoading, setFilterLoading] = useState(false);

    useEffect(() => {
        fetchStudentIdAndAttendance();
    }, []);

    const fetchStudentIdAndAttendance = async () => {
        try {
            const studentRes = await api.get(`/students/me`);
            const stu = studentRes.data.data;
            setStudentData(stu);

            // Phase 2: Load subjects for full-course students
            if (stu.is_full_course && stu.Classes && stu.Classes.length > 0) {
                const classId = stu.Classes[0]?.id;
                if (classId) {
                    const subRes = await api.get(`/subjects?class_id=${classId}`);
                    setSubjects(subRes.data.data || []);
                }
            } else if (stu.Subjects && stu.Subjects.length > 0) {
                setSubjects(stu.Subjects);
            }

            const attRes = await api.get(`/attendance/student/${stu.id}/report`);
            setReport(attRes.data.data);
            setLoading(false);
        } catch (err) {
            console.error("Error fetching attendance:", err);
            setError(err.response?.data?.message || "Failed to load attendance report.");
            setLoading(false);
        }
    };

    // Phase 2: Filter attendance by selected subject
    const handleSubjectFilter = async (subjectId) => {
        setSelectedSubject(subjectId);
        if (!studentData) return;
        setFilterLoading(true);
        try {
            let url = `/attendance/student/${studentData.id}/report`;
            if (subjectId) url += `?subject_id=${subjectId}`;
            const attRes = await api.get(url);
            setReport(attRes.data.data);
        } catch (err) {
            console.error("Error filtering attendance:", err);
        } finally {
            setFilterLoading(false);
        }
    };

    // Status icon helper
    const statusIcon = (s) => {
        if (s === "present")  return "✅";
        if (s === "absent")   return "❌";
        if (s === "holiday")  return "🏖️";
        if (s === "half_day") return "🌗";
        return "📝";
    };

    const markedByLabel = (t) => {
        if (t === "biometric")  return "🔐 Bio";
        if (t === "mobile_otp") return "📱 OTP";
        if (t === "qr_code")    return "📸 QR";
        return "📝 Manual";
    };

    if (loading) return (
        <div className="dashboard-container mobile-loading-page">
            <div className="spinner"></div>
            <p>Loading your attendance…</p>
        </div>
    );
    if (error) return <div className="dashboard-container" style={{ color: "red" }}>{error}</div>;

    // Phase 1: Use working_days (excludes holidays) for the percentage display
    const workingDays    = report?.summary?.working_days || 0;
    const presentDays    = report?.summary?.present_days || 0;
    const holidayDays    = report?.summary?.holiday_days || 0;
    const absentDays     = report?.summary?.absent_days || 0;
    const attendancePct  = report?.summary?.attendance_percentage || 0;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>📋 My Attendance</h1>
                    <p>Track your daily attendance — working days exclude holidays</p>
                </div>
                <BackButton to="/student/dashboard" />
            </div>

            {/* Phase 2: Subject Filter Chips (mobile-friendly horizontal scroll) */}
            {subjects.length > 0 && (
                <div className="subject-filter filter-chips mobile-slide-in">
                    <button
                        onClick={() => handleSubjectFilter("")}
                        className={`chip ${selectedSubject === "" ? "active" : ""}`}
                    >
                        All Subjects
                    </button>
                    {subjects.map(sub => (
                        <button
                            key={sub.id}
                            onClick={() => handleSubjectFilter(sub.id)}
                            className={`chip ${selectedSubject === sub.id ? "active" : ""}`}
                        >
                            {sub.name}
                        </button>
                    ))}
                </div>
            )}

            {/* Stats Grid — 2 col on mobile */}
            {report && (
                <div className="stats-grid card-stagger" style={{ marginBottom: "1.5rem" }}>
                    {/* Working Days */}
                    <div className="stat-card">
                        <div className="stat-icon">🏢</div>
                        <div className="stat-content">
                            <h3>{workingDays}</h3>
                            <p>Working Days</p>
                            <small>excl. {holidayDays} holiday{holidayDays !== 1 ? "s" : ""}</small>
                        </div>
                    </div>
                    {/* Days Present */}
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-content">
                            <h3 style={{ color: "#10b981" }}>{presentDays}</h3>
                            <p>Days Present</p>
                        </div>
                    </div>
                    {/* Days Absent */}
                    <div className="stat-card">
                        <div className="stat-icon">❌</div>
                        <div className="stat-content">
                            <h3 style={{ color: "#ef4444" }}>{absentDays}</h3>
                            <p>Days Absent</p>
                        </div>
                    </div>
                    {/* Attendance % */}
                    <div className="stat-card" style={{ borderLeft: `4px solid ${attendancePct >= 75 ? "#10b981" : "#ef4444"}` }}>
                        <div className="stat-icon">📊</div>
                        <div className="stat-content">
                            <h3 style={{ color: attendancePct >= 75 ? "#10b981" : "#ef4444" }}>{attendancePct}%</h3>
                            <p>Attendance %</p>
                            <small style={{ color: attendancePct >= 75 ? "#10b981" : "#ef4444", fontWeight: 600 }}>
                                {attendancePct >= 75 ? "✓ Good" : "⚠ Below 75%"}
                            </small>
                        </div>
                    </div>
                </div>
            )}

            {/* Attendance Records Section */}
            <div className="card mobile-slide-in">
                <div className="card-header">
                    <h3 className="card-title">
                        Attendance Records
                        {selectedSubject && subjects.find(s => s.id === selectedSubject) && (
                            <span style={{ marginLeft: "0.5rem", fontSize: "0.82rem", fontWeight: 400, color: "#888" }}>
                                — {subjects.find(s => s.id === selectedSubject)?.name}
                            </span>
                        )}
                    </h3>
                    {filterLoading && <span style={{ fontSize: "0.8rem", color: "#888" }}>Loading…</span>}
                </div>

                {/* ── DESKTOP TABLE (hidden on mobile via mobile-base.css) ── */}
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Subject / Class</th>
                                <th>Status</th>
                                <th>Time In</th>
                                <th>Marked By</th>
                                <th>Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {!report || report.records.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem", color: "#888" }}>
                                        {selectedSubject ? "No attendance records for this subject." : "No attendance records available."}
                                    </td>
                                </tr>
                            ) : (
                                report.records.map((record) => (
                                    <tr key={record.id}>
                                        <td>{new Date(record.date).toLocaleDateString()}</td>
                                        <td>{record.Subject?.name || record.Class?.name || "All Subjects"}</td>
                                        <td>
                                            <span className={`badge badge-${record.status === "present" ? "success" : record.status === "absent" ? "error" : record.status === "holiday" ? "info" : "warning"}`}>
                                                {record.status?.replace("_", " ")}
                                            </span>
                                            {record.is_late && (
                                                <span style={{ marginLeft: "0.4rem", fontSize: "0.75rem", color: "#f59e0b", fontWeight: 600 }}>
                                                    +{record.late_by_minutes}m late
                                                </span>
                                            )}
                                        </td>
                                        <td style={{ fontSize: "0.85rem", color: "#888" }}>
                                            {record.time_in ? record.time_in.substring(0, 5) : "—"}
                                        </td>
                                        <td style={{ fontSize: "0.8rem" }}>
                                            {markedByLabel(record.marked_by_type)}
                                        </td>
                                        <td style={{ color: "#888", fontSize: "0.85rem" }}>{record.remarks || "—"}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── MOBILE CARD LIST (shown on mobile, hidden on desktop) ── */}
                <div className="mobile-table-card card-stagger">
                    {!report || report.records.length === 0 ? (
                        <div className="empty-state-mobile">
                            <div className="empty-icon">📋</div>
                            <div className="empty-title">No Records Found</div>
                            <div className="empty-desc">
                                {selectedSubject ? "No attendance records for this subject." : "No attendance records available yet."}
                            </div>
                        </div>
                    ) : (
                        report.records.map((record) => (
                            <div
                                key={record.id}
                                className={`att-mobile-card ${record.status || ""}`}
                            >
                                <div className="att-card-left">
                                    <div className="att-card-date">
                                        {new Date(record.date).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                                    </div>
                                    <div className="att-card-subject">
                                        {record.Subject?.name || record.Class?.name || "All Subjects"}
                                    </div>
                                    {record.remarks && (
                                        <div style={{ fontSize: "12px", color: "#888", marginTop: "2px" }}>{record.remarks}</div>
                                    )}
                                </div>
                                <div className="att-card-right">
                                    <span className={`badge badge-${record.status === "present" ? "success" : record.status === "absent" ? "error" : record.status === "holiday" ? "info" : "warning"}`}>
                                        {statusIcon(record.status)} {record.status?.replace("_", " ")}
                                    </span>
                                    {record.time_in && (
                                        <div className="att-card-time">{record.time_in.substring(0, 5)}</div>
                                    )}
                                    {record.is_late && (
                                        <div style={{ fontSize: "11px", color: "#f59e0b", fontWeight: 700 }}>
                                            +{record.late_by_minutes}m late
                                        </div>
                                    )}
                                    <div className="att-card-time">{markedByLabel(record.marked_by_type)}</div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default ViewAttendance;
