

INSERT INTO users 
(institute_id, role, name, email, password_hash, status)
VALUES
(NULL, 'super_admin', 'SaaS Owner', 'owner@saas.com', 'hashed_password', 'active');



INSERT INTO plans (id, name, price, student_limit, feature_attendance, feature_fees, feature_reports, feature_parent_portal)
VALUES (1, 'Basic Plan', 2000.00, 500, TRUE, TRUE, TRUE, FALSE);

UPDATE plans SET razorpay_plan_id='plan_ABC123' WHERE id=1;


INSERT INTO institutes 
(id, name, email, phone, address, plan_id, subscription_start, subscription_end, status)
VALUES 
(1, 'Bright Future Academy', 'info@brightacademy.com', '9876543210', 
'Delhi, India', 1, '2025-01-01', '2025-12-31', 'active');

INSERT INTO users (id, institute_id, role, name, email, phone, password_hash, status)
VALUES
(1, 1, 'admin', 'Admin User', 'admin@brightacademy.com', '9999999999', 'hashed_password', 'active'),
(2, 1, 'faculty', 'Rahul Sharma', 'rahul@brightacademy.com', '8888888888', 'hashed_password', 'active'),
(3, 1, 'faculty', 'Neha Verma', 'neha@brightacademy.com', '7777777777', 'hashed_password', 'active'),
(4, 1, 'student', 'Aman Khan', 'aman@student.com', '6666666666', 'hashed_password', 'active'),
(5, 1, 'student', 'Sara Ali', 'sara@student.com', '5555555555', 'hashed_password', 'active'),
(6, 1, 'student', 'Rohit Singh', 'rohit@student.com', '4444444444', 'hashed_password', 'active');

INSERT INTO classes (id, institute_id, name, section)
VALUES
(1, 1, 'Class 10', 'A'),
(2, 1, 'Class 12', 'B');

INSERT INTO students (id, institute_id, user_id, roll_number, class_id, admission_date, date_of_birth, gender, address)
VALUES
(1, 1, 4, '10A01', 1, '2025-01-05', '2009-06-15', 'male', 'Delhi'),
(2, 1, 5, '10A02', 1, '2025-01-05', '2009-08-20', 'female', 'Delhi'),
(3, 1, 6, '12B01', 2, '2025-01-05', '2007-03-10', 'male', 'Delhi');

INSERT INTO faculty (id, institute_id, user_id, designation, salary, join_date)
VALUES
(1, 1, 2, 'Math Teacher', 40000.00, '2024-06-01'),
(2, 1, 3, 'Science Teacher', 42000.00, '2024-07-01');

INSERT INTO subjects (id, institute_id, class_id, name, faculty_id)
VALUES
(1, 1, 1, 'Mathematics', 1),
(2, 1, 1, 'Science', 2),
(3, 1, 2, 'Physics', 2);

INSERT INTO attendance (institute_id, student_id, class_id, date, status, marked_by)
VALUES
(1, 1, 1, '2025-02-01', 'present', 1),
(1, 2, 1, '2025-02-01', 'absent', 1),
(1, 3, 2, '2025-02-01', 'present', 2);

INSERT INTO fees_structure (id, institute_id, class_id, total_amount, due_date)
VALUES
(1, 1, 1, 25000.00, '2025-03-01'),
(2, 1, 2, 30000.00, '2025-03-01');

INSERT INTO payments (institute_id, student_id, amount_paid, payment_date, payment_method, transaction_id, status)
VALUES
(1, 1, 10000.00, '2025-02-05', 'UPI', 'TXN12345', 'success'),
(1, 2, 25000.00, '2025-02-05', 'Cash', 'TXN12346', 'success'),
(1, 3, 15000.00, '2025-02-05', 'Card', 'TXN12347', 'success');

INSERT INTO announcements (institute_id, title, message, created_by)
VALUES
(1, 'Exam Notice', 'Mid-term exams start from 15th Feb.', 1),
(1, 'Holiday Notice', 'Institute closed on 26th January.', 1);

INSERT INTO exams (id, institute_id, class_id, name, exam_date)
VALUES
(1, 1, 1, 'Mid Term Exam', '2025-02-15'),
(2, 1, 2, 'Final Exam', '2025-03-20');

INSERT INTO marks (institute_id, exam_id, student_id, subject_id, marks_obtained, max_marks)
VALUES
(1, 1, 1, 1, 85, 100),
(1, 1, 2, 1, 78, 100),
(1, 2, 3, 3, 90, 100);

INSERT INTO subscriptions (institute_id, plan_id, start_date, end_date, payment_status, transaction_reference)
VALUES
(1, 1, '2025-01-01', '2025-12-31', 'paid', 'SUBSCRIPTION_TXN_001');
