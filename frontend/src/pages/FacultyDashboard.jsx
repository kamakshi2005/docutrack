import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SubmissionCard from '../components/SubmissionCard';
import UploadModal from '../components/UploadModal';
import API from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function FacultyDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const load = async () => {
    try { const { data } = await API.get('/submissions'); setSubmissions(data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const categoryData = submissions.reduce((acc, s) => {
    const ex = acc.find(x => x.name === s.category);
    if (ex) ex.count++; else acc.push({ name: s.category, count: 1 });
    return acc;
  }, []);

  const stats = [
    { label:'TOTAL',    value: submissions.length,                                                    color:'#C8AA6F' },
    { label:'APPROVED', value: submissions.filter(s => s.state==='Approved').length,                  color:'#E3D5BB' },
    { label:'PENDING',  value: submissions.filter(s => !['Approved','Rejected'].includes(s.state)).length, color:'#A07F3A' },
    { label:'REJECTED', value: submissions.filter(s => s.state==='Rejected').length,                  color:'#2F2F2F' },
  ];

  return (
    <div style={{minHeight:'100vh', background:'#0d0d0d'}}>
      <Navbar />
      <div style={{maxWidth:900, margin:'0 auto', padding:'32px 24px'}}>

        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28}}>
          <div>
            <h2 style={{color:'#E3D5BB', fontSize:20, fontWeight:300, letterSpacing:'0.04em'}}>Research Dashboard</h2>
            <p style={{color:'#4a4a3a', fontSize:12, marginTop:4, letterSpacing:'0.02em'}}>Your academic output tracker</p>
          </div>
          <button onClick={() => setShowModal(true)}
            style={{background:'rgba(160,127,58,0.18)', border:'1px solid rgba(200,170,111,0.4)', color:'#C8AA6F', padding:'9px 18px', borderRadius:4, fontSize:11, fontWeight:500, letterSpacing:'0.08em', textTransform:'uppercase', cursor:'pointer'}}>
            + New Entry
          </button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:28}}>
          {stats.map(s => (
            <div key={s.label} style={{background:'#161616', border:'1px solid rgba(200,170,111,0.1)', borderRadius:8, padding:18, textAlign:'center', position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(200,170,111,0.3),transparent)'}}></div>
              <p style={{fontSize:30, fontWeight:300, color:s.color, marginBottom:4}}>{s.value}</p>
              <p style={{color:'#4a4a3a', fontSize:9, letterSpacing:'0.1em'}}>{s.label}</p>
            </div>
          ))}
        </div>

        {categoryData.length > 0 && (
          <div style={{background:'#161616', border:'1px solid rgba(200,170,111,0.08)', borderRadius:8, padding:20, marginBottom:24}}>
            <p style={{color:'#4a4a3a', fontSize:9, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:16}}>Submissions by Category</p>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={categoryData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill:'#3a3a2a', fontSize:10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill:'#3a3a2a', fontSize:10 }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill:'rgba(200,170,111,0.03)'}}
                  contentStyle={{ background:'#161616', border:'1px solid rgba(200,170,111,0.15)', borderRadius:6, fontSize:11, color:'#E3D5BB' }} />
                <Bar dataKey="count" fill="rgba(160,127,58,0.5)" radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div style={{borderTop:'1px solid rgba(200,170,111,0.06)', paddingTop:20}}>
          <p style={{color:'#3a3a2a', fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14}}>All Entries</p>
          {submissions.map(s => <SubmissionCard key={s.id} submission={s} canReview={false} onUpdate={load} />)}
          {submissions.length === 0 && (
            <div style={{border:'1px dashed rgba(200,170,111,0.1)', borderRadius:8, padding:60, textAlign:'center'}}>
              <div style={{color:'#A07F3A', fontSize:24, marginBottom:10}}>◈</div>
              <p style={{color:'#4a4a3a', fontSize:12}}>No research entries yet.</p>
            </div>
          )}
        </div>
      </div>
      {showModal && <UploadModal onClose={() => setShowModal(false)} onSuccess={load} />}
    </div>
  );
}