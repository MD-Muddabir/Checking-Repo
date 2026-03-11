import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { toast } from 'react-hot-toast';

const StudentAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    // Detailed View State
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [submissionFile, setSubmissionFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/assignments/student/all');
            if (res.data.success) setAssignments(res.data.assignments);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        setSubmissionFile(e.target.files[0]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!submissionFile) {
            toast.error("Please select a file to submit");
            return;
        }

        setSubmitting(true);
        const data = new FormData();
        data.append("submission_file", submissionFile);

        try {
            const res = await api.post(`/assignments/student/${selectedAssignment.id}/submit`, data, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            if (res.data.success) {
                toast.success("Assignment submitted successfully!");
                setSubmissionFile(null);
                setSelectedAssignment(null);
                fetchAssignments(); // Refresh assignments to get new status
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to submit assignment");
        } finally {
            setSubmitting(false);
        }
    };

    const handleViewDetails = async (assignment) => {
        try {
            const res = await api.get(`/assignments/student/${assignment.id}`);
            if (res.data.success) {
                setSelectedAssignment(res.data.assignment);
            }
        } catch (error) {
            toast.error("Failed to load assignment details");
        }
    };

    if (loading) return <div>Loading Assignments...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>📝 My Assignments</h1>
                    <p>View and submit your assignments.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
                {assignments.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', gridColumn: '1 / -1' }}>No assignments found</div>
                ) : assignments.map(a => (
                    <div key={a.id} className="card" style={{ padding: '20px', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                            <span style={{ fontSize: '12px', color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: '10px' }}>{a.Subject?.name}</span>
                            <span style={{ fontSize: '12px', fontWeight: 'bold', color: a.is_overdue ? '#ef4444' : '#10b981' }}>
                                {a.days_remaining} Days Left
                            </span>
                        </div>
                        <h3 style={{ margin: '0 0 5px 0' }}>{a.title}</h3>
                        <p style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#4b5563' }}>By: {a.faculty?.name}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontSize: '14px' }}><strong>Max Marks:</strong> {a.max_marks}</div>
                            {a.my_submission ? (
                                <span style={{ padding: '4px 10px', background: '#dbeafe', color: '#1e40af', borderRadius: '15px', fontSize: '12px' }}>
                                    {a.my_submission.status === 'graded' ? `Graded: ${a.my_submission.grade}` : a.my_submission.status}
                                </span>
                            ) : (
                                <span style={{ padding: '4px 10px', background: '#fef3c7', color: '#92400e', borderRadius: '15px', fontSize: '12px' }}>
                                    Pending
                                </span>
                            )}
                        </div>
                        <div style={{ marginTop: '15px', borderTop: '1px solid #e5e7eb', paddingTop: '15px', textAlign: 'center' }}>
                            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleViewDetails(a)}>
                                View & Submit
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Assignment Details and Submit Modal */}
            {selectedAssignment && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: 700, width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h2 style={{ margin: 0 }}>📝 {selectedAssignment.title}</h2>
                            <button className="btn btn-secondary" onClick={() => { setSelectedAssignment(null); setSubmissionFile(null); }}>✕</button>
                        </div>

                        <div className="card" style={{ padding: '20px', marginBottom: '20px', background: '#f8fafc' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
                                <div><strong>Subject:</strong> {selectedAssignment.Subject?.name}</div>
                                <div><strong>Faculty:</strong> {selectedAssignment.faculty?.name}</div>
                                <div><strong>Max Marks:</strong> {selectedAssignment.max_marks}</div>
                                <div><strong>Due Date:</strong> {new Date(selectedAssignment.due_date).toLocaleString()}</div>
                            </div>
                            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '15px' }}>
                                <strong>Description:</strong>
                                <p style={{ whiteSpace: 'pre-wrap', color: '#4b5563', marginTop: '5px' }}>
                                    {selectedAssignment.description || 'No description provided.'}
                                </p>
                            </div>
                            {selectedAssignment.reference_file_url && (
                                <div style={{ marginTop: '15px' }}>
                                    <strong>Reference Material:</strong><br />
                                    <a href={`${api.defaults.baseURL.replace('/api', '')}${selectedAssignment.reference_file_url}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary" style={{ marginTop: '5px', display: 'inline-block' }}>
                                        📎 Download Resource
                                    </a>
                                </div>
                            )}
                        </div>

                        {selectedAssignment.my_submission ? (
                            <div className="card" style={{ padding: '20px', borderLeft: '4px solid #10b981' }}>
                                <h3 style={{ margin: '0 0 15px 0' }}>✅ Your Submission</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                    <div><strong>Status:</strong> <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{selectedAssignment.my_submission.status}</span></div>
                                    <div><strong>Submitted On:</strong> {new Date(selectedAssignment.my_submission.submitted_at).toLocaleString()}</div>
                                    {selectedAssignment.my_submission.status === 'graded' && (
                                        <>
                                            <div><strong>Marks Obtained:</strong> {selectedAssignment.my_submission.marks_obtained}</div>
                                            <div><strong>Grade:</strong> {selectedAssignment.my_submission.grade}</div>
                                            {selectedAssignment.my_submission.feedback && (
                                                <div style={{ gridColumn: '1 / -1' }}>
                                                    <strong>Faculty Feedback:</strong>
                                                    <p style={{ margin: '5px 0 0 0', padding: '10px', background: '#f3f4f6', borderRadius: '5px' }}>{selectedAssignment.my_submission.feedback}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {selectedAssignment.my_submission.submission_file_url && (
                                        <div style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
                                            <a href={`${api.defaults.baseURL.replace('/api', '')}${selectedAssignment.my_submission.submission_file_url}`} target="_blank" rel="noopener noreferrer" className="btn btn-secondary btn-sm">
                                                View Uploaded File
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ) : selectedAssignment.status === 'published' && !selectedAssignment.is_overdue ? (
                            <div className="card" style={{ padding: '20px' }}>
                                <h3 style={{ margin: '0 0 15px 0' }}>📤 Submit Assignment</h3>
                                <form onSubmit={handleSubmit}>
                                    <div className="form-group">
                                        <label className="form-label">Upload Your Work (PDF, DOCX, ZIP, etc) *</label>
                                        <input type="file" className="form-input" onChange={handleFileChange} required />
                                        <small style={{ color: '#6b7280' }}>Max Size: {selectedAssignment.max_file_size_mb} MB</small>
                                    </div>
                                    <button type="submit" className="btn btn-primary" disabled={submitting} style={{ width: '100%', marginTop: '10px' }}>
                                        {submitting ? 'Submitting...' : 'Submit Work'}
                                    </button>
                                </form>
                            </div>
                        ) : (
                            <div style={{ padding: '20px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', textAlign: 'center' }}>
                                ⚠️ This assignment is now closed for submissions.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentAssignments;
