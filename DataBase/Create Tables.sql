CREATE DATABASE IF NOT EXISTS student_saas;

USE student_saas;

-- ======================================================	PLANS TABLE
CREATE TABLE plans (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    student_limit INT DEFAULT NULL,
    feature_attendance BOOLEAN DEFAULT TRUE,
    feature_fees BOOLEAN DEFAULT TRUE,
    feature_reports BOOLEAN DEFAULT TRUE,
    feature_parent_portal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ======================================================	INSTITUTES TABLE
CREATE TABLE institutes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    logo VARCHAR(255),
    plan_id INT,
    subscription_start DATE,
    subscription_end DATE,
    status ENUM('active','expired','suspended') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (plan_id) REFERENCES plans(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ======================================================	USERS TABLE
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    role ENUM('admin','faculty','student','parent') NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    status ENUM('active','blocked') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ======================================================	CLASSES TABLE
CREATE TABLE classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    section VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ======================================================	STUDENTS TABLE
CREATE TABLE students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    user_id INT,
    roll_number VARCHAR(50),
    class_id INT,
    admission_date DATE,
    date_of_birth DATE,
    gender ENUM('male','female','other'),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL,
    FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ======================================================	FACULTY TABLE
CREATE TABLE faculty (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    user_id INT,
    designation VARCHAR(100),
    salary DECIMAL(10,2),
    join_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ======================================================	SUBJECTS TABLE
CREATE TABLE subjects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    class_id INT,
    name VARCHAR(255) NOT NULL,
    faculty_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE SET NULL,
    FOREIGN KEY (faculty_id) REFERENCES faculty(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ======================================================	ATTENDANCE TABLE
CREATE TABLE attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    student_id INT,
    class_id INT,
    date DATE NOT NULL,
    status ENUM('present','absent') NOT NULL,
    marked_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE SET NULL,
    FOREIGN KEY (marked_by) REFERENCES faculty(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ======================================================	FEES STRUCTURE TABLE
CREATE TABLE fees_structure (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    class_id INT,
    total_amount DECIMAL(10,2) NOT NULL,
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ======================================================	PAYMENTS TABLE
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    student_id INT,
    amount_paid DECIMAL(10,2) NOT NULL,
    payment_date DATE,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(255),
    status ENUM('success','failed','pending') DEFAULT 'success',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- ======================================================	ANNOUNCEMENTS TABLE
CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ======================================================	EXAMS TABLE
CREATE TABLE exams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    class_id INT,
    name VARCHAR(255) NOT NULL,
    exam_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ======================================================	MARKS TABLE
CREATE TABLE marks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    exam_id INT,
    student_id INT,
    subject_id INT,
    marks_obtained DECIMAL(5,2),
    max_marks DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id)
        ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id)
        ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subjects(id)
        ON DELETE SET NULL
) ENGINE=InnoDB;

-- ======================================================	SUBSCRIPTIONS TABLE 
CREATE TABLE subscriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    institute_id INT NOT NULL,
    plan_id INT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment_status ENUM('paid','unpaid','failed') DEFAULT 'paid',
    transaction_reference VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (institute_id) REFERENCES institutes(id)
        ON DELETE CASCADE,
    FOREIGN KEY (plan_id) REFERENCES plans(id)
        ON DELETE CASCADE
) ENGINE=InnoDB;

-- add indexes for performance
CREATE INDEX idx_institute_users ON users(institute_id);
CREATE INDEX idx_institute_students ON students(institute_id);
CREATE INDEX idx_institute_attendance ON attendance(institute_id);
CREATE INDEX idx_institute_payments ON payments(institute_id);


