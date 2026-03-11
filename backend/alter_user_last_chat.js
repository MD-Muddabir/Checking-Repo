const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');

async function migrate() {
    try {
        await sequelize.queryInterface.addColumn('users', 'last_chat_seen_at', {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: null,
        });
        console.log("Added last_chat_seen_at to users");
    } catch (e) {
        console.log("Already exists or error", e);
    }
    process.exit(0);
}
migrate();
