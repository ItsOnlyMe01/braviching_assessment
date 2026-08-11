import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').trim(),
  email: z.string().email('Invalid email address').trim(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['ADMIN', 'MANAGER', 'EMPLOYEE'])
});

// GET ALL USERS (ADMIN & MANAGER)
router.get('/', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    return res.json({ users });
  } catch (error) {
    console.error('Fetch users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// CREATE USER (ADMIN only)
router.post('/', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
  try {
    const validation = createUserSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { name, email, password, role } = validation.data;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'A user with this email already exists' });
    }

    const user = new User({
      name,
      email,
      password,
      role
    });

    await user.save();
    return res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Create user error:', error);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

export default router;
