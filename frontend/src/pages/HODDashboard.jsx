import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SubmissionCard from '../components/SubmissionCard';
import API from '../api/axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function HODDashboard() {
  const [submissions, setSubmissions] = useState([]);

  const load = async () => {
    try { const { data } = await API.get('/submissions'); setSubmissions(data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const monthData = submissions.reduce((acc, s) => {
    const month = new Date(s.created_at).toLocaleString('default', { month:'short' });
    const ex = acc.find(x => x.month === month);
    if (ex) ex.count++; else acc.push({ month, count:1 });
    return acc;
  }, []);

  const stateCount = (state) => submissions.filter(s => s.state === state).length;
  const pendingHOD = submissions.filter(s => s.state === 'HOD Approval');

  const statusDist = [
    { label:'Submitted',      count: stateCount('Submitted'),      color:'#C8AA6F' },
    { label:'Faculty Review', count: stateCount('Faculty Review'), color:'#E3D5BB' },
    { label:'HOD Approval',   count: stateCount('HOD Approval'),   color:'#C8AA6F' },
    { label:'Approved',       count: stateCount('Approved'),       color:'#A07F3A' },
    { label:'Rejected',       count: stateCount('Rejected'),       color:'#2F2F2F' },
  ].filter(s => s.count > 0);

  const Card = ({ children }) => (
    <div style={{background:'#161616', border:'1px solid rgba(200,170,111,0.08)', borderRadius:8, padding:20, position:'relative', overflow:'hidden'}}>
      <div style={{position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(200,170,111,0.3),transparent)'}}></div>
      {children}
    </div>
  );

  return (
    <div style={{minHeight:'100vh', background:'#0d0d0d'}}>
      <Navbar />
      <div style={{maxWidth:1050, margin:'0 auto', padding:'32px 24px'}}>

        <div style={{marginBottom:28}}>
          <h2 style={{color:'#E3D5BB', fontSize:20, fontWeight:300, letterSpacing:'0.04em'}}>HOD Dashboard</h2>
          <p style={{color:'#4a4a3a', fontSize:12, marginTop:4, letterSpacing:'0.02em'}}>Departmental overview and final approvals</p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:24}}>
          {[
            { label:'TOTAL',       value: submissions.length,        color:'#C8AA6F' },
            { label:'PENDING HOD', value: pendingHOD.length,         color:'#E3D5BB' },
            { label:'APPROVED',    value: stateCount('Approved'),    color:'#A07F3A' },
            { label:'REJECTED',    value: stateCount('Rejected'),    color:'#2F2F2F' },
          ].map(s => (
            <div key={s.label} style={{background:'#161616', border:'1px solid rgba(200,170,111,0.1)', borderRadius:8, padding:18, textAlign:'center', position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(200,170,111,0.3),transparent)'}}></div>
              <p style={{fontSize:30, fontWeight:300, color:s.color, marginBottom:4}}>{s.value}</p>
              <p style={{color:'#4a4a3a', fontSize:9, letterSpacing:'0.1em'}}>{s.label}</p>
            </div>
          ))}
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:24}}>
          <Card>
            <p style={{color:'#4a4a3a', fontSize:9, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:16}}>Monthly Submissions</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={monthData}>
                <XAxis dataKey="month" tick={{ fill:'#3a3a2a', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#3a3a2a', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{stroke:'rgba(200,170,111,0.05)'}}
                  contentStyle={{ background:'#161616', border:'1px solid rgba(200,170,111,0.15)', borderRadius:6, fontSize:11, color:'#E3D5BB' }} />
                <Line type="monotone" dataKey="count" stroke="#A07F3A" strokeWidth={2} dot={{ fill:'#C8AA6F', r:3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card>
            <p style={{color:'#4a4a3a', fontSize:9, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:16}}>Status Distribution</p>
            {statusDist.length === 0 ? (
              <p style={{color:'#2a2a1a', fontSize:12, textAlign:'center', marginTop:40}}>No data yet</p>
            ) : (
              <div style={{marginTop:8}}>
                {statusDist.map(s => (
                  <div key={s.label} style={{display:'flex', alignItems:'center', gap:10, marginBottom:12}}>
                    <div style={{width:6, height:6, borderRadius:'50%', background:s.color, flexShrink:0}}></div>
                    <span style={{color:'#4a4a3a', fontSize:11, flex:1}}>{s.label}</span>
                    <span style={{color:'#8a7a5a', fontSize:11, fontWeight:500}}>{s.count}</span>
                    <div style={{width:60, height:3, borderRadius:2, background:'rgba(200,170,111,0.06)'}}>
                      <div style={{height:3, borderRadius:2, background:s.color, width:`${Math.round((s.count/submissions.length)*100)}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {pendingHOD.length > 0 && (
          <div style={{marginBottom:24}}>
            <p style={{color:'#3a3a2a', fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14}}>
              Pending Final Approval ({pendingHOD.length})
            </p>
            {pendingHOD.map(s => <SubmissionCard key={s.id} submission={s} canReview={true} onUpdate={load} />)}
          </div>
        )}

        <div style={{borderTop:'1px solid rgba(200,170,111,0.06)', paddingTop:20}}>
          <p style={{color:'#3a3a2a', fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14}}>All Submissions</p>
          {submissions.map(s => (
            <SubmissionCard key={s.id} submission={s} canReview={s.state==='HOD Approval'} onUpdate={load} />
          ))}
          {submissions.length === 0 && (
            <div style={{border:'1px dashed rgba(200,170,111,0.1)', borderRadius:8, padding:48, textAlign:'center'}}>
              <div style={{color:'#A07F3A', fontSize:24, marginBottom:10}}>◈</div>
              <p style={{color:'#4a4a3a', fontSize:12}}>No submissions yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}