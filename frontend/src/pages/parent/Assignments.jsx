/**
 * Parent Assignments — Phase 13 Read-only View
 * Parents can see their child's assignments & submission status
 */
import { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import BackButton from '../../components/common/BackButton';
import '../faculty/Assignments.css';
import './Dashboard.css';

const SUB_STATUS_CONFIG = {
    pending:            { label: 'Not Submitted', color: '#6b7280', bg: '#f3f4f6', icon: '⏳' },
    submitted:          { label: 'Submitted',     color: '#2563eb', bg: '#eff6ff', icon: '📩' },
    late:               { label: 'Late',          color: '#d97706', bg: '#fef3c7', icon: '⚠️' },
    graded:             { label: 'Graded',        color: '#16a34a', bg: '#f0fdf4', icon: '✅' },
    resubmit_requested: { label: 'Resubmit Req.', color: '#7c3aed', bg: '#f5f3ff', icon: '🔄' },
};

function StatusBadge({ status }) {
    const cfg = SUB_STATUS_CONFIG[status];
    if (!cfg) return null;
    return <span className="fa-badge" style={{ background: cfg.bg, color: cfg.color }}>{cfg.icon} {cfg.label}</span>;
}

export default function ParentAssignments() {
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingAsg, setLoadingAsg] = useState(false);
    const [msg, setMsg] = useState(null);

    const flash = (text, type = 'success') => { setMsg({ text, type }); setTimeout(() => setMsg(null), 3000); };

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                const res = await api.get('/parents/dashboard');
                const children = res.data.data?.students || [];
                setStudents(children);
                if (children.length === 1) {
                    setSelectedStudent(children[0]);
                }
            } catch (e) {
                flash('Failed to load children data', 'error');
            } finally { setLoading(false); }
        };
        fetchChildren();
    }, []);

    const fetchAssignments = useCallback(async (studentId) => {
        setLoadingAsg(true);
        try {
            const res = await api.get(`/assignments/parent/child/${studentId}`);
            setAssignments(res.data.assignments || []);
        } catch (e) {
            flash('Failed to load assignments', 'error');
        } finally { setLoadingAsg(false); }
    }, []);

    useEffect(() => {
        if (selectedStudent?.id) {
            fetchAssignments(selectedStudent.id);
        }
    }, [selectedStudent, fetchAssignments]);

    const pending  = assignments.filter(a => !a.my_submission || a.my_submission?.status === 'pending');
    const graded   = assignments.filter(a => a.my_submission?.status === 'graded');
    const submitted = assignments.filter(a => a.my_submission && ['submitted', 'late'].includes(a.my_submission.status));
    const resubmit = assignments.filter(a => a.my_submission?.status === 'resubmit_requested');

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

            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>📝 Child's Assignments</h1>
                    <p>Monitor your child's assignment progress and grades</p>
                </div>
                <BackButton to="/parent/dashboard" />
            </div>

            {/* Student Selector */}
            {students.length > 1 && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        <strong style={{ fontSize: 14, alignSelf: 'center' }}>Select Child:</strong>
                        {students.map(s => (
                            <button
                                key={s.id}
                                className={`fa-tab ${selectedStudent?.id === s.id ? 'active' : ''}`}
                                onClick={() => setSelectedStudent(s)}
                            >
                                👤 {s.User?.name || s.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {!selectedStudent && students.length === 0 && (
                <div className="card fa-empty">
                    <div style={{ fontSize: 48 }}>👨‍👩‍👧</div>
                    <p>No children linked to your account. Contact the administrator.</p>
                </div>
            )}

            {selectedStudent && (
                <>
                    {/* Stats for Selected Child */}
                    {!loadingAsg && (
                        <div className="fa-stats-row">
                            <div className="fa-stat-card" style={{ borderTopColor: '#d97706' }}>
                                <div className="fa-stat-icon">⏳</div>
                                <div><div className="fa-stat-value" style={{ color: '#d97706' }}>{pending.length}</div><div className="fa-stat-label">Pending</div></div>
                            </div>
                            <div className="fa-stat-card" style={{ borderTopColor: '#7c3aed' }}>
                                <div className="fa-stat-icon">🔄</div>
                                <div><div className="fa-stat-value" style={{ color: '#7c3aed' }}>{resubmit.length}</div><div className="fa-stat-label">Needs Resubmit</div></div>
                            </div>
                            <div className="fa-stat-card" style={{ borderTopColor: '#2563eb' }}>
                                <div className="fa-stat-icon">📩</div>
                                <div><div className="fa-stat-value" style={{ color: '#2563eb' }}>{submitted.length}</div><div className="fa-stat-label">Awaiting Grade</div></div>
                            </div>
                            <div className="fa-stat-card" style={{ borderTopColor: '#16a34a' }}>
                                <div className="fa-stat-icon">✅</div>
                                <div><div className="fa-stat-value" style={{ color: '#16a34a' }}>{graded.length}</div><div className="fa-stat-label">Graded</div></div>
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0 }}>👤 {selectedStudent.User?.name || selectedStudent.name}'s Assignments</h3>
                            <span style={{ fontSize: 13, color: '#6b7280' }}>{assignments.length} total</span>
                        </div>

                        {loadingAsg ? (
                            <div style={{ textAlign: 'center', padding: '2rem' }}><div className="fa-spinner" /></div>
                        ) : assignments.length === 0 ? (
                            <div className="fa-empty"><div style={{ fontSize: 48 }}>📭</div><p>No assignments found.</p></div>
                        ) : (
                            <div className="fa-assignment-list">
                                {assignments.map(asg => (
                                    <div key={asg.id} className="fa-assignment-card">
                                        <div className="fa-asg-header">
                                            <div>
                                                <StatusBadge status={asg.my_submission?.status || 'pending'} />
                                                <h3 className="fa-asg-title">{asg.title}</h3>
                                                <p className="fa-asg-meta">📚 {asg.Class?.name} | 📖 {asg.Subject?.name} | 👨‍🏫 {asg.faculty?.name}</p>
                                            </div>
                                            <div style={{ textAlign: 'right' }}>
                                                {asg.my_submission?.status === 'graded' ? (
                                                    <div>
                                                        <div style={{ fontSize: 22, fontWeight: 800, color: '#16a34a' }}>
                                                            {asg.my_submission.marks_obtained}/{asg.max_marks}
                                                        </div>
                                                        <div style={{ fontSize: 16, fontWeight: 700, color: '#2563eb' }}>
                                                            Grade: {asg.my_submission.grade}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    asg.is_overdue && (!asg.my_submission || asg.my_submission.status === 'pending') && (
                                                        <span className="fa-countdown overdue">⛔ Overdue</span>
                                                    )
                                                )}
                                            </div>
                                        </div>

                                        <div className="fa-due-info">
                                            Due: {new Date(asg.due_date).toLocaleString()}
                                            {asg.my_submission?.is_late && <span className="fa-late-badge">LATE</span>}
                                        </div>

                                        {/* Grade Details */}
                                        {asg.my_submission?.status === 'graded' && (
                                            <div style={{ marginTop: 8 }}>
                                                {(() => {
                                                    const pct = Math.round((asg.my_submission.marks_obtained / asg.max_marks) * 100);
                                                    const color = pct >= 80 ? '#16a34a' : pct >= 60 ? '#2563eb' : pct >= 40 ? '#d97706' : '#dc2626';
                                                    return (
                                                        <>
                                                            <div className="sa-grade-bar-wrap">
                                                                <div className="sa-grade-bar" style={{ width: `${pct}%`, background: color }} />
                                                            </div>
                                                            <span style={{ fontSize: 12, color: '#6b7280' }}>{pct}% score</span>
                                                        </>
                                                    );
                                                })()}
                                                {asg.my_submission.feedback && (
                                                    <div className="fa-feedback-preview" style={{ marginTop: 6 }}>
                                                        💬 Teacher: {asg.my_submission.feedback}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* Resubmit reason */}
                                        {asg.my_submission?.status === 'resubmit_requested' && asg.my_submission.resubmit_reason && (
                                            <div className="fa-resubmit-reason">
                                                🔄 Reason for resubmission: {asg.my_submission.resubmit_reason}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
