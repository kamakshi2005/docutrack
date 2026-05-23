const express = require('express');
const router = express.Router();
const supabase = require('../utils/supabase');
const { verifyToken } = require('../middleware/auth');

const TRANSITIONS = {
  'Submitted':      { to: 'Faculty Review', roles: ['teacher'] },
  'Faculty Review': { to: 'HOD Approval',  roles: ['teacher'] },
  'HOD Approval':   { to: 'Approved',       roles: ['hod'] },
};

const REJECT_FROM = ['Submitted', 'Faculty Review', 'HOD Approval'];

router.post('/:id/transition', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { action, comment } = req.body;

  if (!comment) return res.status(400).json({ error: 'Comment is required' });

  const { data: submission, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !submission) return res.status(404).json({ error: 'Submission not found' });

  let newState;

  if (action === 'approve') {
    const allowed = TRANSITIONS[submission.state];
    if (!allowed) return res.status(400).json({ error: 'Cannot approve from current state' });
    if (!allowed.roles.includes(req.user.role)) return res.status(403).json({ error: 'Not authorized' });
    newState = allowed.to;
  } else if (action === 'reject') {
    if (!REJECT_FROM.includes(submission.state)) return res.status(400).json({ error: 'Cannot reject from current state' });
    if (!['teacher', 'hod'].includes(req.user.role)) return res.status(403).json({ error: 'Not authorized' });
    newState = 'Rejected';
  } else {
    return res.status(400).json({ error: 'Action must be approve or reject' });
  }

  const { error: updateError } = await supabase
    .from('submissions')
    .update({ state: newState, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (updateError) return res.status(500).json({ error: updateError.message });

  await supabase.from('approval_log').insert([{
    submission_id: id,
    actor_id: req.user.id,
    actor_role: req.user.role,
    from_state: submission.state,
    to_state: newState,
    comment
  }]);

  await supabase.from('audit_events').insert([{
    actor_id: req.user.id,
    actor_role: req.user.role,
    submission_id: id,
    event_type: 'STATE_TRANSITION',
    from_state: submission.state,
    to_state: newState,
    comment
  }]);

  await supabase.from('notifications').insert([{
    user_id: submission.owner_id,
    message: `Your submission "${submission.title}" has been moved to: ${newState}`
  }]);

  res.json({ message: `Submission moved to ${newState}`, state: newState });
});

module.exports = router;