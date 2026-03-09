// server/src/server.ts
import express, { type Express, type Request, type Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

// Load environment variables from the .env file
dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Middleware
// ==========================================
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173', // Vite's default port
  credentials: true, // Required for secure HttpOnly cookies
}));
app.use(express.json()); // Parses incoming JSON payloads
app.use(cookieParser()); // Parses cookies for JWT authentication

// ==========================================
// Database Connection
// ==========================================
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI as string;
    if (!mongoURI) {
      throw new Error('MONGO_URI is not defined in the .env file');
    }
    
    await mongoose.connect(mongoURI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

connectDB();

// ==========================================
// Basic Route Test
// ==========================================
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'Server is healthy and running' });
});

// ==========================================
// Start Server
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});