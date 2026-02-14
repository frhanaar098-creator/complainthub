import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import Complaint from '../models/Complaint.js';
import { protect, roleCheck } from '../middleware/auth.js';
import { uploadComplaintFiles, maybeUploadComplaintFiles } from '../middleware/upload.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const router = express.Router();

const VALID_CATEGORIES = ['Infrastructure', 'Academics', 'Hostel', 'Library', 'Cafeteria', 'Sports & Recreation', 'Transportation', 'Security', 'Fees & Finance', 'Laboratory', 'WiFi & Internet', 'Cleanliness', 'Faculty & Staff', 'Administration', 'Exam & Evaluation', 'Others'];
const VALID_STATUSES = ['pending', 'in_progress', 'resolved', 'rejected', 'withdrawn'];
const VALID_PRIORITIES = ['urgent', 'high', 'medium', 'low'];

router.use(protect);

// GET /api/complaints - withdrawn excluded by default
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'student') {
      query.studentId = req.user._id;
    }
    if (req.query.showWithdrawn !== 'true') {
      query.status = { $ne: 'withdrawn' };
    }

    let complaints = Complaint.find(query)
      .populate('studentId', 'name email')
      .sort({ createdAt: -1 });

    const { sort, status, category, priority } = req.query;
    if (status) complaints = complaints.where('status', status);
    if (priority) complaints = complaints.where('priority', priority);
    if (category) complaints = complaints.where('category', category);
    if (sort === 'date_asc') complaints = complaints.sort({ createdAt: 1 });
    if (sort === 'status') complaints = complaints.sort({ status: 1 });
    if (sort === 'priority') complaints = complaints.sort({ priority: 1 });

    const result = await complaints.lean();
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST /api/complaints - Create complaint with attachments (students only)
router.post('/', roleCheck('student'), uploadComplaintFiles, async (req, res) => {
  try {
    const { title, description, category, priority } = req.body;
    if (!title || !description || !category) {
      return res.status(400).json({ message: 'Please provide title, description and category' });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ message: 'Invalid category' });
    }
    const validPriority = priority && VALID_PRIORITIES.includes(priority) ? priority : 'medium';

    const attachments = (req.files || []).map((f) => ({
      filename: f.filename,
      originalName: f.originalname,
    }));

    const complaint = await Complaint.create({
      title,
      description,
      category,
      studentId: req.user._id,
      attachments,
      priority: validPriority,
    });
    const populated = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email')
      .lean();
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// PATCH /api/complaints/:id - Manager: update status. Student: edit (only when pending)
router.patch('/:id', maybeUploadComplaintFiles, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });

    if (req.user.role === 'manager') {
      const { status, priority } = req.body;
      if (status && VALID_STATUSES.includes(status)) complaint.status = status;
      if (priority && VALID_PRIORITIES.includes(priority)) complaint.priority = priority;
      await complaint.save();
      const populated = await Complaint.findById(complaint._id)
        .populate('studentId', 'name email')
        .lean();
      return res.json(populated);
    }

    if (req.user.role === 'student') {
      if (complaint.studentId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to edit this complaint' });
      }
      if (complaint.status !== 'pending') {
        return res.status(400).json({ message: 'Can only edit complaints with pending status' });
      }
      const { title, description, category, priority } = req.body;
      if (title) complaint.title = title;
      if (description) complaint.description = description;
      if (category && VALID_CATEGORIES.includes(category)) complaint.category = category;
      if (priority && VALID_PRIORITIES.includes(priority)) complaint.priority = priority;
      const newFiles = req.files || [];
      const newAttachments = newFiles.map((f) => ({ filename: f.filename, originalName: f.originalname }));
      complaint.attachments = [...(complaint.attachments || []), ...newAttachments];
      await complaint.save();
      const populated = await Complaint.findById(complaint._id)
        .populate('studentId', 'name email')
        .lean();
      return res.json(populated);
    }

    return res.status(403).json({ message: 'Access denied' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// POST /api/complaints/:id/withdraw - Student withdraw (only when pending)
router.post('/:id/withdraw', roleCheck('student'), async (req, res) => {
  try {
    const complaint = await Complaint.findOne({
      _id: req.params.id,
      studentId: req.user._id,
    });
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    if (complaint.status !== 'pending') {
      return res.status(400).json({ message: 'Can only withdraw complaints with pending status' });
    }
    complaint.status = 'withdrawn';
    await complaint.save();
    const populated = await Complaint.findById(complaint._id)
      .populate('studentId', 'name email')
      .lean();
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

// DELETE /api/complaints/:id - Managers only
router.delete('/:id', roleCheck('manager'), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) return res.status(404).json({ message: 'Complaint not found' });
    res.json({ message: 'Complaint deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error' });
  }
});

export default router;
