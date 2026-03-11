📝
ASSIGNMENT SUBMISSION
Complete Feature Design & Implementation Guide
Student SaaS — Multi-Tenant Coaching ERP Platform
Module	Assignment Submission System
Project	Student SaaS (MD-Muddabir/Student-SaaS)
Total Phases	14 Implementation Phases
Roles Covered	Super Admin, Owner, Manager, Faculty, Student, Parent
File Support	PDF, DOCX, Images, ZIP (configurable)
Grading	Marks + Grade + Feedback per submission
Notifications	Email + In-app on every lifecycle event
Integration	Connects with Marks, Attendance, Analytics modules
 
1. What Is the Assignment Submission Module?
The Assignment Submission Module is an end-to-end digital workflow that replaces physical assignment collection in coaching institutes. Faculty create assignments with deadlines, attach instructions or reference files, and publish them to specific classes and subjects. Students submit their work digitally before the deadline. Faculty review, grade, and provide written feedback. The entire lifecycle is tracked, audited, and visible to admins and parents.

This module elevates Student SaaS from a basic ERP into a Learning Management System (LMS), making it comparable to platforms like Google Classroom, Teachmint, and MyClassCampus.

Why This Feature Is Commercially Important
✅  Institutes can go fully paperless — major selling point for premium plans
✅  Parents can monitor assignment completion and grades in real time
✅  Faculty save time — no physical collection, auto-grade tracking
✅  Late submission detection is automatic — no manual tracking needed
✅  Creates a full academic record per student that feeds into analytics
✅  Differentiate your SaaS product from basic attendance-only competitors

2. Complete Assignment Lifecycle — How It Works
Every assignment goes through a defined lifecycle with 6 stages:

Assignment Lifecycle — 6 Stages
STAGE 1 — CREATION
   Faculty creates assignment: title, description, subject, class, due date, max marks, allowed file types
   Faculty optionally attaches a reference file (PDF, DOCX) as assignment question paper
   Faculty sets visibility: Draft (save for later) OR Published (students can see immediately)

STAGE 2 — NOTIFICATION
   When published, all enrolled students in that class+subject are notified
   Notification: in-app bell + email with assignment title, due date, and max marks
   Parents also receive an email notification

STAGE 3 — STUDENT SUBMISSION
   Student opens assignment from their dashboard
   Student uploads their answer file before the deadline
   System records exact submission timestamp
   Status changes from 'pending' → 'submitted'
   If submitted after due date → status = 'late'

STAGE 4 — FACULTY REVIEW
   Faculty opens the submission list for their assignment
   Faculty sees all students: submitted / pending / late
   Faculty downloads each submission file
   Faculty enters marks, grade, and written feedback
   Status changes from 'submitted' → 'graded'

STAGE 5 — RESULT NOTIFICATION
   When faculty submits grade, student is notified
   Student sees marks, grade, and feedback in their dashboard
   Parent receives grade notification email

STAGE 6 — ANALYTICS & REPORTING
   Admin sees class-level submission rates, average scores, pending reviews
   Faculty see their own assignment performance overview
   Data feeds into the main analytics dashboard

3. Database Design — All Required Tables
3.1 Table: assignments
Master table — Faculty creates one row per assignment.
Column	Type	Description
id	INT PK AI	Primary key
institute_id	INT FK → institutes	Multi-tenant scope — always required
faculty_id	INT FK → users	Who created this assignment
class_id	INT FK → classes	Which class this assignment is for
subject_id	INT FK → subjects	Which subject this belongs to
title	VARCHAR(255) NOT NULL	Assignment title e.g. 'Chapter 5 Exercise'
description	TEXT	Full instructions for students
reference_file_url	VARCHAR(500)	Optional: question paper uploaded by faculty
reference_file_type	VARCHAR(50)	pdf / docx / image
due_date	DATETIME NOT NULL	Deadline — submissions after this = late
max_marks	DECIMAL(5,2)	Maximum marks for this assignment
allowed_file_types	JSON DEFAULT ['pdf','docx','jpg','png','zip']	What student can upload
max_file_size_mb	INT DEFAULT 10	Max upload size in MB
allow_late_submission	BOOLEAN DEFAULT true	Whether late submissions are accepted
status	ENUM('draft','published','closed') DEFAULT 'draft'	Assignment visibility state
total_submissions	INT DEFAULT 0	Cached count — updated on submit
created_at / updated_at	DATETIME	Timestamps


