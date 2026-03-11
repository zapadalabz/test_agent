import mongoose, { Schema, Document } from 'mongoose';
import { AssetSchema } from './asset.schema.js';

// Helper schema for the strict markscheme arrays
const MarkschemePointSchema = new Schema({
  text: { 
    type: String, 
    required: true 
  },
  point_type: { 
    type: String, 
    enum: ['Mandatory', 'Alternative (OWTTE)', 'Do Not Accept (DNA)'], 
    required: true 
  }
}, { _id: false });

export const StructuredQuestionSchema = new Schema({
  Question_Type: { 
    type: String, 
    default: 'Structured_Question', 
    enum: ['Structured_Question'],
    required: true
  },
  Stem: {
    text: { type: String, required: true },
    assets: [AssetSchema] // <-- Applied to the main stem
  },
  Parts: [{
    part_label: { type: String, required: true },
    AO_level: { type: String, enum: ['AO1', 'AO2', 'AO3'], required: true },
    command_term: { 
      type: String, 
      enum: ["State", "Define", "List", "Label", "Calculate", "Describe", "Outline", "Explain", "Evaluate", "Discuss", "Suggest"],
      required: true 
    },
    text: { type: String, required: true },
    assets: [AssetSchema], // <-- Applied to the individual part [cite: 28]
    marks: { type: Number, required: true }
  }],
  Markscheme: [{
    part_label: { type: String, required: true },
    points: [MarkschemePointSchema]
  }],
  // Link back to your syllabus hierarchy
  topicId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Topic' 
  }
}, { timestamps: true });

export const StructuredQuestion = mongoose.model('StructuredQuestion', StructuredQuestionSchema);