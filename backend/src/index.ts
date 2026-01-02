import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth';
import dataRouter from './routes/data';
import statsRouter from './routes/stats';
import logsRouter from './routes/logs';
import kelurahanRouter from './routes/kelurahan';
import usersRouter from './routes/users';
import rolesRouter from './routes/roles';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/data', dataRouter);
app.use('/api/stats', statsRouter);
app.use('/api/logs', logsRouter);
app.use('/api/kelurahan', kelurahanRouter);
app.use('/api/users', usersRouter);
app.use('/api/roles', rolesRouter);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
