const express = require("express");
const router = express.Router();
const path = require("path");

const verifyToken = require("../middlewares/auth.middleware");

router.get("/download/:fileName", verifyToken, (req, res) => {
    const filePath = path.join(
        __dirname,
        `../uploads/invoices/${req.params.fileName}`
    );

    res.download(filePath);
});

module.exports = router;
