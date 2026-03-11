// server/src/utils/openai/structured-question.schema.ts

export const structuredQuestionResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "structured_question_schema",
    strict: true,
    schema: {
      type: "object",
      properties: {
        Question_Type: {
          type: "string",
          enum: ["Structured_Question"]
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
        Parts: {
          type: "array",
          items: {
            type: "object",
            properties: {
              part_label: { type: "string" },
              AO_level: { type: "string", enum: ["AO1", "AO2", "AO3"] },
              command_term: { type: "string", enum: ["State", "Define", "List", "Label", "Calculate", "Describe", "Outline", "Explain", "Evaluate", "Discuss", "Suggest"] },
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
              },
              marks: { type: "integer" }
            },
            required: ["part_label", "AO_level", "command_term", "text", "assets", "marks"],
            additionalProperties: false
          }
        },
        Markscheme: {
          type: "array",
          items: {
            type: "object",
            properties: {
              part_label: { type: "string" },
              points: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    text: {
                      type: "string",
                      description: "The specific content of the scoring point."
                    },
                    point_type: {
                      type: "string",
                      enum: ["Mandatory", "Alternative (OWTTE)", "Do Not Accept (DNA)"],
                      description: "The strictness category of this scoring point."
                    }
                  },
                  required: ["text", "point_type"],
                  additionalProperties: false
                }
              }
            },
            required: ["part_label", "points"],
            additionalProperties: false
          }
        }
      },
      required: ["Question_Type", "Stem", "Parts", "Markscheme"],
      additionalProperties: false
    }
  }
};