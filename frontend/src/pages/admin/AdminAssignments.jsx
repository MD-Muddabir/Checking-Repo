import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './Dashboard.css'; // Reuse existing styles if possible or common styles

const AdminAssignments = () => {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const res = await api.get('/assignments/admin/all');
            if (res.data.success) {
                setAssignments(res.data.assignments);
            }
        } catch (error) {
            console.error("Error fetching assignments:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading Assignments...</div>;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>📝 All Assignments</h1>
                    <p>Track all assignments across the institute.</p>
                </div>
            </div>
            <div className="card" style={{ marginTop: '20px', padding: '20px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                    <thead>
                        <tr style={{ background: '#f3f4f6', textAlign: 'left' }}>
                            <th style={{ padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Title</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Class & Subject</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Faculty</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Due Date</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Submissions</th>
                            <th style={{ padding: '10px', borderBottom: '2px solid #e5e7eb' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {assignments.length === 0 ? (
                            <tr><td colSpan="6" style={{ padding: '20px', textAlign: 'center' }}>No assignments found</td></tr>
                        ) : assignments.map(a => (
                            <tr key={a.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                <td style={{ padding: '10px' }}>{a.title}</td>
                                <td style={{ padding: '10px' }}>{a.Class?.name} - {a.Subject?.name}</td>
                                <td style={{ padding: '10px' }}>{a.faculty?.name}</td>
                                <td style={{ padding: '10px' }}>{new Date(a.due_date).toLocaleDateString()}</td>
                                <td style={{ padding: '10px' }}>{a.submissions_count} / {a.total_students}</td>
                                <td style={{ padding: '10px' }}>{a.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminAssignments;
