import { useState } from 'react';
import API from '../api/axios';

const CATEGORIES = ['Research Paper','Conference Paper','Internship Certificate','Patent','Award','Funded Project','Book Chapter','Other'];

export default function UploadModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ title: '', category: 'Research Paper' });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('category', form.category);
    if (file) formData.append('file', file);
    try {
      await API.post('/submissions/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      onSuccess(); onClose();
    } catch (err) { setError(err.response?.data?.error || 'Upload failed'); }
    setLoading(false);
  };

  return (
    <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.85)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16}}>
      <div style={{background:'#161616', border:'1px solid rgba(200,170,111,0.15)', borderRadius:10, padding:28, width:'100%', maxWidth:420, position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(200,170,111,0.5),transparent)'}}></div>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:24}}>
          <div>
            <h2 style={{color:'#E3D5BB', fontSize:15, fontWeight:400, letterSpacing:'0.06em', textTransform:'uppercase'}}>New Submission</h2>
            <p style={{color:'#3a3a2a', fontSize:10, marginTop:3, letterSpacing:'0.04em'}}>Submit your academic activity</p>
          </div>
          <button onClick={onClose}
            style={{color:'#4a4a3a', fontSize:20, background:'none', border:'none', cursor:'pointer', lineHeight:1}}>×</button>
        </div>

        {error && (
          <div style={{background:'rgba(47,47,47,0.6)', border:'1px solid rgba(100,80,30,0.3)', color:'#A07F3A', padding:'8px 12px', borderRadius:6, marginBottom:16, fontSize:12}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{marginBottom:16}}>
            <label style={{color:'#4a4a3a', fontSize:10, fontWeight:500, display:'block', marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase'}}>Title</label>
            <input type="text" required placeholder="Publication or activity title"
              style={{background:'#111111', border:'1px solid rgba(200,170,111,0.12)', color:'#E3D5BB', borderRadius:6, padding:'11px 14px', width:'100%', fontSize:12, outline:'none'}}
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>

          <div style={{marginBottom:16}}>
            <label style={{color:'#4a4a3a', fontSize:10, fontWeight:500, display:'block', marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase'}}>Category</label>
            <select style={{background:'#111111', border:'1px solid rgba(200,170,111,0.12)', color:'#E3D5BB', borderRadius:6, padding:'11px 14px', width:'100%', fontSize:12, outline:'none'}}
              value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div style={{marginBottom:24}}>
            <label style={{color:'#4a4a3a', fontSize:10, fontWeight:500, display:'block', marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase'}}>Supporting Document (Optional)</label>
            <input type="file" accept=".pdf,.docx,.jpg,.jpeg,.png"
              style={{color:'#4a4a3a', fontSize:11, width:'100%'}}
              onChange={e => setFile(e.target.files[0])} />
            <p style={{color:'#2a2a1a', fontSize:10, marginTop:4, letterSpacing:'0.02em'}}>PDF, DOCX, JPG, PNG — max 10 MB</p>
          </div>

          <div style={{display:'flex', gap:10}}>
            <button type="submit" disabled={loading}
              style={{background:'rgba(160,127,58,0.18)', border:'1px solid rgba(200,170,111,0.4)', color:'#C8AA6F', flex:1, padding:12, borderRadius:6, fontSize:11, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer'}}>
              {loading ? 'Submitting...' : 'Submit'}
            </button>
            <button type="button" onClick={onClose}
              style={{background:'transparent', border:'1px solid rgba(200,170,111,0.1)', color:'#4a4a3a', padding:'12px 20px', borderRadius:6, fontSize:11, letterSpacing:'0.06em', cursor:'pointer'}}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}