import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { authenticate, authorize } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

// Zod validation schemas
const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').trim(),
  description: z.string().trim().default(''),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).default('TODO'),
  assignedTo: z.string().optional()
});

const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title cannot be empty').optional(),
  description: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional(),
  assignedTo: z.string().optional().nullable()
});

// GET ALL TASKS
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    let query = {};
    if (req.user!.role === 'EMPLOYEE') {
      // Employees can only view tasks assigned to them
      query = { assignedTo: req.user!._id };
    }

    const tasks = await Task.find(query)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    return res.json({ tasks });
  } catch (error) {
    console.error('Fetch tasks error:', error);
    return res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// GET SINGLE TASK
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email role')
      .populate('assignedTo', 'name email role');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // RBAC: Employee can only view if assigned to them
    if (req.user!.role === 'EMPLOYEE' && task.assignedTo?._id.toString() !== req.user!._id.toString()) {
      return res.status(403).json({ error: 'Access denied. You can only view tasks assigned to you.' });
    }

    return res.json({ task });
  } catch (error) {
    console.error('Fetch task error:', error);
    return res.status(500).json({ error: 'Failed to fetch task' });
  }
});

// CREATE TASK (ADMIN & MANAGER)
router.post('/', authenticate, authorize(['ADMIN', 'MANAGER']), async (req: Request, res: Response) => {
  try {
    const validation = createTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const { title, description, priority, status, assignedTo } = validation.data;

    // Verify if assignee user exists
    if (assignedTo) {
      if (!mongoose.Types.ObjectId.isValid(assignedTo)) {
        return res.status(400).json({ error: 'Invalid assignedTo user ID' });
      }
      const assignee = await User.findById(assignedTo);
      if (!assignee) {
        return res.status(400).json({ error: 'Assigned user does not exist' });
      }
    }

    const task = new Task({
      title,
      description,
      priority,
      status,
      assignedTo: assignedTo ? new mongoose.Types.ObjectId(assignedTo) : undefined,
      createdBy: req.user!._id
    });

    await task.save();
    await task.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' }
    ]);

    return res.status(201).json({ message: 'Task created successfully', task });
  } catch (error) {
    console.error('Create task error:', error);
    return res.status(500).json({ error: 'Failed to create task' });
  }
});

// UPDATE TASK (ADMIN, MANAGER, EMPLOYEE)
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const validation = updateTaskSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.errors[0].message });
    }

    const updates = validation.data;

    // Role specific logic
    if (req.user!.role === 'EMPLOYEE') {
      // 1. Must be assigned to this task
      if (!task.assignedTo || task.assignedTo.toString() !== req.user!._id.toString()) {
        return res.status(403).json({ error: 'Access denied. You can only update tasks assigned to you.' });
      }

      // 2. Can ONLY update the status field
      const fields = Object.keys(updates).filter((k) => (updates as any)[k] !== undefined);
      const isOnlyStatus = fields.length === 1 && fields[0] === 'status';
      if (!isOnlyStatus) {
        return res.status(403).json({ error: 'Access denied. Employees can only update task status.' });
      }

      task.status = updates.status!;
    } else {
      // ADMIN & MANAGER can update anything
      if (updates.title !== undefined) task.title = updates.title;
      if (updates.description !== undefined) task.description = updates.description;
      if (updates.priority !== undefined) task.priority = updates.priority;
      if (updates.status !== undefined) task.status = updates.status;
      if (updates.assignedTo !== undefined) {
        if (updates.assignedTo) {
          if (!mongoose.Types.ObjectId.isValid(updates.assignedTo)) {
            return res.status(400).json({ error: 'Invalid assignedTo user ID' });
          }
          const assignee = await User.findById(updates.assignedTo);
          if (!assignee) {
            return res.status(400).json({ error: 'Assigned user does not exist' });
          }
          task.assignedTo = new mongoose.Types.ObjectId(updates.assignedTo);
        } else {
          task.assignedTo = undefined;
        }
      }
    }

    await task.save();
    await task.populate([
      { path: 'createdBy', select: 'name email role' },
      { path: 'assignedTo', select: 'name email role' }
    ]);

    return res.json({ message: 'Task updated successfully', task });
  } catch (error) {
    console.error('Update task error:', error);
    return res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE TASK (ADMIN ONLY)
router.delete('/:id', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    return res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Delete task error:', error);
    return res.status(500).json({ error: 'Failed to delete task' });
  }
});

export default router;
