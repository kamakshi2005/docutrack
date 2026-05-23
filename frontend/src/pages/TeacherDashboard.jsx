import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SubmissionCard from '../components/SubmissionCard';
import API from '../api/axios';

const STATES = ['Submitted','Faculty Review','HOD Approval','Approved','Rejected'];

export default function TeacherDashboard() {
  const [submissions, setSubmissions] = useState([]);
  const [filter, setFilter] = useState('All');

  const load = async () => {
    try { const { data } = await API.get('/submissions'); setSubmissions(data); } catch {}
  };

  useEffect(() => { load(); }, []);

  const filtered = filter === 'All' ? submissions : submissions.filter(s => s.state === filter);

  const statColors = {
    'Submitted': '#C8AA6F',
    'Faculty Review': '#E3D5BB',
    'HOD Approval': '#C8AA6F',
    'Approved': '#A07F3A',
    'Rejected': '#2F2F2F',
  };

  return (
    <div style={{minHeight:'100vh', background:'#0d0d0d'}}>
      <Navbar />
      <div style={{maxWidth:900, margin:'0 auto', padding:'32px 24px'}}>

        <div style={{marginBottom:28}}>
          <h2 style={{color:'#E3D5BB', fontSize:20, fontWeight:300, letterSpacing:'0.04em'}}>Review Queue</h2>
          <p style={{color:'#4a4a3a', fontSize:12, marginTop:4, letterSpacing:'0.02em'}}>Review and approve pending submissions</p>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10, marginBottom:24}}>
          {STATES.map(s => (
            <div key={s} style={{background:'#161616', border:'1px solid rgba(200,170,111,0.1)', borderRadius:8, padding:14, textAlign:'center', position:'relative', overflow:'hidden'}}>
              <div style={{position:'absolute', top:0, left:0, right:0, height:2, background:'linear-gradient(90deg,transparent,rgba(200,170,111,0.3),transparent)'}}></div>
              <p style={{fontSize:22, fontWeight:300, color:statColors[s], marginBottom:4}}>
                {submissions.filter(x => x.state === s).length}
              </p>
              <p style={{color:'#4a4a3a', fontSize:9, letterSpacing:'0.08em', lineHeight:1.4}}>{s.toUpperCase()}</p>
            </div>
          ))}
        </div>

        <div style={{display:'flex', gap:6, flexWrap:'wrap', marginBottom:20}}>
          {['All', ...STATES].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              style={{
                padding:'5px 12px', borderRadius:4, fontSize:10, fontWeight:500, letterSpacing:'0.04em', cursor:'pointer',
                background: filter === s ? 'rgba(160,127,58,0.15)' : '#161616',
                border: filter === s ? '1px solid rgba(200,170,111,0.4)' : '1px solid rgba(200,170,111,0.08)',
                color: filter === s ? '#C8AA6F' : '#4a4a3a',
              }}>
              {s.toUpperCase()}
              {s !== 'All' && <span style={{marginLeft:6, opacity:0.6}}>({submissions.filter(x => x.state === s).length})</span>}
            </button>
          ))}
        </div>

        <div style={{borderTop:'1px solid rgba(200,170,111,0.06)', paddingTop:20}}>
          <p style={{color:'#3a3a2a', fontSize:9, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.12em', marginBottom:14}}>
            {filtered.length} Submission{filtered.length !== 1 ? 's' : ''}
          </p>

          {filtered.map(s => (
            <SubmissionCard key={s.id} submission={s}
              canReview={['Submitted','Faculty Review'].includes(s.state)}
              onUpdate={load} />
          ))}

          {filtered.length === 0 && (
            <div style={{border:'1px dashed rgba(200,170,111,0.1)', borderRadius:8, padding:48, textAlign:'center'}}>
              <div style={{color:'#A07F3A', fontSize:24, marginBottom:10}}>◈</div>
              <p style={{color:'#4a4a3a', fontSize:12}}>No submissions in this state.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}