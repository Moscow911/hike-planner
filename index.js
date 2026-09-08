require('dotenv').config();
const express = require('express');
const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('./db');
const User = require('./models/User');
const Trip = require('./models/Trip');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const Message = sequelize.define('Message', {
    text: { type: DataTypes.STRING, allowNull: false },
    senderName: { type: DataTypes.STRING, allowNull: false }
});

Trip.hasMany(Message, { onDelete: 'CASCADE' });
Message.belongsTo(Trip);

app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        res.json({ id: user.id, name: user.name });
    } catch (e) {
        res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Неверные данные' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Неверные данные' });
        }

        res.json({ id: user.id, name: user.name });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/trips', async (req, res) => {
    try {
        const trips = await Trip.findAll({ include: 'creator' });
        res.json(trips);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/trips', async (req, res) => {
    try {
        const trip = await Trip.create(req.body);
        res.status(201).json(trip);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/trips/:id/join', async (req, res) => {
    try {
        const trip = await Trip.findByPk(req.params.id);
        trip.participantsCount += 1;
        await trip.save();
        res.json(trip);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/api/trips/:id', async (req, res) => {
    try {
        await Trip.destroy({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/trips/:id/messages', async (req, res) => {
    try {
        const messages = await Message.findAll({ where: { TripId: req.params.id } });
        res.json(messages);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/api/trips/:id/messages', async (req, res) => {
    try {
        const { text, senderName } = req.body;
        const message = await Message.create({
            text,
            senderName,
            TripId: req.params.id
        });
        res.status(201).json(message);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 5000;

async function start() {
    try {
        await sequelize.sync({ alter: true });
        app.listen(PORT, () => console.log(`http://localhost:5000`));
    } catch (e) {
        console.error(e.message);
    }
}
start();