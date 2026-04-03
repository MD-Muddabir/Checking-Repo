/**
 * Admin Assignments — Phase 8 Professional Dashboard
 * Stats overview, filter by class/subject/faculty, export, overdue & pending-grading views
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import '../faculty/Assignments.css';
import './Dashboard.css';

const STATUS_CONFIG = {
    draft:     { label: 'Draft',     color: '#6b7280', bg: '#f3f4f6', icon: '✏️' },
    published: { label: 'Published', color: '#2563eb', bg: '#eff6ff', icon: '📢' },
    closed:    { label: 'Closed',    color: '#dc2626', bg: '#fee2e2', icon: '🔒' },
};
const SUB_STATUS_CONFIG = {
    pending:            { label: 'Not Submitted',   color: '#6b7280', bg: '#f3f4f6' },
    submitted:          { label: 'Submitted',        color: '#2563eb', bg: '#eff6ff' },
    late:               { label: 'Late',             color: '#d97706', bg: '#fef3c7' },
    graded:             { label: 'Graded',           color: '#16a34a', bg: '#f0fdf4' },
    resubmit_requested: { label: 'Resubmit Req.',   color: '#7c3aed', bg: '#f5f3ff' },
};

function Badge({ status, type = 'assignment' }) {
    const cfg = type === 'sub' ? SUB_STATUS_CONFIG[status] : STATUS_CONFIG[status];
    if (!cfg) return null;
    return <span className="fa-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon || ''} {cfg.label}</span>;
}

function StatCard({ icon, label, value, color, sub }) {
    return (
        <div className="fa-stat-card" style={{ borderTopColor: color }}>
            <div className="fa-stat-icon" style={{ color }}>{icon}</div>
            <div>
                <div className="fa-stat-value" style={{ color }}>{value}</div>
                <div className="fa-stat-label">{label}</div>
                {sub && <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{sub}</div>}
            </div>
        </div>
    );
}

export default function AdminAssignments() {
    const [view, setView]             = useState('list');   // list | detail | overdue | pending
    const [assignments, setAssignments] = useState([]);
    const [stats, setStats]           = useState({});
    const [selected, setSelected]     = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [pending, setPending]       = useState([]);
    const [overdue, setOverdue]       = useState([]);
    const [classes, setClasses]       = useState([]);
    const [subjects, setSubjects]     = useState([]);
    const [faculty, setFaculty]       = useState([]);
    const [loading, setLoading]       = useState(true);
    const [exporting, setExporting]   = useState(false);
    const [msg, setMsg]               = useState(null);

    const [filters, setFilters] = useState({ status: 'all', class_id: '', subject_id: '', faculty_id: '', q: '' });

    const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000); };

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const params = {};
            if (filters.status !== 'all') params.status = filters.status;
            if (filters.class_id)   params.class_id   = filters.class_id;
            if (filters.subject_id) params.subject_id = filters.subject_id;
            if (filters.faculty_id) params.faculty_id = filters.faculty_id;

            const [asgRes, statsRes, classRes, facRes] = await Promise.all([
                api.get('/assignments/admin/all', { params }),
                api.get('/assignments/admin/stats'),
                api.get('/classes'),
                api.get('/faculty'),
            ]);
            setAssignments(asgRes.data.assignments || []);
            setStats(statsRes.data.stats || {});
            setClasses(classRes.data.data || []);
            setFaculty(facRes.data.data || []);
        } catch (e) { flash('Failed to load data', 'error'); }
        finally { setLoading(false); }
    }, [filters]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const openDetail = async (asg) => {
        try {
            const [asgRes, subRes] = await Promise.all([
                api.get(`/assignments/${asg.id}`),
                api.get(`/assignments/${asg.id}/submissions`)
            ]);
            setSelected(asgRes.data.assignment);
            setSubmissions(subRes.data.submissions || []);
            setView('detail');
        } catch { flash('Failed to load', 'error'); }
    };

    const loadPending = async () => {
        try {
            const res = await api.get('/assignments/admin/pending-grading');
            setPending(res.data.submissions || []);
            setView('pending');
        } catch { flash('Failed to load pending submissions', 'error'); }
    };

    const loadOverdue = async () => {
        try {
            const res = await api.get('/assignments/admin/overdue-students');
            setOverdue(res.data.overdue || []);
            setView('overdue');
        } catch { flash('Failed to load overdue data', 'error'); }
    };

    const handleExport = async () => {
        setExporting(true);
        try {
            const res = await api.get('/assignments/admin/export', { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const a = document.createElement('a');
            a.href = url;
            a.download = 'assignments-report.csv';
            a.click();
            window.URL.revokeObjectURL(url);
            flash('Exported successfully!');
        } catch { flash('Export failed', 'error'); }
        finally { setExporting(false); }
    };

    const handleCloseAssignment = async (id) => {
        if (!window.confirm('Close this assignment?')) return;
        try {
            await api.patch(`/assignments/${id}/close`);
            flash('Assignment closed.');
            const updRes = await api.get(`/assignments/${id}`);
            setSelected(updRes.data.assignment);
            fetchData();
        } catch (e) { flash(e.response?.data?.message || 'Failed', 'error'); }
    };

    const filteredList = assignments.filter(a => {
        if (!filters.q) return true;
        const q = filters.q.toLowerCase();
        return a.title?.toLowerCase().includes(q) || a.Class?.name?.toLowerCase().includes(q) || a.Subject?.name?.toLowerCase().includes(q) || a.faculty?.name?.toLowerCase().includes(q);
    });

    if (loading) {
        return (
            <div className="dashboard-container">
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div className="fa-spinner" /><p style={{ marginTop: 12, color: '#6b7280' }}>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {msg && <div className={`fa-flash ${msg.type}`}>{msg.type === 'success' ? '✅' : '❌'} {msg.text}</div>}

            {/* Header */}
            <div className="dashboard-header">
                <div>
                    <h1>📋 Assignments Overview</h1>
                    <p>Monitor all assignments across the institute</p>
                </div>
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                    {view !== 'list' && (
                        <button className="animated-btn secondary" onClick={() => { setView('list'); setSelected(null); }}>
                             <span className="icon icon-back">←</span> Back
                        </button>
                    )}
                    {view === 'list' && (
                        <>
                            <button className="btn btn-warning" onClick={loadPending}>⏳ Pending Grading</button>
                            <button className="btn btn-danger" onClick={loadOverdue}>⛔ Overdue</button>
                            <button className="btn btn-secondary" onClick={handleExport} disabled={exporting}>
                                {exporting ? 'Exporting...' : '📊 Export CSV'}
                            </button>
                            <button className="animated-btn secondary" onClick={() => window.location.href = "/admin/dashboard"}>
                                <span className="icon icon-back">←</span> Back to Dashboard
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Stats Row */}
            <div className="fa-stats-row">
                <StatCard icon="📚" label="Total Assignments" value={stats.total_assignments || 0} color="#6366f1" />
                <StatCard icon="⏳" label="Pending Grading" value={stats.pending_grading || 0} color="#d97706" sub="Awaiting teacher review" />
                <StatCard icon="✅" label="Graded" value={stats.graded_submissions || 0} color="#16a34a" />
                <StatCard icon="⚠️" label="Late Submissions" value={stats.late_submissions || 0} color="#dc2626" />
                <StatCard icon="📈" label="Avg Score" value={stats.avg_score ? `${stats.avg_score}%` : '—'} color="#2563eb" />
            </div>

            {/* ══════════════════════════════════════════════════ */}
            {/* LIST VIEW */}
            {view === 'list' && (
                <div className="card">
                    {/* Filter Bar */}
                    <div className="aa-filter-bar">
                        <input
                            placeholder="Search by title, class, subject, faculty..."
                            value={filters.q}
                            onChange={e => setFilters(p => ({ ...p, q: e.target.value }))}
                            style={{ flex: 2 }}
                        />
                        <select value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
                            <option value="all">All Status</option>
                            <option value="published">Published</option>
                            <option value="draft">Draft</option>
                            <option value="closed">Closed</option>
                        </select>
                        <select value={filters.class_id} onChange={e => setFilters(p => ({ ...p, class_id: e.target.value }))}>
                            <option value="">All Classes</option>
                            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select value={filters.faculty_id} onChange={e => setFilters(p => ({ ...p, faculty_id: e.target.value }))}>
                            <option value="">All Faculty</option>
                            {faculty.map(f => <option key={f.id} value={f.id}>{f.User?.name || f.name}</option>)}
                        </select>
                        <button className="btn btn-secondary btn-sm" onClick={() => setFilters({ status: 'all', class_id: '', subject_id: '', faculty_id: '', q: '' })}>
                            Clear
                        </button>
                    </div>

                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Class / Subject</th>
                                    <th>Faculty</th>
                                    <th>Due Date</th>
                                    <th>Status</th>
                                    <th>Submissions</th>
                                    <th>Avg Score</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredList.length === 0 ? (
                                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: '2rem', color: '#9ca3af' }}>No assignments found</td></tr>
                                ) : (
                                    filteredList.map(asg => (
                                        <tr key={asg.id}>
                                            <td><strong>{asg.title}</strong></td>
                                            <td>{asg.Class?.name} / {asg.Subject?.name}</td>
                                            <td>{asg.faculty?.name}</td>
                                            <td style={{ whiteSpace: 'nowrap' }}>
                                                {new Date(asg.due_date).toLocaleDateString()}
                                                {new Date() > new Date(asg.due_date) && asg.status === 'published' && (
                                                    <span className="fa-late-badge">OVERDUE</span>
                                                )}
                                            </td>
                                            <td><Badge status={asg.status} /></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6, fontSize: 12, flexWrap: 'wrap' }}>
                                                    <span style={{ color: '#2563eb', fontWeight: 600 }}>{asg.submissions_count || 0}</span> / {asg.total_students || 0}
                                                    {(asg.graded_count > 0) && <span className="fa-badge" style={{ background: '#f0fdf4', color: '#16a34a', fontSize: 11 }}>✅ {asg.graded_count}</span>}
                                                </div>
                                            </td>
                                            <td>{asg.avg_score ? `${asg.avg_score}%` : '—'}</td>
                                            <td>
                                                <div style={{ display: 'flex', gap: 6 }}>
                                                    <button className="btn btn-sm btn-primary" onClick={() => openDetail(asg)}>
                                                        View
                                                    </button>
                                                    {asg.status === 'published' && (
                                                        <button className="btn btn-sm btn-warning" onClick={() => handleCloseAssignment(asg.id)}>
                                                            Close
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════ */}
            {/* DETAIL VIEW */}
            {view === 'detail' && selected && (
                <div>
                    <div className="card fa-submission-header">
                        <div>
                            <h2>{selected.title}</h2>
                            <p className="fa-asg-meta">📚 {selected.Class?.name} | 📖 {selected.Subject?.name} | 👨‍🏫 {selected.faculty?.name}</p>
                            <p className="fa-asg-meta">Due: {new Date(selected.due_date).toLocaleString()} | 🎯 {selected.max_marks} marks</p>
                        </div>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            <Badge status={selected.status} />
                            {selected.status === 'published' && (
                                <button className="btn btn-sm btn-warning" onClick={() => handleCloseAssignment(selected.id)}>
                                    🔒 Close Assignment
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Mini Stats */}
                    <div className="fa-stats-row">
                        {[
                            { label: 'Total Students', value: submissions.length, color: '#6b7280' },
                            { label: 'Submitted', value: submissions.filter(s => s.status !== 'pending').length, color: '#2563eb' },
                            { label: 'Pending Grading', value: submissions.filter(s => ['submitted', 'late', 'resubmit_requested'].includes(s.status)).length, color: '#d97706' },
                            { label: 'Graded', value: submissions.filter(s => s.status === 'graded').length, color: '#16a34a' },
                            { label: 'Not Submitted', value: submissions.filter(s => s.status === 'pending').length, color: '#dc2626' },
                        ].map(s => <StatCard key={s.label} icon="•" label={s.label} value={s.value} color={s.color} />)}
                    </div>

                    <div className="card">
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Status</th>
                                        <th>Submitted At</th>
                                        <th>Attempt</th>
                                        <th>Marks</th>
                                        <th>Grade</th>
                                        <th>File</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {submissions.map(sub => (
                                        <tr key={sub.id}>
                                            <td>
                                                <strong>{sub.Student?.User?.name}</strong>
                                                {sub.is_late && <span className="fa-late-badge">LATE</span>}
                                            </td>
                                            <td><Badge status={sub.status} type="sub" /></td>
                                            <td>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '—'}</td>
                                            <td>{sub.attempt_number > 0 ? `#${sub.attempt_number}` : '—'}</td>
                                            <td>{sub.marks_obtained !== null ? `${sub.marks_obtained}/${selected.max_marks}` : '—'}</td>
                                            <td>{sub.grade ?? '—'}</td>
                                            <td>
                                                {sub.submission_file_url ? (
                                                    <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${sub.submission_file_url}`} target="_blank" rel="noreferrer" className="fa-file-link">
                                                        📥 Download
                                                    </a>
                                                ) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ══════════════════════════════════════════════════ */}
            {/* PENDING GRADING VIEW */}
            {view === 'pending' && (
                <div className="card">
                    <h2 style={{ marginBottom: 16 }}>⏳ Pending Grading — All Ungraded Submissions</h2>
                    {pending.length === 0 ? (
                        <div className="fa-empty"><div style={{ fontSize: 48 }}>🎉</div><p>No submissions pending grading!</p></div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr><th>Student</th><th>Assignment</th><th>Class</th><th>Subject</th><th>Status</th><th>Submitted At</th><th>File</th></tr>
                                </thead>
                                <tbody>
                                    {pending.map(sub => (
                                        <tr key={sub.id}>
                                            <td><strong>{sub.Student?.User?.name}</strong></td>
                                            <td>{sub.Assignment?.title}</td>
                                            <td>{sub.Assignment?.Class?.name}</td>
                                            <td>{sub.Assignment?.Subject?.name}</td>
                                            <td><Badge status={sub.status} type="sub" /></td>
                                            <td>{sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : '—'}</td>
                                            <td>
                                                {sub.submission_file_url ? (
                                                    <a href={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${sub.submission_file_url}`} target="_blank" rel="noreferrer" className="fa-file-link">📥 View</a>
                                                ) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {/* ══════════════════════════════════════════════════ */}
            {/* OVERDUE VIEW */}
            {view === 'overdue' && (
                <div>
                    {overdue.length === 0 ? (
                        <div className="card fa-empty"><div style={{ fontSize: 48 }}>🎉</div><p>No overdue assignments!</p></div>
                    ) : (
                        overdue.map((item, idx) => (
                            <div className="card" key={idx} style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                    <div>
                                        <h3 style={{ margin: 0 }}>{item.assignment.title}</h3>
                                        <p className="fa-asg-meta">{item.assignment.class_name} | {item.assignment.subject_name} | Due {new Date(item.assignment.due_date).toLocaleDateString()}</p>
                                    </div>
                                    <span className="fa-badge" style={{ background: '#fee2e2', color: '#991b1b', fontSize: 14 }}>
                                        ⛔ {item.count} Not Submitted
                                    </span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {item.overdue_students.map(s => (
                                        <span key={s.id} style={{ background: '#f3f4f6', padding: '4px 10px', borderRadius: 20, fontSize: 12 }}>
                                            {s.name}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
