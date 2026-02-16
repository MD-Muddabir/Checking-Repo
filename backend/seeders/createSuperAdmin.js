const sequelize = require("../config/database");
const { User } = require("../models");
const bcrypt = require("bcrypt");

async function createSuperAdmin() {
    try {
        await sequelize.authenticate();

        const existingAdmin = await User.findOne({
            where: { email: "owner@saas.com" }
        });

        if (existingAdmin) {
            console.log("⚠ Super Admin already exists");
            process.exit();
        }

        const hashedPassword = await bcrypt.hash("owneradmin123", 10);

        await User.create({
            institute_id: null,
            role: "super_admin",
            name: "SaaS Owner",
            email: "owner@saas.com",
            phone: null,
            password_hash: hashedPassword,
            status: "active",
        });

        console.log("✅ Super Admin created successfully");
        process.exit();

    } catch (error) {
        console.error("❌ Error creating Super Admin:", error.message);
        process.exit(1);
    }
}

createSuperAdmin();
