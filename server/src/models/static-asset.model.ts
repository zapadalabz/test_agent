import mongoose, { Schema, Document } from 'mongoose';

// --- STATIC ASSET SCHEMA ---
export const StaticAssetSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['CoverPage', 'FormulaSheet', 'Other'], required: true },
  cloudUrl: { type: String, required: true }, // Cloudinary/S3 URL
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const StaticAsset = mongoose.model('StaticAsset', StaticAssetSchema);
