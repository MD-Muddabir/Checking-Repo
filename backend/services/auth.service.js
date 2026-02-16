const { Institute, User, Plan, Subscription } = require("../models");
const { hashPassword, comparePassword } = require("../utils/hashPassword");

exports.registerInstitute = async (data) => {
    const { instituteName, email, password } = data;

    // Create Institute
    const institute = await Institute.create({
        name: instituteName,
        email,
        status: "active",
    });

    // Hash Password
    const hashedPassword = await hashPassword(password);

    // Create Admin User
    const adminUser = await User.create({
        institute_id: institute.id,
        role: "admin",
        name: "Admin",
        email,
        password_hash: hashedPassword,
        status: "active",
    });

    return { institute, adminUser };
};

exports.loginUser = async (email, password) => {
    const user = await User.findOne({
        where: { email },
        include: [{ model: Institute, attributes: ['name'] }]
    });

    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(password, user.password_hash);

    if (!isMatch) throw new Error("Invalid credentials");

    return user;
};

exports.changePassword = async (userId, oldPassword, newPassword) => {
    const user = await User.findByPk(userId);
    if (!user) throw new Error("User not found");

    const isMatch = await comparePassword(oldPassword, user.password_hash);
    if (!isMatch) throw new Error("Incorrect old password");

    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password_hash: hashedPassword });

    return true;
};
