const { Announcement } = require('./config/database');
const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('./config/database');

async function test() {
    const tableInfo = await sequelize.getQueryInterface().describeTable('Announcements');
    console.log(tableInfo);
    process.exit(0);
}
test();
