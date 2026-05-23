const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { verifyToken } = require('../middleware/auth');

// Get unread notifications
router.get('/', verifyToken, async (req, res) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', req.user.id)
    .eq('is_read', false)
    .order('created_at', { ascending: false });

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Mark as read
router.put('/:id/read', verifyToken, async (req, res) => {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', req.params.id);
  res.json({ message: 'Marked as read' });
});

module.exports = router;