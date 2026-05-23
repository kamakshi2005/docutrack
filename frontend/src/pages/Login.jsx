import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      const routes = { student:'/student', faculty:'/faculty', teacher:'/teacher', hod:'/hod' };
      navigate(routes[data.user.role]);
    } catch (err) { setError(err.response?.data?.error || 'Login failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'#0d0d0d'}}>
      <div style={{background:'#161616', border:'1px solid rgba(200,170,111,0.12)', borderRadius:10, padding:'40px 48px', maxWidth:460, width:'100%', position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(200,170,111,0.5),transparent)'}}></div>

        <div className="text-center mb-8">
          <div style={{color:'#C8AA6F', fontSize:22, marginBottom:10, letterSpacing:'0.1em'}}>◈</div>
          <h1 style={{color:'#E3D5BB', fontSize:20, fontWeight:300, letterSpacing:'0.1em', textTransform:'uppercase'}}>DocuTrack</h1>
          <p style={{color:'#3a3a2a', fontSize:11, marginTop:6, letterSpacing:'0.06em'}}>Sign in to your account</p>
        </div>

        {error && <div style={{background:'rgba(47,47,47,0.6)', border:'1px solid rgba(100,80,30,0.3)', color:'#A07F3A', padding:'8px 12px', borderRadius:6, marginBottom:16, fontSize:12}}>{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {[
            { label:'EMAIL', key:'email', type:'email', placeholder:'you@university.edu' },
            { label:'PASSWORD', key:'password', type:'password', placeholder:'••••••••' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{color:'#4a4a3a', fontSize:10, fontWeight:500, display:'block', marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase'}}>{label}</label>
              <input type={type} required placeholder={placeholder}
                style={{background:'#111111', border:'1px solid rgba(200,170,111,0.12)', color:'#E3D5BB', borderRadius:6, padding:'11px 14px', width:'100%', fontSize:12, letterSpacing:'0.02em', outline:'none'}}
                value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
            </div>
          ))}

          <button type="submit" disabled={loading}
            style={{background:'rgba(160,127,58,0.18)', border:'1px solid rgba(200,170,111,0.4)', color:'#C8AA6F', width:'100%', padding:12, borderRadius:6, fontSize:12, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:8, cursor:'pointer'}}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{color:'#3a3a2a', textAlign:'center', marginTop:16, fontSize:11, letterSpacing:'0.04em'}}>
          Don't have an account?{' '}
          <Link to="/register" style={{color:'#A07F3A'}}>Register</Link>
        </p>
      </div>
    </div>
  );
}