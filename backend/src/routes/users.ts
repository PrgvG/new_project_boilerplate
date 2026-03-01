import { Router, Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { authMiddleware } from '../middleware/auth';
import { wrapAsync } from '../middleware/asyncHandler';

const router = Router();

router.get(
  '/',
  authMiddleware,
  wrapAsync(
    async (req: Request, res: Response, _next: NextFunction): Promise<void> => {
      const users = await User.find().lean();
      res.json(users);
    }
  )
);

export default router;
