import express from 'express';
import cors from 'cors';
import { connectDB, getDB } from './db.js';
import alertsRouter from './routes/alerts.js';
import authRouter from './routes/auth.js';
import bcrypt from 'bcrypt';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());


app.use('/api/alerts', alertsRouter);
app.use('/api/auth', authRouter);


connectDB().then(async () => {
    const db = getDB();
    const adminExists = await db.collection('users').findOne({ role: 'admin' });
    
    if (!adminExists) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin156', salt);
        await db.collection('users').insertOne({
            username: 'admin',
            password: hashedPassword,
            email: 'admin@system.com',
            role: 'admin',
            assignedArena: 'All'
        });
        console.log('Admin created: admin / admin156');
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});