3.2 Table: assignment_submissions
One row per student per assignment. Tracks submission, grading, and feedback.
Column	Type	Description
id	INT PK AI	Primary key
institute_id	INT FK	Multi-tenant scope
assignment_id	INT FK → assignments	Which assignment
student_id	INT FK → users	Which student
submission_file_url	VARCHAR(500)	Uploaded file path
submission_file_name	VARCHAR(255)	Original filename shown to faculty
submission_file_type	VARCHAR(50)	pdf / docx / image / zip
submission_file_size_kb	INT	File size in KB for display
submitted_at	DATETIME	Exact submission timestamp
is_late	BOOLEAN DEFAULT false	Auto-set if submitted_at > due_date
late_by_minutes	INT DEFAULT 0	How many minutes after deadline
status	ENUM('pending','submitted','late','graded','resubmit_requested')	Current state
marks_obtained	DECIMAL(5,2)	Marks given by faculty
grade	VARCHAR(5)	A+ / A / B+ / B / C / D / F
feedback	TEXT	Faculty written feedback to student
graded_by	INT FK → users	Which faculty graded
graded_at	DATETIME	When grading happened
resubmit_reason	TEXT	Reason if faculty requests resubmission
attempt_number	INT DEFAULT 1	1st submit, 2nd if resubmit, etc.
created_at / updated_at	DATETIME	Timestamps


3.3 Table: assignment_submission_history
Stores every version of a submission when a student resubmits after faculty requests changes.
Column	Type	Description
id	INT PK AI	Primary key
submission_id	INT FK → assignment_submissions	Parent submission record
attempt_number	INT	Which attempt this file belongs to
file_url	VARCHAR(500)	File for this specific attempt
file_name	VARCHAR(255)	Original file name
submitted_at	DATETIME	When this version was uploaded
comment	TEXT	Student's note for this resubmission


3.4 Table: assignment_settings (Per Institute)
Admin configures global rules for the entire institute.
Column	Type	Default / Description
institute_id	INT PK FK	One row per institute
allow_late_submission	BOOLEAN	TRUE — allow late globally
late_submission_penalty_percent	INT DEFAULT 0	e.g. 10 = deduct 10% of marks for late
max_file_size_mb	INT DEFAULT 10	Global max upload size
allowed_file_types	JSON	Global allowed file types
auto_close_after_days	INT DEFAULT 7	Auto-close assignment N days after due date
notify_parent_on_submit	BOOLEAN DEFAULT true	Email parent when student submits
notify_parent_on_grade	BOOLEAN DEFAULT true	Email parent when marks are given
notify_student_on_new	BOOLEAN DEFAULT true	Notify student when new assignment posted
allow_resubmission	BOOLEAN DEFAULT true	Allow faculty to request resubmission
max_resubmit_attempts	INT DEFAULT 2	Max resubmission allowed per student

4. Data Visibility Rules — Who Sees What
4.1 Faculty Visibility
Faculty can ONLY see assignments they personally created. They cannot see assignments created by other faculty members, even within the same institute. This protects intellectual property and prevents confusion.

// Backend query — faculty assignment list
Assignment.findAll({
  where: {
    institute_id: req.user.institute_id,  // institute isolation
    faculty_id:   req.user.id,            // only their own
  },
  include: [Class, Subject],
  order: [['due_date', 'DESC']],
})

Exception: Admin and Manager can see ALL faculty assignments for their institute.


4.2 Student Visibility
A student can ONLY see assignments that match ALL of these conditions simultaneously:

●	Assignment institute_id = student's institute_id
●	Assignment class_id = student's enrolled class_id
●	Assignment subject_id = a subject the student is enrolled in
●	Assignment status = 'published' OR 'closed' (not 'draft')

// Backend query — student assignment list
Assignment.findAll({
  where: {
    institute_id: req.user.institute_id,
    class_id:     student.class_id,
    subject_id:   { [Op.in]: student.enrolled_subject_ids },
    status:       { [Op.in]: ['published', 'closed'] },
  },
  include: [{
    model: AssignmentSubmission,
    where: { student_id: req.user.id },
    required: false,  // LEFT JOIN — shows even if not submitted
  }],
})


