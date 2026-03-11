// server/src/models/mcq.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { AssetSchema } from './asset.schema.js';

export const MCQSchema = new Schema({
  Question_Type: { 
    type: String, 
    default: 'MCQ', 
    enum: ['MCQ'],
    required: true
  },
  AO_Level: { 
    type: String, 
    enum: ['AO1', 'AO2'], 
    required: true 
  },
  Stem: {
    text: { type: String, required: true },
    assets: [AssetSchema] 
  },
  Options: [{
    label: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    text: { type: String, required: true }
  }],
  Correct_Answer: { 
    type: String, 
    enum: ['A', 'B', 'C', 'D'], 
    required: true 
  },
  Distractor_Rationale: { 
    type: String, 
    required: true 
  },
  // Link back to your syllabus hierarchy
  topicId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Topic' 
  } 
}, { timestamps: true });

export const MCQ = mongoose.model('MCQ', MCQSchema);