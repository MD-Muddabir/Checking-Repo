const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("student_saas", "root", "tiger", {
    host: "localhost",
    dialect: "mysql",
    logging: false,

});

module.exports = sequelize;


// Finally Sync Database

// In your main app.js:
// const { sequelize } = require("./models");

// sequelize.sync({ alter: true })
//   .then(() => console.log("Database synced"))
//   .catch(err => console.log(err));