4.3 Submission Visibility
Faculty can see ALL submissions for their own assignments. Students can see ONLY their own submission. Admin and Manager can see ALL submissions institute-wide.

Role	Can See Assignments	Can See Submissions	Can Grade
Super Admin	All institutes (analytics only)	All (read-only)	❌ No
Owner / Admin	All in own institute	All in own institute	❌ No (faculty job)
Manager	All in own institute	All in own institute	❌ No
Faculty	Own assignments only	All submissions on own assignments	✅ Yes — own assignments
Student	Assignments for own class + subject	Own submission only	❌ No
Parent	Child's assignment list (read-only)	Child's submission (read-only)	❌ No

5. Implementation Phases — Step by Step
Phase 1 — Database Setup & Migrations
Create all tables with proper constraints and indexes.

1.	Create assignments table with all columns
2.	Create assignment_submissions table — UNIQUE constraint on (assignment_id, student_id) — one submission record per student per assignment
3.	Create assignment_submission_history table
4.	Create assignment_settings table — insert default row for each institute on institute creation
5.	Add indexes for performance:
○	INDEX on assignments(institute_id, class_id, subject_id, status)
○	INDEX on assignments(faculty_id, due_date)
○	INDEX on assignment_submissions(assignment_id, status)
○	INDEX on assignment_submissions(student_id, assignment_id)
6.	Add foreign key constraints with ON DELETE CASCADE where appropriate

Critical Constraint
UNIQUE (assignment_id, student_id) on assignment_submissions table.
This prevents a student from having two submission records for the same assignment.
Resubmissions update the existing row and add a history row — they do NOT create a new submission row.


Phase 2 — File Storage Architecture
Define how assignment files (faculty questions + student answers) are stored.

Folder structure on server:
uploads/
  assignments/
    questions/
      {institute_id}/
        {assignment_id}/
          question_paper.pdf
    submissions/
      {institute_id}/
        {assignment_id}/
          {student_id}/
            attempt_1_filename.pdf
            attempt_2_filename.pdf

File naming convention:
// Student submission file saved as:
// {student_id}_{attempt}_{timestamp}_{original_name}
// Example: 187_1_1709881200_chapter5_answers.pdf

●	Use multer middleware for all file uploads
●	Validate MIME type on backend — never trust file extension alone
●	Scan for executable files (.exe, .sh, .bat) — reject immediately
●	For production: replace local uploads/ with AWS S3 or Cloudinary
●	Generate signed URLs for downloads — prevent direct public access


Phase 3 — Faculty: Create Assignment API
The core API that faculty uses to post a new assignment.

POST /api/assignments
Auth: verifyToken + allowRoles('faculty')

Body: {
  title, description, class_id, subject_id,
  due_date, max_marks, allowed_file_types,
  max_file_size_mb, allow_late_submission,
  status: 'draft' | 'published'
}
File: reference_file (optional — multipart/form-data)

Validation rules for creation:
●	title: required, 3–255 characters
●	class_id: must belong to req.user.institute_id
●	subject_id: faculty must be assigned to this subject (cannot create for unrelated subjects)
●	due_date: must be a future date (at least 1 hour from now)
●	max_marks: required, positive number, max 9999
●	reference_file: if provided — max size from settings, allowed types only
●	status: only 'draft' or 'published' on creation — 'closed' is system-only


Phase 4 — Faculty: Manage Assignments API

Method	Endpoint	Description	Special Rules
GET	/api/assignments	Faculty lists own assignments	Filter by status, class, subject, date range
GET	/api/assignments/:id	Get single assignment detail	Faculty must own it
PUT	/api/assignments/:id	Edit assignment	Cannot edit if any submission exists — only title/description allowed
PATCH	/api/assignments/:id/publish	Change draft → published	Triggers student notifications
PATCH	/api/assignments/:id/close	Close — no more submissions	Can still grade after closing
DELETE	/api/assignments/:id	Delete assignment	Only if status = 'draft' AND zero submissions
GET	/api/assignments/:id/submissions	See all student submissions	Faculty sees all for own assignment
GET	/api/assignments/:id/summary	Summary stats	Submitted count, pending, graded, avg score


