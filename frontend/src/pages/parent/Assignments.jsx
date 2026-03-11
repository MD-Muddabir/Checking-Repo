import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../services/api';

const ParentAssignments = () => {
    // NOTE: This usually would pass studentId via prop or route
    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>📝 Assignments</h1>
                    <p>View assignments for your child.</p>
                </div>
            </div>

            <div className="card" style={{ marginTop: '20px', padding: '20px' }}>
                <p>Select a student from the dashboard to view their assignments.</p>
                {/* Similar to student view but read-only later */}
            </div>
        </div>
    );
};

export default ParentAssignments;
