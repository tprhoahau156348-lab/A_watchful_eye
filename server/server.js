import express from 'express';
import cors from 'cors';
import { connectDB } from './db.js';
import alertsRouter from './routes/alerts.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());


app.use('/api/alerts', alertsRouter);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});