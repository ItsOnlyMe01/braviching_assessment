import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';

export type UserRole = 'ADMIN' | 'MANAGER' | 'EMPLOYEE';

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['ADMIN', 'MANAGER', 'EMPLOYEE'], default: 'EMPLOYEE' }
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password || '');
};

// Remove password when sending to JSON
UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    delete ret.password;
    return ret;
  }
});

export const User = mongoose.model<IUser>('User', UserSchema);
