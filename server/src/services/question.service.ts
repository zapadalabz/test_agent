import { MCQ } from '../models/mcq.model.js';
import { StructuredQuestion } from '../models/structured-question.model.js';

export const QuestionService = {
  async saveGeneratedQuestion(item: any, parsedLLMOutput: any) {
    let savedQuestion;

    if (item.Question_Type === "MCQ") {
      const newMCQ = new MCQ({
        ...parsedLLMOutput,
        topicId: item.topicId // Link to syllabus hierarchy [cite: 39]
      });
      savedQuestion = await newMCQ.save();
    } else if (item.Question_Type === "Structured_Question") {
      const newStructured = new StructuredQuestion({
        ...parsedLLMOutput,
        topicId: item.topicId
      });
      savedQuestion = await newStructured.save();
    } else {
      throw new Error(`Unsupported Question Type: ${item.Question_Type}`);
    }

    // Return as a plain object with blueprint metadata merged [cite: 44]
    return {
      ...savedQuestion.toObject(),
      question_number: item.question_number,
      topic: item.topic
    };
  }
};