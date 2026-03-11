import mongoose, { Schema, Document } from 'mongoose';

// --- USER SCHEMA ---
export const UserSchema = new Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'admin'], default: 'teacher' }
}, { timestamps: true });

export const User = mongoose.model('User', UserSchema);