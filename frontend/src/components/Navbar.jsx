import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const roleBadge = {
    student: { bg: 'rgba(227,213,187,0.08)', color: '#E3D5BB', border: 'rgba(227,213,187,0.18)' },
    faculty: { bg: 'rgba(160,127,58,0.1)', color: '#A07F3A', border: 'rgba(160,127,58,0.25)' },
    teacher: { bg: 'rgba(200,170,111,0.1)', color: '#C8AA6F', border: 'rgba(200,170,111,0.25)' },
    hod:     { bg: 'rgba(200,170,111,0.12)', color: '#C8AA6F', border: 'rgba(200,170,111,0.3)' },
  };

  const badge = roleBadge[user?.role] || roleBadge.student;

  return (
    <nav style={{background:'#161616', borderBottom:'1px solid rgba(200,170,111,0.15)', padding:'16px 24px'}}>
      <div style={{maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between'}}>
        <div>
          <div style={{color:'#C8AA6F', fontSize:15, fontWeight:600, letterSpacing:'0.06em', textTransform:'uppercase'}}>DocuTrack</div>
          <div style={{color:'#4a4a3a', fontSize:10, letterSpacing:'0.04em', marginTop:2}}>{user?.department}</div>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <NotificationBell />
          <span style={{background:badge.bg, color:badge.color, border:`1px solid ${badge.border}`, padding:'4px 12px', borderRadius:4, fontSize:10, fontWeight:600, letterSpacing:'0.08em'}}>
            {user?.role?.toUpperCase()}
          </span>
          <span style={{color:'#8a7a5a', fontSize:12}}>{user?.full_name}</span>
          <button
            onClick={() => { logout(); navigate('/login'); }}
            style={{padding:'5px 12px', borderRadius:4, border:'1px solid rgba(200,170,111,0.25)', color:'#6a5a3a', fontSize:11, background:'transparent', letterSpacing:'0.04em', cursor:'pointer'}}>
            LOGOUT
          </button>
        </div>
      </div>
    </nav>
  );
}