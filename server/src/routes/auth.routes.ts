// server/src/routes/auth.routes.ts
import { Router, type Request, type Response } from 'express';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js'; // Adjust path if needed

const router = Router();

// 1. Assert the Client ID as a string right away to satisfy TypeScript
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID as string;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

router.post('/google', async (req: Request, res: Response): Promise<void> => {
  try {
    const { credential } = req.body;

    // Safety check
    if (!GOOGLE_CLIENT_ID) {
      res.status(500).json({ message: 'Server configuration error: Missing Google Client ID' });
      return;
    }

    // 2. The audience is now strictly a string
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID, 
    });
    
    const payload = ticket.getPayload();
    if (!payload || !payload.email || !payload.sub) {
      res.status(400).json({ message: 'Invalid Google token' });
      return;
    }

    let user = await User.findOne({ email: payload.email });
    if (!user) {
        const userName = payload.name || 'Google User';
        // 3. Match your UserSchema perfectly
        user = await User.create({
            googleId: payload.sub, // 'sub' is Google's unique user ID string
            email: payload.email,
            name: userName,
            role: 'teacher', // Matching your schema's default
        });
    }

    const token = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({ message: 'Login successful', user });
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ message: 'Logged out successfully' });
});

export default router;