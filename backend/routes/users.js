import express from 'express';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/users/me - placeholder, auth/me handles this
router.get('/me', protect, (req, res) => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
  });
});

export default router;
