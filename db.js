const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('hike_planner', 'root', 'm60027010', {
    host: 'localhost',
    dialect: 'mysql',
    logging: false
});

module.exports = sequelize;