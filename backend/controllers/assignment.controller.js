const {
    Assignment,
    AssignmentSubmission,
    AssignmentSubmissionHistory,
    AssignmentSetting,
    Class,
    Subject,
    Student,
    User,
    sequelize
} = require("../models");
const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

// Function to calculate grade
function calculateGrade(obtained, max) {
    if (!max || max === 0) return null;
    const pct = (obtained / max) * 100;
    if (pct >= 90) return 'A+';
    if (pct >= 80) return 'A';
    if (pct >= 70) return 'B+';
    if (pct >= 60) return 'B';
    if (pct >= 50) return 'C';
    if (pct >= 40) return 'D';
    return 'F';
}

// Ensure settings exist for institute
async function ensureSettings(institute_id) {
    const [settings] = await AssignmentSetting.findOrCreate({
        where: { institute_id },
        defaults: { institute_id }
    });
    return settings;
}

// ----------------------------------------------------
// FACULTY METHODS
// ----------------------------------------------------

exports.createAssignment = async (req, res) => {
    try {
        const { title, description, class_id, subject_id, due_date, max_marks, allowed_file_types, max_file_size_mb, allow_late_submission, status } = req.body;
        const institute_id = req.user.institute_id;
        const faculty_id = req.user.id;

        // Validation for date
        if (new Date(due_date) <= new Date(Date.now() + 60 * 60 * 1000) && status !== 'draft') {
            return res.status(400).json({ success: false, message: 'Due date must be at least 1 hour in the future' });
        }

        let reference_file_url = null;
        let reference_file_type = null;

        if (req.file) {
            reference_file_url = `/uploads/assignments/${req.file.filename}`;
            reference_file_type = req.file.mimetype;
        }

        const assignment = await Assignment.create({
            institute_id,
            faculty_id,
            class_id,
            subject_id,
            title,
            description,
            due_date,
            max_marks,
            allowed_file_types: allowed_file_types ? JSON.parse(allowed_file_types) : undefined,
            max_file_size_mb: max_file_size_mb || 10,
            allow_late_submission: allow_late_submission !== undefined ? allow_late_submission === 'true' || allow_late_submission === true : true,
            status: status || 'draft',
            reference_file_url,
            reference_file_type
        });

        res.status(201).json({ success: true, message: 'Assignment created successfully', assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getFacultyAssignments = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const faculty_id = req.user.id;

        const assignments = await Assignment.findAll({
            where: {
                institute_id,
                faculty_id
            },
            include: [
                { model: Class, attributes: ['id', 'name'] },
                { model: Subject, attributes: ['id', 'name'] }
            ],
            order: [['due_date', 'DESC']]
        });

        // Count stats for each assignment
        const assignmentsWithStats = await Promise.all(assignments.map(async (asg) => {
            const stats = await AssignmentSubmission.findAll({
                where: { assignment_id: asg.id },
                attributes: [
                    'status',
                    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
                ],
                group: ['status']
            });

            const totalStudents = await Student.count({
                include: [{ model: Class, where: { id: asg.class_id } }],
                where: { institute_id }
            });

            let submittedCount = 0;
            let gradedCount = 0;
            let pendingGradingCount = 0;

            stats.forEach(s => {
                const sType = s.getDataValue('status');
                const sCount = parseInt(s.getDataValue('count'));
                if (['submitted', 'late', 'resubmit_requested'].includes(sType)) {
                    pendingGradingCount += sCount;
                    submittedCount += sCount;
                }
                if (sType === 'graded') {
                    gradedCount += sCount;
                    submittedCount += sCount;
                }
            });

            const asgWithStats = asg.toJSON();
            asgWithStats.stats = {
                total_students: totalStudents,
                total_submissions: submittedCount,
                graded: gradedCount,
                pending_grading: pendingGradingCount
            };
            return asgWithStats;
        }));

        res.status(200).json({ success: true, assignments: assignmentsWithStats });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAssignmentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;

        const assignment = await Assignment.findOne({
            where: { id, institute_id },
            include: [
                { model: Class, attributes: ['id', 'name'] },
                { model: Subject, attributes: ['id', 'name'] }
            ]
        });

        if (!assignment) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }

        res.status(200).json({ success: true, assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description } = req.body;
        const institute_id = req.user.institute_id;

        const assignment = await Assignment.findOne({ where: { id, institute_id } });
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

        if (req.user.role === 'faculty' && assignment.faculty_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'Unauthorized' });
        }

        const submissionsCount = await AssignmentSubmission.count({ where: { assignment_id: id } });

        // If there are submissions, we can only update title and description
        if (submissionsCount > 0) {
            await assignment.update({ title, description });
        } else {
            // Full update allowed
            await assignment.update(req.body);
        }

        res.status(200).json({ success: true, message: 'Assignment updated successfully', assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.publishAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;

        const assignment = await Assignment.findOne({ where: { id, institute_id } });
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

        if (assignment.status !== 'draft') {
            return res.status(400).json({ success: false, message: 'Assignment is already published/closed' });
        }

        await assignment.update({ status: 'published' });

        // TODO: Notification triggered here

        res.status(200).json({ success: true, message: 'Assignment published successfully', assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.closeAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;

        const assignment = await Assignment.findOne({ where: { id, institute_id } });
        await assignment.update({ status: 'closed' });

        res.status(200).json({ success: true, message: 'Assignment closed', assignment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAssignment = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;

        const assignment = await Assignment.findOne({ where: { id, institute_id } });
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

        if (assignment.status !== 'draft') {
            return res.status(400).json({ success: false, message: 'Only draft assignments can be deleted' });
        }

        const count = await AssignmentSubmission.count({ where: { assignment_id: id } });
        if (count > 0) {
            return res.status(400).json({ success: false, message: 'Cannot delete assignment with submissions' });
        }

        // remove file if exists
        if (assignment.reference_file_url) {
            const filePath = path.join(__dirname, '..', assignment.reference_file_url);
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        }

        await assignment.destroy();
        res.status(200).json({ success: true, message: 'Assignment deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSubmissions = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;

        const assignment = await Assignment.findOne({ where: { id, institute_id } });
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

        // Fetch students in this assignment's class
        const students = await Student.findAll({
            include: [
                { model: Class, where: { id: assignment.class_id }, attributes: [] },
                { model: User, attributes: ['id', 'name', 'email', 'phone'] }
            ],
            where: { institute_id }
        });

        // Fetch submissions for this assignment
        const submissionsList = await AssignmentSubmission.findAll({
            where: { assignment_id: id, institute_id }
        });

        const submissionsMap = new Map();
        submissionsList.forEach(s => submissionsMap.set(s.student_id, s));

        // Format roster
        const roster = students.map(stu => {
            const sub = submissionsMap.get(stu.id);
            return {
                id: sub ? sub.id : `pending-${stu.id}`,
                Student: stu,
                student_id: stu.id,
                status: sub ? sub.status : 'pending',
                submitted_at: sub ? sub.submitted_at : null,
                is_late: sub ? sub.is_late : false,
                submission_file_url: sub ? sub.submission_file_url : null,
                marks_obtained: sub ? sub.marks_obtained : null,
                grade: sub ? sub.grade : null,
                feedback: sub ? sub.feedback : null
            };
        });

        res.status(200).json({ success: true, submissions: roster });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.gradeSubmission = async (req, res) => {
    try {
        const { asgId, subId } = req.params;
        const { marks_obtained, grade, feedback } = req.body;
        const institute_id = req.user.institute_id;

        const assignment = await Assignment.findOne({ where: { id: asgId, institute_id } });
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

        if (req.user.role === 'faculty' && assignment.faculty_id !== req.user.id) {
            return res.status(403).json({ success: false, message: 'You can only grade your own assignments' });
        }

        const submission = await AssignmentSubmission.findOne({ where: { id: subId, assignment_id: asgId } });
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

        if (['pending'].includes(submission.status)) {
            return res.status(400).json({ success: false, message: 'Cannot grade a pending submission' });
        }

        const marks = parseFloat(marks_obtained);
        const max = parseFloat(assignment.max_marks);

        if (isNaN(marks) || marks > max || marks < 0) {
            return res.status(400).json({ success: false, message: `Marks must be between 0 and ${max}` });
        }

        const calculatedGrade = grade || calculateGrade(marks, max);

        await submission.update({
            marks_obtained: marks,
            grade: calculatedGrade,
            feedback,
            status: 'graded',
            graded_by: req.user.id,
            graded_at: new Date()
        });

        // TODO: Notification

        res.status(200).json({ success: true, message: 'Graded successfully', submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.requestResubmit = async (req, res) => {
    try {
        const { asgId, subId } = req.params;
        const { resubmit_reason } = req.body;
        const institute_id = req.user.institute_id;

        const settings = await ensureSettings(institute_id);
        if (!settings.allow_resubmission) {
            return res.status(400).json({ success: false, message: 'Resubmission is disabled for this institute' });
        }

        const submission = await AssignmentSubmission.findOne({ where: { id: subId, assignment_id: asgId } });
        if (!submission) return res.status(404).json({ success: false, message: 'Submission not found' });

        if (submission.attempt_number >= settings.max_resubmit_attempts) {
            return res.status(400).json({ success: false, message: 'Maximum resubmission attempts reached' });
        }

        // Save current to history
        await AssignmentSubmissionHistory.create({
            submission_id: submission.id,
            attempt_number: submission.attempt_number,
            file_url: submission.submission_file_url,
            file_name: submission.submission_file_name,
            submitted_at: submission.submitted_at || new Date()
        });

        await submission.update({
            status: 'resubmit_requested',
            resubmit_reason,
            attempt_number: submission.attempt_number + 1
        });

        // TODO: Notification

        res.status(200).json({ success: true, message: 'Resubmission requested', submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ----------------------------------------------------
// STUDENT METHODS
// ----------------------------------------------------

exports.getStudentAssignments = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        // User could be student
        const student = await Student.findOne({
            where: { user_id: req.user.id },
            include: [{ model: Class }, { model: Subject }]
        });
        if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

        const classIds = student.Classes ? student.Classes.map(c => c.id) : [];
        const subjectIds = student.Subjects ? student.Subjects.map(s => s.id) : [];

        const assignmentQueryOptions = {
            institute_id,
            class_id: { [Op.in]: classIds },
            status: { [Op.in]: ['published', 'closed'] }
        };

        if (!student.is_full_course) {
            assignmentQueryOptions.subject_id = { [Op.in]: subjectIds };
        }

        // Fetch assignments for student's class and where status is published or closed
        const assignments = await Assignment.findAll({
            where: assignmentQueryOptions,
            include: [
                { model: Class, attributes: ['name'] },
                { model: Subject, attributes: ['name'] },
                { model: User, as: 'faculty', attributes: ['name'] },
                {
                    model: AssignmentSubmission,
                    required: false,
                    where: { student_id: student.id }
                }
            ],
            order: [['due_date', 'ASC']]
        });

        // Format payload
        const formatted = assignments.map(a => {
            const data = a.toJSON();
            const now = new Date();
            const due = new Date(data.due_date);
            data.days_remaining = Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60 * 24)));
            data.is_overdue = now > due;
            data.my_submission = data.AssignmentSubmissions && data.AssignmentSubmissions.length > 0
                ? data.AssignmentSubmissions[0] : null;
            delete data.AssignmentSubmissions;
            return data;
        });

        res.status(200).json({ success: true, assignments: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getStudentAssignmentDetails = async (req, res) => {
    try {
        const { id } = req.params;
        const institute_id = req.user.institute_id;
        const student = await Student.findOne({
            where: { user_id: req.user.id },
            include: [{ model: Class }]
        });
        if (!student) return res.status(404).json({ success: false, message: 'Student record not found' });

        const classIds = student.Classes ? student.Classes.map(c => c.id) : [];

        const assignment = await Assignment.findOne({
            where: {
                id,
                institute_id,
                class_id: { [Op.in]: classIds },
                status: { [Op.in]: ['published', 'closed'] }
            },
            include: [
                { model: Class, attributes: ['name'] },
                { model: Subject, attributes: ['name'] },
                { model: User, as: 'faculty', attributes: ['name'] },
                {
                    model: AssignmentSubmission,
                    required: false,
                    where: { student_id: student.id }
                }
            ]
        });

        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

        const data = assignment.toJSON();
        const now = new Date();
        const due = new Date(data.due_date);
        data.days_remaining = Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60 * 24)));
        data.is_overdue = now > due;
        data.my_submission = data.AssignmentSubmissions && data.AssignmentSubmissions.length > 0
            ? data.AssignmentSubmissions[0] : null;

        if (data.my_submission) {
            data.my_submission.history = await AssignmentSubmissionHistory.findAll({
                where: { submission_id: data.my_submission.id }
            });
        }

        delete data.AssignmentSubmissions;

        res.status(200).json({ success: true, assignment: data });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.submitAssignment = async (req, res) => {
    try {
        const { id } = req.params; // assignment ID
        const institute_id = req.user.institute_id;
        const student = await Student.findOne({ where: { user_id: req.user.id } });

        const assignment = await Assignment.findOne({ where: { id, institute_id } });
        if (!assignment) return res.status(404).json({ success: false, message: 'Assignment not found' });

        if (!req.file) return res.status(400).json({ success: false, message: 'File is required' });

        if (assignment.status === 'closed' && !assignment.allow_late_submission) {
            return res.status(400).json({ success: false, message: 'Assignment is closed' });
        }

        // Validate file extensions
        /*const ext = path.extname(req.file.originalname).substring(1).toLowerCase();
        if (assignment.allowed_file_types && !assignment.allowed_file_types.includes(ext)) {
            return res.status(400).json({ success: false, message: 'File type not allowed' });
        }*/ // File filter handles mimetype, this is secondary check

        const fileSizeMb = req.file.size / (1024 * 1024);
        if (fileSizeMb > assignment.max_file_size_mb) {
            return res.status(400).json({ success: false, message: `File size exceeds max limit: ${assignment.max_file_size_mb} MB` });
        }

        const now = new Date();
        const due = new Date(assignment.due_date);
        const isLate = now > due;
        const lateMinutes = isLate ? Math.floor((now - due) / 60000) : 0;

        let submission = await AssignmentSubmission.findOne({
            where: { assignment_id: id, student_id: student.id }
        });

        if (submission) {
            if (submission.status === 'submitted' || submission.status === 'graded') {
                return res.status(400).json({ success: false, message: 'Already submitted' });
            }
            if (submission.status === 'resubmit_requested') {
                await submission.update({
                    submission_file_url: `/uploads/assignments/${req.file.filename}`,
                    submission_file_name: req.file.originalname,
                    submission_file_type: req.file.mimetype,
                    submission_file_size_kb: Math.ceil(req.file.size / 1024),
                    submitted_at: now,
                    is_late: isLate,
                    late_by_minutes: lateMinutes,
                    status: isLate ? 'late' : 'submitted',
                    resubmit_reason: null
                });
            }
        } else {
            submission = await AssignmentSubmission.create({
                institute_id,
                assignment_id: id,
                student_id: student.id,
                submission_file_url: `/uploads/assignments/${req.file.filename}`,
                submission_file_name: req.file.originalname,
                submission_file_type: req.file.mimetype,
                submission_file_size_kb: Math.ceil(req.file.size / 1024),
                submitted_at: now,
                is_late: isLate,
                late_by_minutes: lateMinutes,
                status: isLate ? 'late' : 'submitted'
            });
        }

        // Total submissions update
        await assignment.increment('total_submissions');

        res.status(200).json({ success: true, message: 'Assignment submitted', submission });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ----------------------------------------------------
// ADMIN / OWNER METHODS
// ----------------------------------------------------

exports.getAdminAssignments = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const assignments = await Assignment.findAll({
            where: { institute_id },
            include: [
                { model: Class, attributes: ['name'] },
                { model: Subject, attributes: ['name'] },
                { model: User, as: 'faculty', attributes: ['name'] }
            ],
            order: [['due_date', 'DESC']]
        });

        const enhanced = await Promise.all(assignments.map(async a => {
            const data = a.toJSON();
            const submissions = await AssignmentSubmission.count({ where: { assignment_id: a.id } });
            const totalStudents = await Student.count({
                include: [{ model: Class, where: { id: a.class_id } }],
                where: { institute_id }
            });
            data.submissions_count = submissions;
            data.total_students = totalStudents;
            return data;
        }));

        res.status(200).json({ success: true, assignments: enhanced });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getAdminStats = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const totalAssignments = await Assignment.count({ where: { institute_id, status: ['published', 'closed'] } });
        const pendingGrading = await AssignmentSubmission.count({ where: { institute_id, status: ['submitted', 'late'] } });

        res.status(200).json({
            success: true,
            stats: {
                total_assignments: totalAssignments,
                pending_grading: pendingGrading
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const settings = await ensureSettings(institute_id);
        res.status(200).json({ success: true, settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateSettings = async (req, res) => {
    try {
        const institute_id = req.user.institute_id;
        const settings = await ensureSettings(institute_id);
        await settings.update(req.body);
        res.status(200).json({ success: true, message: 'Settings updated successfully', settings });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ----------------------------------------------------
// PARENT METHODS
// ----------------------------------------------------
exports.getParentAssignments = async (req, res) => {
    try {
        const { studentId } = req.params;
        const institute_id = req.user.institute_id;

        const student = await Student.findOne({
            where: { id: studentId, institute_id },
            include: [{ model: Class }, { model: Subject }]
        });
        if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

        const classIds = student.Classes ? student.Classes.map(c => c.id) : [];
        const subjectIds = student.Subjects ? student.Subjects.map(s => s.id) : [];

        const assignmentQueryOptions = {
            institute_id,
            class_id: { [Op.in]: classIds },
            status: { [Op.in]: ['published', 'closed'] }
        };

        if (!student.is_full_course) {
            assignmentQueryOptions.subject_id = { [Op.in]: subjectIds };
        }

        const assignments = await Assignment.findAll({
            where: assignmentQueryOptions,
            include: [
                { model: Class, attributes: ['name'] },
                { model: Subject, attributes: ['name'] },
                { model: User, as: 'faculty', attributes: ['name'] },
                {
                    model: AssignmentSubmission,
                    required: false,
                    where: { student_id: student.id }
                }
            ],
            order: [['due_date', 'ASC']]
        });

        const formatted = assignments.map(a => {
            const data = a.toJSON();
            const now = new Date();
            const due = new Date(data.due_date);
            data.days_remaining = Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60 * 24)));
            data.is_overdue = now > due;
            data.my_submission = data.AssignmentSubmissions && data.AssignmentSubmissions.length > 0
                ? data.AssignmentSubmissions[0] : null;
            delete data.AssignmentSubmissions;
            return data;
        });

        res.status(200).json({ success: true, assignments: formatted });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
