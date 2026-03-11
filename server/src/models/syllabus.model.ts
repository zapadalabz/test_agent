import mongoose, { Schema, Document } from 'mongoose';

// --- 1. SYLLABUS ---
export const SyllabusSchema = new Schema({
  subject: { type: String, required: true }, // e.g., "Physics"
  firstAssessmentYear: { type: Number, default: 2025 } 
});
export const Syllabus = mongoose.model('Syllabus', SyllabusSchema);

// --- 2. THEME ---
export const ThemeSchema = new Schema({
  syllabusId: { type: Schema.Types.ObjectId, ref: 'Syllabus', required: true },
  label: { type: String, required: true }, // e.g., "A"
  title: { type: String, required: true }  // e.g., "Space, time and motion"
});
export const Theme = mongoose.model('Theme', ThemeSchema);

// --- 3. TOPIC (Node) ---
export const TopicSchema = new Schema({
  themeId: { type: Schema.Types.ObjectId, ref: 'Theme', required: true },
  topicCode: { type: String, required: true }, // e.g., "A.1"
  title: { type: String, required: true }, // e.g., "Kinematics"
  
  // Mapping the dot notation from your first image
  // 1 Dot = Core, 2 Dots = Core + Additional Higher Level (AHL), 3 Dots = AHL Only
  teachingLevel: { 
    type: String, 
    enum: ['Core', 'Core+AHL', 'AHL'], 
    required: true 
  } 
});
export const Topic = mongoose.model('Topic', TopicSchema);

// --- 4. UNDERSTANDING (Bullet Points) ---
export const UnderstandingSchema = new Schema({
  topicId: { type: Schema.Types.ObjectId, ref: 'Topic', required: true },
  statement: { type: String, required: true }, // e.g., "the change in position is the displacement"
  
  // Even within a "Core+AHL" topic, specific bullet points might be HL only
  level: { 
    type: String, 
    enum: ['SL', 'HL'], 
    default: 'SL' 
  } 
});
export const Understanding = mongoose.model('Understanding', UnderstandingSchema);