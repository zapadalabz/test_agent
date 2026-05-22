// server/src/routes/test.routes.ts
import { Router, type Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.middleware.js';
import { Test } from '../models/test.model.js';
import { TestVersion } from '../models/test-version.model.js';
import { MCQ } from '../models/mcq.model.js';
import { StructuredQuestion } from '../models/structured-question.model.js';

const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, subject, gradeLevel } = req.body;
    
    const newTest = new Test({
      title,
      subject,
      gradeLevel,
      createdBy: req.user?.userId 
    });
    const savedTest = await newTest.save();

    const newVersion = new TestVersion({
      testId: savedTest._id,
      versionName: "Draft Version",
      questions: [],
      layout: [],
      blueprint: []
    });
    const savedVersion = await newVersion.save();

    res.status(201).json({ test: savedTest, version: savedVersion });
  } catch (error) {
    console.error('Failed to initialize test:', error);
    res.status(500).json({ message: 'Failed to create test document' });
  }
});

// Save the generated layout and blueprint to a specific Test Version
router.put('/:testId/versions/:versionId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { versionId } = req.params;
    const { layout, blueprint } = req.body;

    if (!layout || !Array.isArray(layout)) {
      res.status(400).json({ message: 'Invalid layout data provided.' });
      return;
    }

    const questions = layout
      .filter((item: any) => item.itemType === 'Question' && item.itemId)
      .map((item: any) => ({
        questionId: item.itemId,
        questionModel: item.itemModel
      }));

    const updatedVersion = await TestVersion.findByIdAndUpdate(
      versionId,
      { layout, questions, ...(blueprint && { blueprint }) },
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

router.get('/', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const tests = await Test.find({ createdBy: req.user.userId }).sort({ createdAt: -1 });
    res.status(200).json(tests);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch tests' });
  }
});

router.get('/:testId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const test = await Test.findById(req.params.testId);
    if (!test) { res.status(404).json({ message: 'Test not found' }); return; }

    const version = await TestVersion.findOne({ testId: test._id });
    if (!version) { res.status(404).json({ message: 'Version not found' }); return; }

    const mcqIds = version.questions.filter(q => q.questionModel === 'MCQ').map(q => q.questionId);
    const sqIds = version.questions.filter(q => q.questionModel === 'StructuredQuestion').map(q => q.questionId);

    const mcqs = await MCQ.find({ _id: { $in: mcqIds } });
    const sqs = await StructuredQuestion.find({ _id: { $in: sqIds } });

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

// Delete a test and its versions
router.delete('/:testId', requireAuth, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // 1. Add TypeScript safeguard to narrow the type (removes 'undefined')
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // 2. req.user.userId is now strictly a string
    const test = await Test.findOneAndDelete({ 
      _id: req.params.testId, 
      createdBy: req.user.userId 
    });
    
    if (!test) { 
      res.status(404).json({ message: 'Test not found or unauthorized' }); 
      return; 
    }

    // Cascade delete versions
    await TestVersion.deleteMany({ testId: test._id });
    
    res.status(200).json({ message: 'Test deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to delete test' });
  }
});

export default router;