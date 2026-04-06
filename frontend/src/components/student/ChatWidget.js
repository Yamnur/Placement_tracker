import { useState, useEffect, useRef } from 'react';
import api from '../../utils/api';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const pollRef = useRef(null);

  const fetchMessages = async () => {
    try {
      const r = await api.get('/messages/my');
      setMessages(r.data);
    } catch {}
  };

  const fetchUnread = async () => {
    try {
      const r = await api.get('/messages/my/unread');
      setUnread(r.data.count);
    } catch {}
  };

  useEffect(() => {
    fetchUnread();
    pollRef.current = setInterval(fetchUnread, 30000);
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => {
    if (open) {
      fetchMessages();
      setUnread(0);
    }
  }, [open]);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, open]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const r = await api.post('/messages', { text });
      setMessages(prev => [...prev, r.data]);
      setText('');
    } catch {}
    setSending(false);
  };

  const fmt = (d) => {
    const date = new Date(d);
    return date.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Floating Button */}
      <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 1000 }}>
        {!open && unread > 0 && (
          <div style={{
            position: 'absolute', top: '-6px', right: '-6px',
            background: 'var(--red)', color: '#fff',
            borderRadius: '50%', width: '20px', height: '20px',
            fontSize: '0.7rem', fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1001, boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          }}>{unread}</div>
        )}
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #4f7cff, #7b5ea7)',
            border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(79,124,255,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.4rem', transition: 'transform 0.2s',
            transform: open ? 'scale(0.92)' : 'scale(1)',
          }}
          title="Chat with Admin"
        >
          {open ? '✕' : '💬'}
        </button>
      </div>

      {/* Chat Panel */}
      {open && (
        <div style={{
          position: 'fixed', bottom: '5rem', right: '1.5rem', zIndex: 999,
          width: '320px', maxWidth: 'calc(100vw - 2rem)',
          background: 'var(--bg2)', border: '1px solid var(--border2)',
          borderRadius: '16px', boxShadow: '0 8px 40px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          maxHeight: '480px',
        }}>
          {/* Header */}
          <div style={{
            padding: '0.9rem 1rem', background: 'linear-gradient(135deg, #4f7cff, #7b5ea7)',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
          }}>
            <div style={{
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem',
            }}>🎓</div>
            <div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Placement Support</div>
              <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.72rem' }}>Admin replies within 24 hrs</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{
            flex: 1, overflowY: 'auto', padding: '0.75rem',
            display: 'flex', flexDirection: 'column', gap: '0.6rem',
            minHeight: '200px',
          }}>
            {messages.length === 0 && (
              <div style={{
                textAlign: 'center', color: 'var(--text3)', fontSize: '0.8rem',
                padding: '2rem 1rem', lineHeight: 1.6,
              }}>
                👋 Hi! Send a message and our placement team will reply within 24 hours.
              </div>
            )}
            {messages.map((m, i) => {
              const isStudent = m.senderRole === 'student';
              return (
                <div key={i} style={{
                  display: 'flex',
                  justifyContent: isStudent ? 'flex-end' : 'flex-start',
                }}>
                  <div style={{
                    maxWidth: '78%',
                    background: isStudent ? 'linear-gradient(135deg, #4f7cff, #7b5ea7)' : 'var(--surface2)',
                    color: isStudent ? '#fff' : 'var(--text)',
                    borderRadius: isStudent ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                    padding: '0.55rem 0.8rem',
                    fontSize: '0.83rem', lineHeight: 1.5,
                  }}>
                    {!isStudent && (
                      <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--accent2)', marginBottom: '2px' }}>Admin</div>
                    )}
                    <div>{m.text}</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.65, marginTop: '3px', textAlign: 'right' }}>{fmt(m.createdAt)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} style={{
            padding: '0.6rem', borderTop: '1px solid var(--border)',
            display: 'flex', gap: '0.4rem', background: 'var(--bg2)',
          }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type your message…"
              style={{
                flex: 1, padding: '0.5rem 0.75rem', borderRadius: '20px',
                background: 'var(--surface)', border: '1px solid var(--border2)',
                color: 'var(--text)', fontSize: '0.83rem', outline: 'none',
              }}
            />
            <button type="submit" disabled={sending || !text.trim()}
              style={{
                width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                background: text.trim() ? 'linear-gradient(135deg, #4f7cff, #7b5ea7)' : 'var(--surface2)',
                color: '#fff', fontSize: '1rem', cursor: text.trim() ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s', flexShrink: 0,
              }}>
              {sending ? '…' : '➤'}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
