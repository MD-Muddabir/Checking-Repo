const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

exports.generateInvoice = async ({
    institute,
    plan,
    subscription,
}) => {

    const invoiceNumber = `INV-${Date.now()}`;
    const fileName = `${invoiceNumber}.pdf`;
    const filePath = path.join(
        __dirname,
        `../uploads/invoices/${fileName}`
    );

    const doc = new PDFDocument();
    doc.pipe(fs.createWriteStream(filePath));

    // Header
    doc.fontSize(20).text("Student SaaS Invoice", { align: "center" });
    doc.moveDown();

    // Invoice Details
    doc.fontSize(12).text(`Invoice No: ${invoiceNumber}`);
    doc.text(`Date: ${new Date().toLocaleDateString()}`);
    doc.moveDown();

    // Institute Details
    doc.text(`Institute Name: ${institute.name}`);
    doc.text(`Email: ${institute.email}`);
    doc.moveDown();

    // Plan Details
    doc.text(`Plan Name: ${plan.name}`);
    doc.text(`Plan Price: ₹${plan.price}`);
    doc.text(`Start Date: ${subscription.start_date}`);
    doc.text(`End Date: ${subscription.end_date}`);
    doc.moveDown();

    // Footer
    doc.text("Thank you for your subscription!", { align: "center" });

    doc.end();

    return {
        invoiceNumber,
        filePath,
        fileName
    };
};
