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
    itemType: { 
      type: String, 
      enum: ['Question', 'StaticAsset', 'BlankPage'], 
      required: true 
    }, // Can be a Question, a PDF Asset, or a purely Blank Page 
    itemId: { 
      type: Schema.Types.ObjectId 
    }, // Nullable: Blank pages don't need an ID, but Questions and Assets do 
    itemModel: { 
      type: String, 
      enum: ['MCQ', 'StructuredQuestion', 'StaticAsset'] 
    } // Required for Mongoose dynamic population to know which collection to pull from 
  }]
}, { timestamps: true });

export const TestVersion = mongoose.model('TestVersion', TestVersionSchema);