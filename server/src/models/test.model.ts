import mongoose, { Schema, Document } from 'mongoose';

export const TestSchema = new Schema({
  title: { 
    type: String, 
    required: true 
  },
  subject: { 
    type: String, 
    required: true 
  }, // e.g., "Biology" or "Physics" 
  gradeLevel: { 
    type: String, 
    required: true 
  }, // e.g., "HL" or "SL" 
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

export const Test = mongoose.model('Test', TestSchema);