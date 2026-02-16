const cron = require("node-cron");
const { Institute, Subscription } = require("../models");
const { Op } = require("sequelize");
const emailService = require("../services/email.service");

cron.schedule("0 0 * * *", async () => {
    console.log("Running daily subscription check...");

    const today = new Date();

    const expiredSubs = await Subscription.findAll({
        where: {
            end_date: { [Op.lt]: today },
            status: "active"
        }
    });

    for (const sub of expiredSubs) {
        await sub.update({ status: "expired" });

        await Institute.update(
            { status: "expired" },
            { where: { id: sub.institute_id } }
        );
    }

    console.log("Expired subscriptions updated.");
});

cron.schedule("0 9 * * *", async () => {

    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + 3);

    const expiringSubs = await Subscription.findAll({
        where: {
            end_date: warningDate,
            status: "active"
        }
    });

    for (const sub of expiringSubs) {

        const institute = await Institute.findByPk(sub.institute_id);

        await emailService.sendEmail(
            institute.email,
            "Subscription Expiring Soon",
            `
      <h3>Your Subscription is Expiring</h3>
      <p>Your plan will expire on ${sub.end_date}</p>
      <p>Please renew to avoid service interruption.</p>
      `
        );
    }

});