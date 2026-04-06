import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

export default function AdminChat() {
  const [conversations, setConversations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const loadConversations = async () => {
    try {
      const r = await api.get('/messages/conversations');
      setConversations(r.data);
    } catch {}
    setLoading(false);
  };

  const loadMessages = async (studentId) => {
    try {
      const r = await api.get(`/messages/conversation/${studentId}`);
      setMessages(r.data);
      // Mark as read in conversations list
      setConversations(prev => prev.map(c =>
        c.student._id === studentId ? { ...c, unreadCount: 0 } : c
      ));
    } catch {}
  };

  useEffect(() => {
    loadConversations();
    pollRef.current = setInterval(loadConversations, 20000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    if (selected) {
      loadMessages(selected._id);
      const t = setInterval(() => loadMessages(selected._id), 20000);
      return () => clearInterval(t);
    }
  }, [selected]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || sending || !selected) return;
    setSending(true);
    try {
      const r = await api.post(`/messages/reply/${selected._id}`, { text: reply });
      setMessages(prev => [...prev, r.data]);
      setReply('');
    } catch {}
    setSending(false);
  };

  const fmt = (d) => {
    const date = new Date(d);
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const totalUnread = conversations.reduce((s, c) => s + c.unreadCount, 0);

  if (loading) return <div className="loading"><div className="spinner" />Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Student Messages {totalUnread > 0 && <span style={{ background: 'var(--red)', color: '#fff', borderRadius: '12px', padding: '2px 10px', fontSize: '0.8rem', fontWeight: 600, marginLeft: '0.5rem' }}>{totalUnread}</span>}</h1>
        <p>Reply to student queries — students expect a response within 24 hours</p>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', height: 'calc(100vh - 200px)', minHeight: '500px' }}>

        {/* Conversations list */}
        <div style={{
          width: '280px', flexShrink: 0,
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          <div style={{ padding: '0.85rem 1rem', borderBottom: '1px solid var(--border)', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text2)' }}>
            Conversations ({conversations.length})
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.length === 0 && (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)', fontSize: '0.82rem' }}>
                No messages yet
              </div>
            )}
            {conversations.map(c => (
              <div key={c.student._id}
                onClick={() => setSelected(c.student)}
                style={{
                  padding: '0.85rem 1rem', cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                  background: selected?._id === c.student._id ? 'var(--accent-dim)' : 'transparent',
                  borderLeft: selected?._id === c.student._id ? '3px solid var(--accent)' : '3px solid transparent',
                  transition: 'background 0.15s',
                }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text)' }}>{c.student.name}</div>
                  {c.unreadCount > 0 && (
                    <span style={{ background: 'var(--red)', color: '#fff', borderRadius: '10px', padding: '1px 7px', fontSize: '0.68rem', fontWeight: 700 }}>{c.unreadCount}</span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '2px' }}>{c.student.branch} • {c.student.email}</div>
                {c.lastMessage && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {c.lastMessage.senderRole === 'admin' ? '✉️ You: ' : '👤 '}{c.lastMessage.text}
                  </div>
                )}
                {c.lastMessage && (
                  <div style={{ fontSize: '0.68rem', color: 'var(--text3)', marginTop: '2px' }}>{fmt(c.lastMessage.createdAt)}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Chat window */}
        <div style={{
          flex: 1, background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ fontSize: '2.5rem' }}>💬</div>
              <div style={{ fontSize: '0.9rem' }}>Select a conversation to reply</div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div style={{ padding: '0.85rem 1.25rem', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>👤</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text)' }}>{selected.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{selected.branch} • {selected.email}</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {messages.map((m, i) => {
                  const isAdmin = m.senderRole === 'admin';
                  return (
                    <div key={i} style={{ display: 'flex', justifyContent: isAdmin ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '65%',
                        background: isAdmin ? 'linear-gradient(135deg, #4f7cff, #7b5ea7)' : 'var(--surface2)',
                        color: isAdmin ? '#fff' : 'var(--text)',
                        borderRadius: isAdmin ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                        padding: '0.6rem 0.9rem', fontSize: '0.875rem', lineHeight: 1.5,
                      }}>
                        <div style={{ fontSize: '0.7rem', fontWeight: 700, opacity: 0.75, marginBottom: '2px' }}>
                          {isAdmin ? 'You (Admin)' : selected.name}
                        </div>
                        <div>{m.text}</div>
                        <div style={{ fontSize: '0.65rem', opacity: 0.65, marginTop: '3px', textAlign: 'right' }}>{fmt(m.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Reply box */}
              <form onSubmit={sendReply} style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.5rem' }}>
                <input
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  placeholder={`Reply to ${selected.name}…`}
                  style={{
                    flex: 1, padding: '0.6rem 0.9rem', borderRadius: '20px',
                    background: 'var(--bg2)', border: '1px solid var(--border2)',
                    color: 'var(--text)', fontSize: '0.875rem', outline: 'none',
                  }}
                />
                <button type="submit" disabled={sending || !reply.trim()} className="btn btn-primary btn-sm" style={{ borderRadius: '20px', paddingLeft: '1.2rem', paddingRight: '1.2rem' }}>
                  {sending ? '…' : 'Send ➤'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
