import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import type { JwtPayload } from '../middleware/auth';
import type { AuthenticatedRequest } from '../middleware/auth';
import { authMiddleware } from '../middleware/auth';
import { validateRegisterBody, validateLoginBody } from './authValidation';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? '7d';

function createToken(payload: JwtPayload): string {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not set');
  }
  const options: jwt.SignOptions = { expiresIn: Number(JWT_EXPIRES_IN) };
  return jwt.sign(payload, JWT_SECRET, options);
}

function userToResponse(user: {
  _id: unknown;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    _id: String(user._id),
    email: user.email,
    name: user.name,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateRegisterBody(req.body);
    if (!validation.ok) {
      res.status(400).json({
        error: validation.error,
        code: validation.code,
      });
      return;
    }
    const {
      email: emailStr,
      password: passwordStr,
      name: nameStr,
    } = validation;

    const existingUser = await User.findOne({ email: emailStr });
    if (existingUser) {
      res.status(409).json({
        error: 'User with this email already exists',
        code: 'EMAIL_EXISTS',
      });
      return;
    }

    const passwordHash = await bcrypt.hash(passwordStr, 10);
    const user = new User({
      email: emailStr,
      name: nameStr,
      passwordHash,
    });
    await user.save();

    const payload: JwtPayload = {
      userId: String(user._id),
      email: user.email,
    };
    const token = createToken(payload);

    res.status(201).json({
      token,
      user: userToResponse(user),
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Registration failed',
    });
  }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const validation = validateLoginBody(req.body);
    if (!validation.ok) {
      res.status(400).json({
        error: validation.error,
        code: validation.code,
      });
      return;
    }
    const { email: emailStr, password: passwordStr } = validation;

    const user = await User.findOne({ email: emailStr }).select(
      '+passwordHash'
    );
    if (!user || !user.passwordHash) {
      res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const match = await bcrypt.compare(passwordStr, user.passwordHash);
    if (!match) {
      res.status(401).json({
        error: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS',
      });
      return;
    }

    const payload: JwtPayload = {
      userId: String(user._id),
      email: user.email,
    };
    const token = createToken(payload);

    res.json({
      token,
      user: userToResponse(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Login failed',
    });
  }
});

// GET /api/auth/me — текущий пользователь по JWT
router.get(
  '/me',
  authMiddleware,
  async (req: Request, res: Response): Promise<void> => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({ error: 'Unauthorized', code: 'INVALID_TOKEN' });
      return;
    }
    try {
      const user = await User.findById(authReq.user.userId).lean();
      if (!user) {
        res
          .status(404)
          .json({ error: 'User not found', code: 'USER_NOT_FOUND' });
        return;
      }
      res.json(
        userToResponse({
          _id: user._id,
          email: user.email,
          name: user.name,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        })
      );
    } catch (error) {
      console.error('Me error:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Failed to get user',
      });
    }
  }
);

export default router;
export { createToken, userToResponse };
