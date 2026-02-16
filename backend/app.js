const express = require("express");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/superadmin", require("./routes/superadmin.routes"));
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/payment", require("./routes/payment.routes"));
app.use("/api/invoice", require("./routes/invoice.routes"));
app.use("/api/webhook", require("./routes/webhook.routes"));
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use("/api/students", require("./routes/student.routes"));

module.exports = app;
