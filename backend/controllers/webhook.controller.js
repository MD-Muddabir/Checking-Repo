const crypto = require("crypto");
const { Subscription, Institute } = require("../models");

exports.handleWebhook = async (req, res) => {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

    const signature = req.headers["x-razorpay-signature"];

    const body = JSON.stringify(req.body);

    const expectedSignature = crypto
        .createHmac("sha256", secret)
        .update(body)
        .digest("hex");

    if (signature !== expectedSignature) {
        return res.status(400).send("Invalid signature");
    }

    const event = req.body.event;

    if (event === "subscription.charged") {
        const subscriptionData = req.body.payload.subscription.entity;

        const instituteId = subscriptionData.notes.institute_id;

        await Subscription.create({
            institute_id: instituteId,
            plan_id: subscriptionData.plan_id,
            start_date: new Date(),
            end_date: new Date(subscriptionData.current_end * 1000),
            payment_status: "paid",
            amount_paid: subscriptionData.plan_amount / 100,
        });

        await Institute.update(
            {
                subscription_end: new Date(subscriptionData.current_end * 1000),
                status: "active",
            },
            { where: { id: instituteId } }
        );
    }

    res.status(200).json({ status: "ok" });
};

// Handle other events like subscription.halted, subscription.cancelled, (Add Webhook Logic for Failed Payments)

if (event === "subscription.charged") {
    // already handled
    const emailService = require("../services/email.service");
    const invoiceService = require("../services/invoice.service");
    const { Institute } = require("../models");
    const { Plan } = require("../models");

    if (event === "subscription.charged") {

        const institute = await Institute.findByPk(instituteId);
        const plan = await Plan.findByPk(planId);

        const newSubscription = await Subscription.create({
            institute_id: instituteId,
            plan_id: plan.id,
            start_date: new Date(),
            end_date: new Date(subscriptionData.current_end * 1000),
            payment_status: "paid",
            amount_paid: plan.price,
        });

        // Save invoice path
        await newSubscription.update({
            invoice_path: invoice.fileName
        });

        // 🔥 Generate Invoice
        const invoice = await invoiceService.generateInvoice({
            institute,
            plan,
            subscription: newSubscription
        });

        // Send Email with Invoice
        await emailService.sendEmail(
            institute.email,
            "Payment Successful - Invoice Attached",
            `
      <h3>Payment Received</h3>
      <p>Please find your invoice attached.</p>
    `
        );
    }
}

if (event === "subscription.halted") {
    const subscriptionData = req.body.payload.subscription.entity;

    await Subscription.update(
        { status: "suspended" },
        { where: { razorpay_subscription_id: subscriptionData.id } }
    );
}

if (event === "subscription.cancelled") {
    const subscriptionData = req.body.payload.subscription.entity;

    await Subscription.update(
        { status: "cancelled" },
        { where: { razorpay_subscription_id: subscriptionData.id } }
    );
}
