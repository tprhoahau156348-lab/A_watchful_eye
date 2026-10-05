import express from 'express';
import { getDB } from '../db.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const db = getDB();
        const alerts = await db.collection('alerts').find().toArray();
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});
