import { useState, useEffect } from 'react';
import API from '../api/axios';

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [open, setOpen] = useState(false);

  const fetchNotifications = async () => {
    try { const { data } = await API.get('/notifications'); setNotifications(data); } catch {}
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    await API.put(`/notifications/${id}/read`);
    setNotifications(n => n.filter(x => x.id !== id));
  };

  return (
    <div style={{position:'relative'}}>
      <button onClick={() => setOpen(!open)}
        style={{background:'none', border:'none', cursor:'pointer', color:'#4a4a3a', fontSize:16, position:'relative', padding:4}}>
        🔔
        {notifications.length > 0 && (
          <span style={{position:'absolute', top:-2, right:-2, background:'#A07F3A', color:'#0d0d0d', fontSize:9, width:14, height:14, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700}}>
            {notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{position:'absolute', right:0, marginTop:8, width:280, background:'#161616', border:'1px solid rgba(200,170,111,0.15)', borderRadius:8, boxShadow:'0 8px 32px rgba(0,0,0,0.5)', zIndex:50}}>
          <div style={{padding:'10px 14px', borderBottom:'1px solid rgba(200,170,111,0.08)'}}>
            <p style={{color:'#C8AA6F', fontSize:11, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase'}}>Notifications</p>
          </div>
          {notifications.length === 0 ? (
            <p style={{color:'#3a3a2a', fontSize:11, padding:16, textAlign:'center', letterSpacing:'0.04em'}}>All caught up!</p>
          ) : (
            notifications.map(n => (
              <div key={n.id} style={{padding:'10px 14px', borderBottom:'1px solid rgba(200,170,111,0.06)', display:'flex', alignItems:'flex-start', gap:8}}>
                <p style={{color:'#8a7a5a', fontSize:11, flex:1, lineHeight:1.5}}>{n.message}</p>
                <button onClick={() => markRead(n.id)}
                  style={{color:'#A07F3A', fontSize:12, background:'none', border:'none', cursor:'pointer'}}>✓</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}