// server/src/routes/test.routes.ts
import { Router, type Response } from 'express'; // Removed 'Request' from here
import { requireAuth, type AuthRequest } from '../middleware/auth.middleware.js'; // Imported AuthRequest
import { Test } from '../models/test.model.js';
import { TestVersion } from '../models/test-version.model.js';
import { MCQ } from '../models/mcq.model.js';
import { StructuredQuestion } from '../models/structured-question.model.js';

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

// Save the generated layout to a specific Test Version
router.put('/:testId/versions/:versionId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { versionId } = req.params;
    const { layout } = req.body;

    if (!layout || !Array.isArray(layout)) {
      res.status(400).json({ message: 'Invalid layout data provided.' });
      return;
    }

    // Extract just the question IDs from the layout to populate the 'questions' array
    const questions = layout
      .filter((item: any) => item.itemType === 'Question' && item.itemId)
      .map((item: any) => ({
        questionId: item.itemId,
        questionModel: item.itemModel
      }));

    const updatedVersion = await TestVersion.findByIdAndUpdate(
      versionId,
      { layout, questions },
      { new: true }
    );

    if (!updatedVersion) {
      res.status(404).json({ message: 'Test version not found.' });
      return;
    }

    res.status(200).json({ message: 'Test version saved successfully', version: updatedVersion });
  } catch (error) {
    console.error('Failed to save test version:', error);
    res.status(500).json({ message: 'Failed to save test document' });
  }
});

// GET all tests for the authenticated user
router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. TypeScript safeguard: ensure req.user exists
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Now TypeScript knows req.user.userId is strictly a string
    const tests = await Test.find({ createdBy: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tests' });
  }
});

// GET a specific test, its active version, and the populated question data
router.get('/:testId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) { res.status(404).json({ message: 'Test not found' }); return; }

    const version = await TestVersion.findOne({ testId: test._id });
    if (!version) { res.status(404).json({ message: 'Version not found' }); return; }

    // Manually fetch the question documents referenced in the version
    const mcqIds = version.questions.filter(q => q.questionModel === 'MCQ').map(q => q.questionId);
    const sqIds = version.questions.filter(q => q.questionModel === 'StructuredQuestion').map(q => q.questionId);

    const mcqs = await MCQ.find({ _id: { $in: mcqIds } });
    const sqs = await StructuredQuestion.find({ _id: { $in: sqIds } });

    // Combine and return
    res.status(200).json({ 
      test, 
      version, 
      generatedQuestions: [...mcqs, ...sqs] 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to load test data' });
  }
});

export default router;