Phase 5 — Student: View & Submit Assignment

Student views assignments:
GET /api/assignments/student
// Returns assignments filtered by student's class + enrolled subjects
// Each assignment includes the student's OWN submission (or null)
// Response shape per assignment:
{
  id, title, subject_name, faculty_name,
  due_date, max_marks, status,
  days_remaining: 2,           // calculated on backend
  is_overdue: false,
  my_submission: {             // null if not submitted yet
    status: 'submitted',
    submitted_at: '...',
    is_late: false,
    marks_obtained: null,      // null until graded
    grade: null,
    feedback: null
  }
}

Student submits assignment:
POST /api/assignments/:id/submit
Auth: verifyToken + allowRoles('student')
Body: multipart/form-data
File: submission_file (required)

Validation on submission:
●	Assignment must exist and be 'published' or 'closed'
●	Student must be in the correct class and enrolled in the subject
●	If status = 'closed' AND allow_late_submission = false → reject with message 'Assignment is closed'
●	File type must be in assignment's allowed_file_types list
●	File size must not exceed assignment's max_file_size_mb
●	If UNIQUE(assignment_id, student_id) already exists AND status = 'submitted' → reject (already submitted)
●	If status = 'resubmit_requested' → allow new file upload (updates existing row, saves old to history)
●	Set is_late = true automatically if current time > due_date
●	Apply late penalty if configured: marks_obtained will be capped at (max_marks × (1 - penalty/100))


Phase 6 — Faculty: Grade & Feedback API

PATCH /api/assignments/:assignmentId/submissions/:submissionId/grade
Auth: verifyToken + allowRoles('faculty')

Body: {
  marks_obtained: 18,
  grade: 'A',
  feedback: 'Good work. Improve diagram labels.'
}

Grading validation rules:
●	Faculty must own the assignment (faculty_id check)
●	Submission must be in 'submitted' or 'late' status — cannot grade 'pending'
●	marks_obtained must be between 0 and assignment.max_marks
●	grade is optional — auto-calculate if not provided (A+ ≥ 90%, A ≥ 80%, B+ ≥ 70% etc.)
●	feedback: max 2000 characters
●	Grading updates: status → 'graded', graded_by, graded_at
●	After grading: trigger student + parent notification

Auto grade calculation:
function calculateGrade(obtained, max) {
  const pct = (obtained / max) * 100;
  if (pct >= 90) return 'A+';
  if (pct >= 80) return 'A';
  if (pct >= 70) return 'B+';
  if (pct >= 60) return 'B';
  if (pct >= 50) return 'C';
  if (pct >= 40) return 'D';
  return 'F';
}


Phase 7 — Resubmission Flow
Faculty can request a student to redo their assignment if the work is incomplete or incorrect.

PATCH /api/assignments/:assignmentId/submissions/:submissionId/request-resubmit
Body: { resubmit_reason: 'Diagrams are missing. Please resubmit.' }

Resubmission rules:
●	Only allowed if assignment_settings.allow_resubmission = true
●	submission.attempt_number must be < assignment_settings.max_resubmit_attempts
●	Status changes: 'submitted' OR 'late' → 'resubmit_requested'
●	Previous file is saved to assignment_submission_history
●	Student is notified with the reason
●	Student uploads new file → attempt_number increments → status → 'submitted'
●	Faculty can grade the new version


Phase 8 — Admin Dashboard — Assignment Records
The admin dashboard shows a complete overview of all assignments and submissions institute-wide.

Admin sees on the main Assignments Dashboard card:

Metric Card	Value Shown	API Source
Total Assignments	Count of all published assignments this month	GET /api/admin/assignments/stats
Pending Grading	Submitted but not yet graded count	Same endpoint
Submission Rate	% of students who submitted vs total assigned	Same endpoint
Overdue Students	Students who missed deadline without submission	Same endpoint
Average Score	Institute-wide average marks percentage	Same endpoint


Admin sees detailed records table:
●	Filter by: Faculty, Class, Subject, Status, Date Range
●	Columns: Assignment Title, Faculty, Class, Subject, Due Date, Total Students, Submitted, Graded, Pending, Avg Score, Actions
●	Can click any assignment to see all student submissions
●	Can see which students never submitted anything this month
●	Export: full assignment report to Excel

