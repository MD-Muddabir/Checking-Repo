const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure upload directory exists
const uploadDir = path.join(__dirname, "..", "uploads", "assignments");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
        cb(null, "asg-" + uniqueSuffix + path.extname(file.originalname));
    }
});

const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "image/jpeg",
    "image/png",
    "image/jpg",
    "application/zip",
    "application/x-zip-compressed"
];

const fileFilter = (req, file, cb) => {
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only PDF, DOCX, IMAGE, and ZIP are allowed."), false);
    }
};

const uploadAssignment = multer({
    storage: storage,
    limits: {
        fileSize: 50 * 1024 * 1024 // Global max before specific checks
    },
    fileFilter: fileFilter
});

module.exports = {
    uploadAssignment
};
