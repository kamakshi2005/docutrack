const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../utils/supabase');

// REGISTER
router.post('/register', async (req, res) => {
  const { email, password, full_name, role, department, user_id } = req.body;
  
  if (!email || !password || !full_name || !role || !department) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const validRoles = ['student', 'faculty', 'teacher', 'hod'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role' });
  }

  const password_hash = await bcrypt.hash(password, 10);

  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash, full_name, role, department, user_id }])
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });

  const token = jwt.sign(
    { id: data.id, role: data.role, department: data.department, email: data.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ token, user: { id: data.id, full_name: data.full_name, role: data.role, department: data.department, email: data.email } });
});

// LOGIN
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !user) return res.status(401).json({ error: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { id: user.id, role: user.role, department: user.department, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );

  res.json({ token, user: { id: user.id, full_name: user.full_name, role: user.role, department: user.department, email: user.email } });
});

module.exports = router;