import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './lib/mongoose';
import User from './models/User';
import authRouter from './routes/auth';
import { authMiddleware } from './middleware/auth';

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check with database connection
app.get('/health', (req: Request, res: Response) => {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isConnected = state === 1;

  const response = {
    status: 'ok',
    message: 'Backend is running',
    database: isConnected ? 'connected' : 'disconnected',
    databaseState: state,
  };

  res.json(response);
});

app.get('/api', (req: Request, res: Response) => {
  res.json({ message: 'Hello from Express API' });
});

app.use('/api/auth', authRouter);

// Protected: список пользователей (только для авторизованных)
app.get('/api/users', authMiddleware, async (req: Request, res: Response) => {
  try {
    const users = await User.find().lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to fetch users',
    });
  }
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});

// Запуск сервера
const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    console.error('❌ JWT_SECRET environment variable is not set');
    process.exit(1);
  }
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
