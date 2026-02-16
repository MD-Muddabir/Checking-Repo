const allowRoles = (...roles) => {
    return (req, res, next) => {
        // console.log("User Role:", req.user.role);
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ error: "Access forbidden" });
        }
        next();
    };
};

module.exports = allowRoles;
