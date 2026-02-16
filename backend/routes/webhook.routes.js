const express = require("express");
const router = express.Router();
const controller = require("../controllers/webhook.controller");

router.post("/razorpay-webhook", controller.handleWebhook);

module.exports = router;

