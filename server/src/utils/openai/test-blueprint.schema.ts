// server/src/utils/openai/test-blueprint.schema.ts

export const testBlueprintResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "test_blueprint_schema",
    strict: true,
    schema: {
      type: "object",
      properties: {
        Test_Blueprint: {
          type: "array",
          description: "An array of individual test questions that make up the exam blueprint.",
          items: {
            type: "object",
            properties: {
              question_number: { 
                type: "integer",
                description: "The sequential number of the question on the test." 
              },
              topic: { 
                type: "string",
                description: "The specific IB sub-topic being assessed." 
              },
              Question_Type: { 
                type: "string", 
                enum: ["MCQ", "Structured_Question"],
                description: "The format of the question." 
              },
              Style: { 
                type: "string", 
                enum: ["N/A", "Standard Free-Response", "Data-Based Question"],
                description: "The specific style of the structured question. Use 'N/A' for MCQs." 
              },
              marks: { 
                type: "integer",
                description: "The number of marks allocated to this specific question." 
              }
            },
            required: ["question_number", "topic", "Question_Type", "Style", "marks"],
            additionalProperties: false
          }
        }
      },
      required: ["Test_Blueprint"],
      additionalProperties: false
    }
  }
};