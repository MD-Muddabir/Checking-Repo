await emailService.sendEmail(
    institute.email,
    "Subscription Cancelled",
    `
  <h3>Your Subscription Has Been Cancelled</h3>
  <p>You can continue until your billing period ends.</p>
  `
);