Admin APIs:
Endpoint	Description
GET /api/admin/assignments	All assignments with filters — paginated
GET /api/admin/assignments/stats	Dashboard metric cards
GET /api/admin/assignments/:id/submissions	All submissions for any assignment
GET /api/admin/assignments/pending-grading	All ungraded submissions (faculty action required)
GET /api/admin/assignments/student/:id	All assignments + submission history for one student
GET /api/admin/assignments/overdue-students	Students who missed deadlines
GET /api/admin/assignments/export	Export full report to Excel/CSV


Phase 9 — Student Dashboard View
The student sees all their assignments organized clearly.

Student Dashboard — Assignment Section shows 4 tabs:

Tab	What It Shows	Color Coding
Pending	Assignments not yet submitted — sorted by due date (urgent first)	Red if < 24 hours, Yellow if < 3 days
Submitted	Assignments student has submitted — awaiting grading	Blue badge 'Under Review'
Graded	Assignments with marks and feedback received	Green badge with grade letter
All	Complete list with all statuses	Color coded per status


Per-assignment card shows:
●	Title + Subject + Faculty name
●	Due date + Days/Hours remaining (countdown)
●	Max marks
●	Status badge: Pending / Submitted / Late / Graded / Resubmit Required
●	If graded: marks obtained / max marks, grade badge, feedback preview
●	Download button for faculty's reference file
●	Submit / Resubmit button (context-aware)


Phase 10 — Faculty Dashboard View
Faculty sees all their assignments and manages submissions from one page.

Faculty Assignment Dashboard — 4 sections:

Section A — My Assignments List
●	Cards per assignment showing: title, class, subject, due date
●	Quick stats: X submitted / Y total students / Z graded
●	Status badge: Draft / Published / Closed
●	Quick actions: Publish / Close / View Submissions / Edit / Delete

Section B — Pending To Grade (Priority Inbox)
●	List of all submissions waiting for grading — sorted by submission time
●	One-click open to grade directly
●	Shows: student name, submitted at, is_late badge, file preview

Section C — Create Assignment Button
●	Opens full assignment creation form
●	Fields: title, description, class dropdown, subject dropdown, due date picker, max marks, file upload, file type restrictions
●	Save as Draft OR Publish immediately

Section D — Assignment Analytics
●	Bar chart: submission rate per assignment
●	Line chart: average scores over time
●	Table: students who never submitted any assignment this month


Phase 11 — Notification System
Every lifecycle event triggers the appropriate notification automatically.

Event	Who Gets Notified	Channel	Message
Assignment published	All students in that class+subject + their parents	In-app + Email	New assignment: [Title] due [Date] — [Subject]
Deadline in 24 hours	Students who haven't submitted + parents	Email (cron job)	Reminder: [Title] due tomorrow. Submit now.
Student submits	Faculty	In-app	[Student] submitted [Assignment Title]
Student submits (parent setting)	Parent	Email	Your child submitted [Title] for [Subject]
Late submission	Faculty + Admin	In-app	[Student] submitted [Title] late by [X] hours
Faculty grades	Student + Parent	In-app + Email	Your assignment [Title] has been graded: [Marks]/[Max] — Grade: [A]
Resubmission requested	Student + Parent	In-app + Email	Faculty requested resubmission for [Title]: [Reason]
Deadline passed, not submitted	Admin + Faculty	In-app (cron)	[N] students did not submit [Title]


Cron jobs schedule:
●	Every day at 8:00 AM — check assignments with deadline in next 24 hours → send reminders
●	Every day at 11:59 PM — mark overdue students, notify admin
●	Every Monday 9:00 AM — weekly submission report email to admin


Phase 12 — Reports & Export

Available Reports:

Report Name	Audience	Format	Content
Class Assignment Report	Admin / Manager	Excel + PDF	All assignments, submission rates, avg scores per class
Student Assignment History	Admin / Parent / Student	PDF	All assignments for one student, marks, grades, feedback
Faculty Performance Report	Admin / Owner	Excel	Faculty's assignment frequency, grading speed, avg score given
Pending Grading Report	Admin / Owner	In-app table	All ungraded submissions sorted by waiting time
Zero Submission Report	Admin	Excel	Students who submitted 0 assignments in a date range
Late Submission Report	Admin / Faculty	Excel	All late submissions with how late and penalty applied


