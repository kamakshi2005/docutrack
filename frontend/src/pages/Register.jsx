import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Register() {
  const [form, setForm] = useState({ email:'', password:'', full_name:'', role:'student', department:'', user_id:'' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const idConfig = {
    student: { label:'REGISTER NUMBER', placeholder:'e.g. 212221040001' },
    faculty: { label:'FACULTY ID', placeholder:'e.g. FAC2024001' },
    teacher: { label:'TEACHER ID', placeholder:'e.g. TCH2024001' },
    hod:     { label:'HOD ID', placeholder:'e.g. HOD2024001' },
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await API.post('/auth/register', form);
      login(data.user, data.token);
      const routes = { student:'/student', faculty:'/faculty', teacher:'/teacher', hod:'/hod' };
      navigate(routes[data.user.role]);
    } catch (err) { setError(err.response?.data?.error || 'Registration failed'); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{background:'#0d0d0d'}}>
      <div style={{background:'#161616', border:'1px solid rgba(200,170,111,0.12)', borderRadius:10, padding:'40px 48px', maxWidth:460, width:'100%', position:'relative', overflow:'hidden'}}>
        <div style={{position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(200,170,111,0.5),transparent)'}}></div>

        <div className="text-center mb-8">
          <div style={{color:'#C8AA6F', fontSize:22, marginBottom:10, letterSpacing:'0.1em'}}>◈</div>
          <h1 style={{color:'#E3D5BB', fontSize:20, fontWeight:300, letterSpacing:'0.1em', textTransform:'uppercase'}}>DocuTrack</h1>
          <p style={{color:'#3a3a2a', fontSize:11, marginTop:6, letterSpacing:'0.06em'}}>Create your account</p>
        </div>

        {error && (
          <div style={{background:'rgba(47,47,47,0.6)', border:'1px solid rgba(100,80,30,0.3)', color:'#A07F3A', padding:'8px 12px', borderRadius:6, marginBottom:16, fontSize:12}}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label style={{color:'#4a4a3a', fontSize:10, fontWeight:500, display:'block', marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase'}}>ROLE</label>
            <select style={{background:'#111111', border:'1px solid rgba(200,170,111,0.12)', color:'#E3D5BB', borderRadius:6, padding:'11px 14px', width:'100%', fontSize:12, outline:'none'}}
              value={form.role} onChange={e => setForm({...form, role: e.target.value, user_id:''})}>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="teacher">Teacher (Reviewer)</option>
              <option value="hod">Head of Department</option>
            </select>
          </div>

          <div>
            <label style={{color:'#4a4a3a', fontSize:10, fontWeight:500, display:'block', marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase'}}>
              {idConfig[form.role].label}
            </label>
            <input type="text" required placeholder={idConfig[form.role].placeholder}
              style={{background:'#111111', border:'1px solid rgba(200,170,111,0.12)', color:'#E3D5BB', borderRadius:6, padding:'11px 14px', width:'100%', fontSize:12, outline:'none'}}
              value={form.user_id} onChange={e => setForm({...form, user_id: e.target.value})} />
          </div>

          {[
            { label:'FULL NAME', key:'full_name', type:'text', placeholder: form.role === 'student' ? 'Your full name' : 'Dr. Jane Smith' },
            { label:'EMAIL', key:'email', type:'email', placeholder:'you@university.edu' },
            { label:'PASSWORD', key:'password', type:'password', placeholder:'••••••••' },
            { label:'DEPARTMENT', key:'department', type:'text', placeholder:'Computer Science' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{color:'#4a4a3a', fontSize:10, fontWeight:500, display:'block', marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase'}}>{label}</label>
              <input type={type} required placeholder={placeholder}
                style={{background:'#111111', border:'1px solid rgba(200,170,111,0.12)', color:'#E3D5BB', borderRadius:6, padding:'11px 14px', width:'100%', fontSize:12, outline:'none'}}
                value={form[key]} onChange={e => setForm({...form, [key]: e.target.value})} />
            </div>
          ))}

          <button type="submit" disabled={loading}
            style={{background:'rgba(160,127,58,0.18)', border:'1px solid rgba(200,170,111,0.4)', color:'#C8AA6F', width:'100%', padding:12, borderRadius:6, fontSize:12, fontWeight:500, letterSpacing:'0.1em', textTransform:'uppercase', marginTop:8, cursor:'pointer'}}>
            {loading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <p style={{color:'#3a3a2a', textAlign:'center', marginTop:16, fontSize:11, letterSpacing:'0.04em'}}>
          Already have an account?{' '}
          <Link to="/login" style={{color:'#A07F3A'}}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}