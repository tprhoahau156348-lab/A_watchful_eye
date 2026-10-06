import express from 'express';
import { getDB } from '../db.js';
import { ObjectId } from 'mongodb';
import { protect } from '../middleware/authMiddleware.js';

const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const ARENAS = ['North', 'South', 'Center'];
const STATUSES = ['Active', 'Handled'];

const isNonEmptyString = (v) => typeof v === 'string' && v.trim() !== '';

function validateAlert({ displayName, description, priority, status, arena, lon, lat }) {
    if (!isNonEmptyString(displayName)) return 'displayName is required';
    if (!isNonEmptyString(description)) return 'description is required';
    if (!PRIORITIES.includes(priority)) return 'priority must be one of: ' + PRIORITIES.join(', ');
    if (!ARENAS.includes(arena)) return 'arena must be one of: ' + ARENAS.join(', ');
    if (!STATUSES.includes(status)) return 'status must be one of: ' + STATUSES.join(', ');
    if (typeof lon !== 'number' || lon < 34 || lon > 36) return 'lon must be a number between 34 and 36';
    if (typeof lat !== 'number' || lat < 29 || lat > 34) return 'lat must be a number between 29 and 34';
    return null;
}

const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const db = getDB();
        let query = {};
        if (req.user.role === 'arena_user') {
            query.arena = req.user.assignedArena;
        }
        const alerts = await db.collection('alerts').find(query).toArray();
        res.status(200).json(alerts);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.post('/', async (req, res) => {
    try {
        const { displayName, description, priority, status, arena, lon, lat, x, y } = req.body;
        const finalLon = lon !== undefined ? lon: x;
        const finalLat = lat !== undefined ? lat: y;
        
        const error = validateAlert({ displayName, description, priority, status, arena, lon: finalLon, lat: finalLat });
        if (error) return res.status(400).json({ message: error });
        const newAlert = {displayName, description, priority, status, arena, lon: finalLon, lat: finalLat, createdAt: new Date()};       
        const db = getDB();
        const result = await db.collection('alerts').insertOne(newAlert);
        newAlert._id = result.insertedId;
        res.status(201).json(newAlert);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/:id', protect, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
        const db = getDB();
        const alert = await db.collection('alerts').findOne({ _id: new ObjectId(req.params.id) });
        if (!alert) return res.status(404).json({ message: 'Alert not found' });
        res.status(200).json(alert);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.put('/:id', protect, async (req, res) => {
    try {
        if (!ObjectId.isValid(req.params.id)) return res.status(400).json({ message: 'Invalid id' });
        
        const { displayName, description, priority, status, arena, lon, lat, x, y } = req.body;
        const finalLon = lon !== undefined ? lon: x;
        const finalLat = lat !== undefined ? lat: y;
        
        const error = validateAlert({ displayName, description, priority, status, arena, lon: finalLon, lat: finalLat });
        if (error) return res.status(400).json({ message: error });

        const db = getDB();
        const existingAlert = await db.collection('alerts').findOne({ _id: new ObjectId(req.params.id) });
        if (!existingAlert) return res.status(404).json({ message: 'Alert not found' });

        if (req.user.role === 'arena_user' && status !== existingAlert.status) {
            return res.status(403).json({ message: 'arena_user cannot change status' });
        }
        
        const result = await db.collection('alerts').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: { displayName, description, priority, status, arena, lon: finalLon, lat: finalLat } },
            { returnDocument: 'after' }
        );
        
        res.status(200).json(result);        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.delete('/:id', protect, async (req, res) => {
    try {
        const db = getDB();
        const result = await db.collection('alerts').deleteOne({ _id: new ObjectId(req.params.id) });
        if (result.deletedCount === 0) return res.status(404).json({ message: 'Alert not found' });
        res.status(200).json({ message: 'Alert deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
