// server/src/routes/test.routes.ts
import { Router, type Response } from 'express'; // Removed 'Request' from here
import { requireAuth, type AuthRequest } from '../middleware/auth.middleware.js'; // Imported AuthRequest
import { Test } from '../models/test.model.js';
import { TestVersion } from '../models/test-version.model.js';

const router = Router();

// Replaced Request with AuthRequest
router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, subject, gradeLevel } = req.body;
    
    // Create the Parent Test
    const newTest = new Test({
      title,
      subject,
      gradeLevel,
      // Changed _id to userId to match your TokenPayload interface
      createdBy: req.user?.userId 
    });
    const savedTest = await newTest.save();

    // Initialize the first Draft Version
    const newVersion = new TestVersion({
      testId: savedTest._id,
      versionName: "Draft Version",
      questions: [],
      layout: []
    });
    const savedVersion = await newVersion.save();

    res.status(201).json({ 
      test: savedTest, 
      version: savedVersion 
    });
  } catch (error) {
    console.error('Failed to initialize test:', error);
    res.status(500).json({ message: 'Failed to create test document' });
  }
});

export default router;