Phase 13 — Parent Portal View
Parents can monitor their child's assignment status and grades in real time.

Parent sees:
●	List of all current assignments for their child
●	Status: Pending / Submitted / Graded per assignment
●	If graded: marks, grade, feedback (read-only)
●	Deadline countdowns for pending assignments
●	History of all past assignments and grades
●	Submission rate percentage for child this month

Parent CANNOT:
●	Download the student's submission file
●	See other students' data
●	Message faculty through this module (use Communication module instead)


Phase 14 — Advanced Features (Premium Plan)
These features can be placed behind the Pro or Premium subscription plan to increase upgrade rate.

●	Plagiarism detection — compare submissions within same class using text similarity
●	AI feedback assistant — GPT-powered initial feedback suggestion for faculty
●	Bulk download — faculty downloads all submissions as a ZIP in one click
●	Rubric-based grading — faculty defines criteria (content: 5/5, presentation: 5/5) instead of single score
●	Assignment templates — faculty saves assignment as template, reuses next batch
●	Group assignments — one submission per group of students
●	Video submission support — students record and submit short video answers
●	Peer review — students can review anonymized submissions of classmates

6. Complete Validation Rules Reference

Phase	Field / Action	Validation Rule	Error Message
Create	title	Required, 3–255 chars	Title is required (3–255 chars)
Create	subject_id	Faculty must teach this subject in this class	You are not assigned to this subject
Create	due_date	Must be at least 1 hour in the future	Due date must be in the future
Create	max_marks	Positive number, max 9999	Max marks must be between 1 and 9999
Create	reference_file	Optional; type in allowed list; size < setting	Invalid file type or size exceeded
Publish	assignment	Must be 'draft' status to publish	Assignment is already published
Submit	student + assignment	Student must be in correct class and subject	You are not enrolled in this subject
Submit	status	Assignment must be 'published' or 'closed' with late allowed	This assignment is closed
Submit	duplicate	UNIQUE(assignment_id, student_id) — one row only	You have already submitted this assignment
Submit	file type	Must be in assignment.allowed_file_types	File type not allowed for this assignment
Submit	file size	Must be ≤ assignment.max_file_size_mb	File too large. Max allowed: X MB
Submit	resubmit	Status must be 'resubmit_requested' to resubmit	Resubmission not requested for this assignment
Submit	max attempts	attempt_number must be < max_resubmit_attempts	Maximum resubmission attempts reached
Grade	ownership	Faculty must own the assignment	You can only grade your own assignments
Grade	marks	0 ≤ marks_obtained ≤ max_marks	Marks cannot exceed maximum marks
Grade	status	Submission must be 'submitted' or 'late'	Cannot grade a pending submission
Delete	assignment	Must be 'draft' AND zero submissions	Cannot delete published assignment with submissions
Edit	after submissions	Only title/description editable once submissions exist	Cannot change marks or due date after submissions

7. Role Permission Matrix

Feature / Action	Owner	Manager	Faculty	Student	Parent	Super Admin
Create assignment	❌	❌	✅	❌	❌	❌
Edit own assignment	❌	❌	✅	❌	❌	❌
Delete assignment	✅	✅	Own/Draft	❌	❌	❌
Publish assignment	❌	❌	✅	❌	❌	❌
View all assignments	✅	✅	Own only	Own class	Child only	Analytics
Submit assignment	❌	❌	❌	✅	❌	❌
Resubmit assignment	❌	❌	❌	✅	❌	❌
Download submission file	✅	✅	Own assigns	Own only	❌	❌
Grade submission	❌	❌	Own assigns	❌	❌	❌
Request resubmission	❌	❌	✅	❌	❌	❌
View all submissions	✅	✅	Own assigns	Own only	Child only	❌
Export reports	✅	✅	Own assigns	❌	❌	❌
Configure assignment settings	✅	❌	❌	❌	❌	❌

8. Complete API Endpoints Reference

