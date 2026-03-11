// server/src/utils/openai/mcq.schema.ts

export const mcqResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "mcq_schema",
    strict: true,
    schema: {
      type: "object",
      properties: {
        Question_Type: {
          type: "string",
          enum: ["MCQ"]
        },
        AO_Level: {
          type: "string",
          enum: ["AO1", "AO2"]
        },
        Stem: {
          type: "object",
          properties: {
            text: { type: "string" },
            assets: {
              type: "array",
              items: {
                anyOf: [
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["image"] },
                      image_data: { type: "string" }
                    },
                    required: ["type", "image_data"],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["table"] },
                      table_data: { type: "string" }
                    },
                    required: ["type", "table_data"],
                    additionalProperties: false
                  },
                  {
                    type: "object",
                    properties: {
                      type: { type: "string", enum: ["plot"] },
                      plot_data: {
                        type: "object",
                        properties: {
                          chart_type: { type: "string" },
                          x_label: { type: "string" },
                          y_label: { type: "string" },
                          x_data: { type: "array", items: { type: "number" } },
                          y_data: { type: "array", items: { type: "number" } }
                        },
                        required: ["chart_type", "x_label", "y_label", "x_data", "y_data"],
                        additionalProperties: false
                      }
                    },
                    required: ["type", "plot_data"],
                    additionalProperties: false
                  }
                ]
              }
            }
          },
          required: ["text", "assets"],
          additionalProperties: false
        },
        Options: {
          type: "array",
          items: {
            type: "object",
            properties: {
              label: { type: "string", enum: ["A", "B", "C", "D"] },
              text: { type: "string" }
            },
            required: ["label", "text"],
            additionalProperties: false
          }
        },
        Correct_Answer: {
          type: "string",
          enum: ["A", "B", "C", "D"]
        },
        Distractor_Rationale: { type: "string" }
      },
      required: ["Question_Type", "AO_Level", "Stem", "Options", "Correct_Answer", "Distractor_Rationale"],
      additionalProperties: false
    }
  }
};