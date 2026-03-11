import { Schema } from 'mongoose';

// We disable _id here so Mongoose doesn't generate unnecessary ObjectIds 
// for every single image or table inside a question's asset array.
export const AssetSchema = new Schema({
  type: { 
    type: String, 
    enum: ['image', 'table', 'plot'], 
    required: true 
  },
  // Used if type === 'image'
  image_data: { 
    type: String 
  },
  // Used if type === 'table'
  table_data: { 
    type: String 
  },
  // Used if type === 'plot'
  plot_data: {
    chart_type: { type: String },
    x_label: { type: String },
    y_label: { type: String },
    x_data: [{ type: Number }],
    y_data: [{ type: Number }]
  }
}, { _id: false });