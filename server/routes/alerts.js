import express from 'express';
import { getDB } from '../db.js';
import { ObjectId } from 'mongodb';

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


router.post('/', async (req, res) => {
    try {
        const { displayName, description, priority, status, arena, lon, lat } = req.body;
        
                if (
            typeof displayName !== 'string' || !displayName.trim() ||
            typeof description !== 'string' || !description.trim() ||
            typeof priority !== 'string' || !priority.trim() ||
            typeof status !== 'string' || !status.trim() ||
            typeof arena !== 'string' || !arena.trim() ||
            typeof lon !== 'number' ||
            typeof lat !== 'number'
        ) {
            return res.status(400).json({ message: 'Missing or invalid fields' });
        }


        const newAlert = { displayName, description, priority, status, arena, lon, lat };
        const db = getDB();
        const result = await db.collection('alerts').insertOne(newAlert);
        newAlert._id = result.insertedId;
        res.status(201).json(newAlert);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.get('/:id', async (req, res) => {
    try {
        const db = getDB();
        const alert = await db.collection('alerts').findOne({ _id: new ObjectId(req.params.id) });
        if (!alert) return res.status(404).json({ message: 'Alert not found' });
        res.status(200).json(alert);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


router.put('/:id', async (req,res) =>{
    try {

        const { displayName, description, priority, status, arena, lon, lat } = req.body;
        
                if (
            typeof displayName !== 'string' || !displayName.trim() ||
            typeof description !== 'string' || !description.trim() ||
            typeof priority !== 'string' || !priority.trim() ||
            typeof status !== 'string' || !status.trim() ||
            typeof arena !== 'string' || !arena.trim() ||
            typeof lon !== 'number' ||
            typeof lat !== 'number'
        ) {
            return res.status(400).json({ message: 'Missing or invalid fields' });
        }


        const db = getDB();
        const result = await db.collection('alerts').findOneAndUpdate(
            { _id: new ObjectId(req.params.id) },
            { $set: { displayName, description, priority, status, arena, lon, lat } },
            { returnDocument: 'after' }
        );
        
        if (!result) return res.status(404).json({ message: 'Alert not found' });
        res.status(200).json(result);        
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }

})


router.delete('/:id', async (req, res) => {
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
