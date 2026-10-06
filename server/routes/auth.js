import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDB } from '../db.js';
import { ObjectId } from 'mongodb';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();
const JWT_SECRET = 'efraimsiso';

const generateToken = (user) => {
    return jwt.sign({ id: user._id, username: user.username, role: user.role, assignedArena: user.assignedArena }, JWT_SECRET, { expiresIn: '30d' });
};

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const db = getDB();
        const user = await db.collection('users').findOne({ username });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({
                _id: user._id,
                username: user.username,
                email: user.email,
                role: user.role,
                assignedArena: user.assignedArena,
                token: generateToken(user)
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', protect, async (req, res) => {
    try {
        const db = getDB();
        const user = await db.collection('users').findOne({ _id: new ObjectId(req.user.id) }, { projection: { password: 0 } });
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/register', protect, adminOnly, async (req, res) => {
    try {
        const { username, password, email, role, assignedArena } = req.body;
        const db = getDB();
        const userExists = await db.collection('users').findOne({ username });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = { username, password: hashedPassword, email, role, assignedArena };
        const result = await db.collection('users').insertOne(newUser);
        res.status(201).json({ _id: result.insertedId, ...newUser });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.delete('/users/:id', protect, adminOnly, async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('users').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/users', protect, adminOnly, async (req, res) => {
    try {
        const db = getDB();
        const users = await db.collection('users').find({}, { projection: { password: 0 } }).toArray();
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