Method	Endpoint	Auth Role	Description
POST	/api/assignments	faculty	Create new assignment (with optional file)
GET	/api/assignments	faculty	List faculty's own assignments with filters
GET	/api/assignments/:id	faculty/admin/manager	Get single assignment details
PUT	/api/assignments/:id	faculty	Edit assignment (limited after submissions)
PATCH	/api/assignments/:id/publish	faculty	Publish draft assignment
PATCH	/api/assignments/:id/close	faculty/admin	Close assignment
DELETE	/api/assignments/:id	faculty/admin	Delete (draft only, zero submissions)
GET	/api/assignments/:id/submissions	faculty/admin/manager	All submissions for assignment
GET	/api/assignments/:id/summary	faculty/admin/manager	Stats: submitted/pending/graded count
GET	/api/assignments/student	student	Student's assignment list (own class+subjects)
GET	/api/assignments/:id/student	student	Single assignment + own submission details
POST	/api/assignments/:id/submit	student	Submit assignment (file upload)
PATCH	/api/assignments/:id/resubmit	student	Resubmit when resubmit_requested
PATCH	/api/assignments/:asgId/submissions/:subId/grade	faculty	Grade a submission
PATCH	/api/assignments/:asgId/submissions/:subId/request-resubmit	faculty	Request resubmission
GET	/api/assignments/parent/child/:studentId	parent	Child's assignment list (read-only)
GET	/api/admin/assignments	owner/manager	All institute assignments with filters
GET	/api/admin/assignments/stats	owner/manager	Dashboard metric cards
GET	/api/admin/assignments/pending-grading	owner/manager	Ungraded submissions
GET	/api/admin/assignments/overdue-students	owner/manager	Students who missed deadlines
GET	/api/admin/assignments/export	owner/manager	Export to Excel/CSV
GET/PUT	/api/admin/assignments/settings	owner	Get/update assignment settings

9. Required Packages

Package	Purpose	Install
multer	Handle multipart file uploads	npm install multer
multer-storage-s3 / multer-s3	Store files on AWS S3 (production)	npm install multer-s3 aws-sdk
mime-types	Verify actual MIME type of uploaded file	npm install mime-types
exceljs	Export assignment reports to Excel	npm install exceljs
pdfkit	Generate student assignment PDF report	npm install pdfkit
date-fns	Calculate days remaining, late minutes	npm install date-fns (already)
node-cron	Deadline reminder jobs, absent detection	Already installed
sharp (optional)	Compress image submissions to save storage	npm install sharp

10. Phase Execution Order — Summary

#	Phase Name	What You Build	Result
1	Database Setup	4 tables + indexes + constraints	Schema ready
2	File Storage	Multer config + folder structure + MIME validation	Secure file handling
3	Create Assignment API	POST /api/assignments with validation	Faculty can post
4	Manage Assignments API	GET / PUT / PATCH / DELETE endpoints	Full CRUD for faculty
5	Student View & Submit	Student list + submit endpoint	Students can submit
6	Grade & Feedback API	PATCH grade endpoint + auto grade calc	Faculty can grade
7	Resubmission Flow	Request resubmit + history table	Iterative grading
8	Admin Dashboard	Stats cards + full records table + filters	Admin visibility
9	Student Dashboard UI	4-tab assignment view with status + grade	Student experience
10	Faculty Dashboard UI	Assignment cards + grading inbox + create form	Faculty experience
11	Notification System	Cron reminders + lifecycle emails	Auto communication
12	Reports & Export	Excel/PDF exports + analytics charts	Data exports
13	Parent Portal View	Child assignment status + grades read-only	Parent engagement
14	Advanced Features	Bulk download, plagiarism, rubrics (Premium)	Premium plan value


Final Result — After All 14 Phases
✅  Faculty create, publish, and manage assignments digitally
✅  Students submit files — late detection is fully automatic
✅  Faculty grade with marks, grades (A+–F), and written feedback
✅  Resubmission workflow with full attempt history
✅  Admin sees institute-wide metrics, pending grading, overdue students
✅  Parents monitor child's submission status and grades in real time
✅  Automatic email reminders 24 hours before deadline
✅  Excel/PDF report exports for compliance
✅  Full role-based access: only right people see right data
✅  Multi-tenant: every institute's data is 100% isolated

Product Level After This Feature:  Full LMS + ERP SaaS Platform
Comparable To:  Google Classroom + Teachmint + MyClassCampus combined

