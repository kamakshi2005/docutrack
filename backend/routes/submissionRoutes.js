const express = require('express');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const supabase = require('../utils/supabase');
const { verifyToken } = require('../middleware/auth');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const ALLOWED_MIME_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];

router.get('/', verifyToken, async (req, res) => {
  let query = supabase.from('submissions').select('*, users!owner_id(full_name, email)');
  if (req.user.role === 'student' || req.user.role === 'faculty') {
    query = query.eq('owner_id', req.user.id);
  }
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/upload', verifyToken, upload.single('file'), async (req, res) => {
  const { title, category } = req.body;
  if (!title || !category) return res.status(400).json({ error: 'Title and category required' });

  let fileUrl = null;
  let fileHash = null;

  if (req.file) {
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(415).json({ error: 'Unsupported file format' });
    }

    fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    const { data: existing } = await supabase
      .from('file_hashes')
      .select('id')
      .eq('hash', fileHash)
      .single();

    if (existing) return res.status(409).json({ error: 'Duplicate file detected' });

    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `${req.user.id}/${fileHash}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('submissions')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (uploadError) return res.status(500).json({ error: uploadError.message });

    const { data: urlData } = supabase.storage
      .from('submissions')
      .getPublicUrl(fileName);

    fileUrl = urlData.publicUrl;

    await supabase.from('file_hashes').insert([{ hash: fileHash, s3_key: fileName }]);
  }

  // Faculty submissions go directly to HOD Approval
  // Student submissions go to Submitted (Teacher reviews first)
  const initialState = req.user.role === 'faculty' ? 'HOD Approval' : 'Submitted';

  const { data, error } = await supabase
    .from('submissions')
    .insert([{
      owner_id: req.user.id,
      title,
      category,
      file_url: fileUrl,
      file_hash: fileHash,
      metadata: { uploader: req.user.email, uploaded_at: new Date().toISOString() },
      state: initialState
    }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  await supabase.from('audit_events').insert([{
    actor_id: req.user.id,
    actor_role: req.user.role,
    submission_id: data.id,
    event_type: 'SUBMISSION_CREATED',
    to_state: initialState,
    comment: 'Initial submission'
  }]);

  res.json(data);
});

module.exports = router;