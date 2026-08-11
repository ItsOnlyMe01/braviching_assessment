import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';
import { Task } from './models/Task';
import { connectDB } from './db';

dotenv.config();

const usersData = [
  {
    name: 'System Admin',
    email: 'admin@taskmanager.local',
    password: 'password123',
    role: 'ADMIN' as const
  },
  {
    name: 'Jane Manager',
    email: 'manager@taskmanager.local',
    password: 'password123',
    role: 'MANAGER' as const
  },
  {
    name: 'John Employee',
    email: 'employee@taskmanager.local',
    password: 'password123',
    role: 'EMPLOYEE' as const
  },
  {
    name: 'Alice Employee',
    email: 'employee2@taskmanager.local',
    password: 'password123',
    role: 'EMPLOYEE' as const
  }
];

async function seed() {
  try {
    await connectDB();
    console.log('Seeding database...');

    // Clear existing data
    await User.deleteMany({});
    await Task.deleteMany({});
    console.log('Cleared existing Users and Tasks');

    // Create users
    const users = [];
    for (const u of usersData) {
      const user = new User(u);
      await user.save();
      users.push(user);
      console.log(`Created user: ${user.email} (${user.role})`);
    }

    const adminUser = users.find(u => u.role === 'ADMIN')!;
    const managerUser = users.find(u => u.role === 'MANAGER')!;
    const employeeUser = users.find(u => u.email === 'employee@taskmanager.local')!;
    const aliceUser = users.find(u => u.email === 'employee2@taskmanager.local')!;

    // Create sample tasks
    const tasksData = [
      {
        title: 'Complete project proposal',
        description: 'Draft the initial roadmap and project scope document.',
        status: 'TODO' as const,
        priority: 'HIGH' as const,
        assignedTo: managerUser._id,
        createdBy: adminUser._id
      },
      {
        title: 'Setup MongoDB connection',
        description: 'Integrate Mongoose and verify connection parameters.',
        status: 'DONE' as const,
        priority: 'MEDIUM' as const,
        assignedTo: employeeUser._id,
        createdBy: managerUser._id
      },
      {
        title: 'Implement JWT Auth flow',
        description: 'Configure cookie verification and login/logout endpoints.',
        status: 'IN_PROGRESS' as const,
        priority: 'HIGH' as const,
        assignedTo: employeeUser._id,
        createdBy: managerUser._id
      },
      {
        title: 'Review tasks styling',
        description: 'Verify responsiveness of the tasks page.',
        status: 'TODO' as const,
        priority: 'LOW' as const,
        assignedTo: aliceUser._id,
        createdBy: managerUser._id
      }
    ];

    for (const t of tasksData) {
      const task = new Task(t);
      await task.save();
      console.log(`Created task: "${task.title}" (assigned to: ${t.assignedTo})`);
    }

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

seed();
