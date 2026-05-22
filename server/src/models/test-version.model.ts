import mongoose, { Schema, Document } from 'mongoose';

export const TestVersionSchema = new Schema({
  testId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Test', 
    required: true 
  }, // Links back to the parent Test schema 
  versionName: { 
    type: String, 
    required: true 
  }, // e.g., "Version A", "Make-up Exam"
  
  // Store the blueprint configuration
  blueprint: [{
    question_number: Number,
    topic: String,
    Question_Type: String,
    Style: String,
    marks: Number
  }],

  // High-level array holding references to the specific questions generated for this version 
  questions: [{
    questionId: { 
      type: Schema.Types.ObjectId, 
      required: true 
    },
    questionModel: { 
      type: String, 
      enum: ['MCQ', 'StructuredQuestion'], 
      required: true 
    }
  }],
  
  // Defines the sequence of the test document for the frontend rendering 
  layout: [{
    id: { type: String }, // React UI id
    title: { type: String }, // Display title for sidebar
    itemType: { 
      type: String, 
      enum: ['Question', 'StaticAsset', 'BlankPage'], 
      required: true 
    },
    itemId: { 
      type: Schema.Types.ObjectId 
    }, 
    itemModel: { 
      type: String, 
      enum: ['MCQ', 'StructuredQuestion', 'StaticAsset'] 
    } 
  }]
}, { timestamps: true });

export const TestVersion = mongoose.model('TestVersion', TestVersionSchema);