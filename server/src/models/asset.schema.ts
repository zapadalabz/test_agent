import { Schema } from 'mongoose';

// We disable _id here so Mongoose doesn't generate unnecessary ObjectIds 
// for every single image or table inside a question's asset array.

const PlotDataSchema = new Schema({
  chart_type: { type: String, required: true },
  x_label: { type: String, required: true },
  y_label: { type: String, required: true },
  x_data: [{ type: Number }],
  y_data: [{ type: Number }]
}, { _id: false });


export const AssetSchema = new Schema({
  type: { 
    type: String, 
    enum: ['image', 'table', 'plot'], 
    required: true 
  },
  image_data: { 
    type: String,
    required: function(this: any) {
      // Strictly required if it's an image AND there is no prompt yet
      return this.type === 'image' && !this.generated_prompt;
    }
  },
  generated_prompt: { 
    type: String,
    required: function(this: any) {
       // Strictly required if it's an image AND the base image data has been cleared
       return this.type === 'image' && !this.image_data;
    }
  },
  table_data: { 
    type: String,
    // Strictly required only if the asset is a table
    required: function(this: any) { return this.type === 'table'; }
  },
  plot_data: {
    type: PlotDataSchema,
    required: function(this: any) { return this.type === 'plot'; }
  }
}, { _id: false });