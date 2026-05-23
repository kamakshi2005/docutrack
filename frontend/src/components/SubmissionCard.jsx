import { useState } from 'react';
import API from '../api/axios';

const STATE_STYLES = {
  Draft:            { bg:'rgba(47,47,47,0.4)',         color:'#4a4a3a',  border:'rgba(60,60,50,0.3)' },
  Submitted:        { bg:'rgba(160,127,58,0.1)',        color:'#A07F3A',  border:'rgba(160,127,58,0.25)' },
  'Faculty Review': { bg:'rgba(200,170,111,0.08)',      color:'#C8AA6F',  border:'rgba(200,170,111,0.2)' },
  'HOD Approval':   { bg:'rgba(200,170,111,0.12)',      color:'#C8AA6F',  border:'rgba(200,170,111,0.28)' },
  Approved:         { bg:'rgba(160,127,58,0.08)',       color:'#8a7040',  border:'rgba(160,127,58,0.15)' },
  Rejected:         { bg:'rgba(47,47,47,0.5)',          color:'#4a4a3a',  border:'rgba(60,60,50,0.4)' },
};

export default function SubmissionCard({ submission, canReview, onUpdate }) {
  const [comment, setComment] = useState('');
  const [showActions, setShowActions] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action) => {
    if (!comment.trim()) return alert('Comment is required');
    setLoading(true);
    try {
      await API.post(`/approvals/${submission.id}/transition`, { action, comment });
      setComment(''); setShowActions(false); onUpdate();
    } catch (err) { alert(err.response?.data?.error || 'Action failed'); }
    setLoading(false);
  };

  const style = STATE_STYLES[submission.state] || STATE_STYLES.Draft;

  return (
    <div style={{background:'#161616', border:'1px solid rgba(200,170,111,0.08)', borderRadius:8, padding:16, marginBottom:8}}>
      <div style={{display:'flex', alignItems:'flex-start', justifyContent:'space-between'}}>
        <div style={{flex:1, minWidth:0, marginRight:16}}>
          <h3 style={{color:'#E3D5BB', fontSize:13, fontWeight:400, letterSpacing:'0.02em', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis'}}>{submission.title}</h3>
          <div style={{display:'flex', alignItems:'center', gap:12, marginTop:4}}>
            <span style={{color:'#4a4a3a', fontSize:11}}>{submission.category}</span>
            {submission.users && <span style={{color:'#4a4a3a', fontSize:11}}>· {submission.users.full_name}</span>}
            <span style={{color:'#2a2a1a', fontSize:11}}>· {new Date(submission.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <span style={{background:style.bg, color:style.color, border:`1px solid ${style.border}`, padding:'4px 10px', borderRadius:4, fontSize:10, fontWeight:500, letterSpacing:'0.06em', flexShrink:0}}>
          {submission.state.toUpperCase()}
        </span>
      </div>

      {canReview && ['Submitted', 'Faculty Review', 'HOD Approval'].includes(submission.state) && (
        <div style={{marginTop:12}}>
          {!showActions ? (
            <button onClick={() => setShowActions(true)}
              style={{background:'rgba(160,127,58,0.12)', border:'1px solid rgba(200,170,111,0.3)', color:'#C8AA6F', padding:'6px 14px', borderRadius:4, fontSize:10, letterSpacing:'0.06em', cursor:'pointer'}}>
              REVIEW
            </button>
          ) : (
            <div>
              <textarea
                style={{background:'#111111', border:'1px solid rgba(200,170,111,0.1)', color:'#E3D5BB', borderRadius:6, padding:'9px 12px', width:'100%', fontSize:11, outline:'none', resize:'none', marginBottom:8, fontStyle:'italic', color:'#6a5a3a'}}
                placeholder="Add your review comment..." rows={2}
                value={comment} onChange={e => setComment(e.target.value)}
              />
              <div style={{display:'flex', gap:8}}>
                <button onClick={() => handleAction('approve')} disabled={loading}
                  style={{background:'rgba(160,127,58,0.1)', border:'1px solid rgba(160,127,58,0.3)', color:'#A07F3A', padding:'6px 14px', borderRadius:4, fontSize:10, letterSpacing:'0.06em', cursor:'pointer', flex:1}}>
                  APPROVE
                </button>
                <button onClick={() => handleAction('reject')} disabled={loading}
                  style={{background:'rgba(47,47,47,0.6)', border:'1px solid rgba(60,60,50,0.4)', color:'#4a4a3a', padding:'6px 14px', borderRadius:4, fontSize:10, letterSpacing:'0.06em', cursor:'pointer', flex:1}}>
                  REJECT
                </button>
                <button onClick={() => setShowActions(false)}
                  style={{background:'transparent', border:'1px solid rgba(200,170,111,0.1)', color:'#3a3a2a', padding:'6px 14px', borderRadius:4, fontSize:10, cursor:'pointer'}}>
                  CANCEL
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}