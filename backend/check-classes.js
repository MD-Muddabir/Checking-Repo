const { sequelize, Class, User } = require('./models');

async function checkClasses() {
    try {
        const admin = await User.findOne({ where: { email: 'ithub@gmail.com' } });
        const classes = await Class.findAll({ where: { institute_id: admin.institute_id } });
        console.log(`Found ${classes.length} classes for institute ${admin.institute_id}`);
        classes.forEach(c => console.log(`- ${c.name} (ID: ${c.id})`));
    } catch (e) {
        console.error(e);
    } finally {
        await sequelize.close();
    }
}
checkClasses();
