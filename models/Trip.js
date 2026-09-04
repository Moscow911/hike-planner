const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Trip = sequelize.define('Trip', {
    title: { type: DataTypes.STRING, allowNull: false },
    destination: { type: DataTypes.STRING, allowNull: false },
    difficulty: { type: DataTypes.STRING, allowNull: false },
    date: { type: DataTypes.DATEONLY, allowNull: false },
    participantsCount: { type: DataTypes.INTEGER, defaultValue: 1 }
});

Trip.belongsTo(User, { as: 'creator' });

module.exports = Trip;