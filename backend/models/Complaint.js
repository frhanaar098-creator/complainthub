import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Infrastructure', 'Academics', 'Hostel', 'Library', 'Cafeteria', 'Sports & Recreation', 'Transportation', 'Security', 'Fees & Finance', 'Laboratory', 'WiFi & Internet', 'Cleanliness', 'Faculty & Staff', 'Administration', 'Exam & Evaluation', 'Others'],
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'resolved', 'rejected', 'withdrawn'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['urgent', 'high', 'medium', 'low'],
      default: 'medium',
    },
    attachments: [
      {
        filename: String,
        originalName: String,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model('Complaint', complaintSchema);
