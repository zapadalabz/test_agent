// server/src/routes/generate.routes.ts
import { Router, type Request, type Response } from 'express';
import { AzureOpenAI } from 'openai';
import { requireAuth } from '../middleware/auth.middleware.js';

import { mcqResponseFormat } from '../utils/openai/mcq.schema.js';
import { structuredQuestionResponseFormat } from '../utils/openai/structured-question.schema.js';
import { testBlueprintResponseFormat } from '../utils/openai/test-blueprint.schema.js';
import { BASE_CONTEXT, getMCQPrompt, getStructuredPrompt } from '../utils/openai/prompts.js';
import { QuestionService } from '../services/question.service.js';



const router = Router();

// Initialize the Azure OpenAI client
const azureClient = new AzureOpenAI({
  apiKey: process.env.AZURE_OPENAI_API_KEY,
  endpoint: process.env.AZURE_OPENAI_ENDPOINT,
  apiVersion: process.env.AZURE_OPENAI_API_VERSION,
});

router.post('/blueprint', requireAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const { topics, totalMarks, mcqAllocation, sfrAllocation, dbqAllocation } = req.body;

    if (!topics || !totalMarks) {
      res.status(400).json({ message: 'Missing required blueprint parameters' });
      return;
    }

    if (mcqAllocation + sfrAllocation + dbqAllocation !== totalMarks) {
        res.status(400).json({ message: 'The allocated marks must equal the total mark budget.' });
        return;
    }

    const userPrompt = `
        INPUT PARAMETERS:
        - Target Syllabus Topics: ${topics.join(', ')}
        - Total Test Mark Budget: ${totalMarks}
        - MCQ Allocation: ${mcqAllocation}
        - Standard Free-Response Allocation: ${sfrAllocation}
        - Data-Based Question Allocation: ${dbqAllocation}

        RULES FOR GENERATION:
        1. Blueprint Creation: Distribute the total marks across individual questions strictly adhering to the teacher's mark allocations for the three question types.
        2. Logic: Ensure a logical progression of topics and difficulty.
        3. Output Format: Output strictly in JSON matching this schema:

        {
          "Test_Blueprint": [
            {
              "question_number": 1,
              "topic": "Specific sub-topic from the inputs",
              "Question_Type": "MCQ", 
              "Style": "N/A",
              "marks": 1
            },
            {
              "question_number": 2,
              "topic": "Another specific sub-topic",
              "Question_Type": "Structured_Question",
              "Style": "Standard Free-Response", 
              "marks": 5
            },
            {
              "question_number": 3,
              "topic": "Another specific sub-topic",
              "Question_Type": "Structured_Question",
              "Style": "Data-Based Question", 
              "marks": 4
            }
          ]
        }
        `;

    const response = await azureClient.chat.completions.create({
      model: process.env.AZURE_OPENAI_MODEL || "gpt-5-mini", // Your specified Azure deployment model
      messages: [
        { role: "system", content: BASE_CONTEXT },
        { role: "user", content: userPrompt }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "test_blueprint_schema",
          strict: true,
          schema: testBlueprintResponseFormat as any,
        }
      }
    });

    const content = response.choices[0]?.message.content;
    if (!content) {
      throw new Error("No content returned from Azure OpenAI");
    }

    const blueprintJSON = JSON.parse(content); //
    
    // Calculate if the LLM hallucinated the mark budget
    const generatedTotalMarks = blueprintJSON.Test_Blueprint.reduce(
      (sum: number, q: any) => sum + q.marks, 
      0
    );
    
    const budgetMismatch = generatedTotalMarks !== totalMarks; //

    res.status(200).json({
      blueprint: blueprintJSON.Test_Blueprint,
      budgetMismatch,
      expectedMarks: totalMarks,
      actualMarks: generatedTotalMarks
    });

  } catch (error) {
    console.error('Blueprint Generation Error:', error);
    res.status(500).json({ message: 'Failed to generate blueprint' });
  }
});

// Helper function for exponential backoff
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

router.post('/questions', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { blueprint } = req.body;

  if (!blueprint || !Array.isArray(blueprint)) {
    res.status(400).json({ message: 'Invalid or missing blueprint array' });
    return;
  }

  // 1. Set up SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Flush headers immediately to establish the stream
  res.flushHeaders(); 

  // Helper to send formatted SSE messages
  const sendEvent = (event: string, data: any) => {
    res.write(`event: ${event}\n`);
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  try {
    sendEvent('status', { message: 'Starting question generation...' });

    const generatedQuestions = [];

    // 2. Iterate through the blueprint
    for (let i = 0; i < blueprint.length; i++) {
      const item = blueprint[i];
      sendEvent('progress', { 
        message: `Generating question ${item.question_number} of ${blueprint.length}...`,
        current: item.question_number,
        total: blueprint.length
      });

      let retries = 0;
      const maxRetries = 3;
      let success = false;
      let questionData = null;

      // 3. Exponential Backoff Loop
      while (!success && retries < maxRetries) {
        try {
            // 1. Dynamically select Prompt and Schema based on Question_Type
            let userPrompt = "";
            let currentResponseFormat: any;

            if (item.Question_Type === "MCQ") {
            userPrompt = getMCQPrompt(item.topic);
            currentResponseFormat = mcqResponseFormat;
            } else if (item.Question_Type === "Structured_Question") {
            userPrompt = getStructuredPrompt(item.topic, item.Style, item.marks);
            currentResponseFormat = structuredQuestionResponseFormat;
            } else {
            throw new Error(`Unknown Question_Type: ${item.Question_Type}`);
            }

            // 2. Make the LLM Call
            const response = await azureClient.chat.completions.create({
            model: process.env.AZURE_OPENAI_MODEL || "gpt-5-mini",
            messages: [
                { role: "system", content: BASE_CONTEXT },
                { role: "user", content: userPrompt }
            ],
            response_format: currentResponseFormat
            });

            const content = response.choices[0]?.message.content;
            if (!content) {
            throw new Error("No content returned from Azure OpenAI");
            }

            // 3. Parse and merge with blueprint metadata
            const parsedQuestion = JSON.parse(content);

            questionData = await QuestionService.saveGeneratedQuestion(item, parsedQuestion);
            
            success = true; 
        } catch (error: any) {
          if (error.status === 429) {
            retries++;
            const backoffTime = Math.pow(2, retries) * 1000; // 2s, 4s, 8s
            sendEvent('warning', { message: `Rate limit hit. Retrying in ${backoffTime/1000}s...` });
            await delay(backoffTime);
          } else {
            throw error; // If it's not a rate limit, break the loop and fail
          }
        }
      }

      if (!success) {
         throw new Error(`Failed to generate question ${item.question_number} after ${maxRetries} retries.`);
      }

      generatedQuestions.push(questionData);
      
      // Optionally stream the completed question to the frontend immediately!
      sendEvent('question_ready', { question: questionData });
    }

    // 4. Close the stream successfully
    sendEvent('complete', { 
      message: 'All questions generated successfully.',
      results: generatedQuestions 
    });
    res.end();

  } catch (error: any) {
    console.error('Question Generation Error:', error);
    sendEvent('error', { message: error.message || 'An error occurred during generation.' });
    res.end();
  }
});

export default router;