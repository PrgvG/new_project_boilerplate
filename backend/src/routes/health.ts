import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const isConnected = state === 1;

  res.json({
    status: 'ok',
    message: 'Backend is running',
    database: isConnected ? 'connected' : 'disconnected',
    databaseState: state,
  });
});

export default router;
