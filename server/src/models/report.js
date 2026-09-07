import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['lost', 'found'] },
    category: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    contactName: { type: String, required: true, trim: true },
    contactEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    status: { type: String, enum: ['active', 'resolved'], default: 'active' }
  },
  { timestamps: true }
);

export const Report = mongoose.model('Report', reportSchema);
