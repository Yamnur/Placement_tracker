import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '◈', end: true },
  { to: '/admin/jobs', label: 'Jobs', icon: '💼' },
  { to: '/admin/drives', label: 'Drives', icon: '🚀' },
  { to: '/admin/applications', label: 'Applications', icon: '📋' },
  { to: '/admin/students', label: 'Students', icon: '👥' },
  { to: '/admin/materials', label: 'Materials', icon: '📚' },
  { to: '/admin/analytics', label: 'Analytics', icon: '📊' },
  { to: '/admin/chat', label: 'Messages', icon: '💬' },
  { to: '/admin/tests', label: 'Mock Tests', icon: '🧠' },
  { to: '/admin/experiences', label: 'Experiences', icon: '💼' },
  { to: '/admin/bulk-import', label: 'Bulk Import', icon: '📥' },
  { to: '/admin/reports', label: 'Reports', icon: '📊' },
  { to: '/admin/auditlogs', label: 'Audit Logs', icon: '🔍' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const isDark = theme === 'dark';

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={closeMobileMenu}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 99, display: 'none' }}
          className="show-mobile"
        />
      )}
      
      {/* Sidebar */}
      <aside 
        className={mobileMenuOpen ? 'menu-open' : ''}
        style={{ width: '220px', background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 100 }}>
        <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--accent2)' }}>PlaceTrack</div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Admin Portal</div>
        </div>

        <nav style={{ flex: 1, padding: '0.75rem', display: 'flex', flexDirection: 'column', gap: '2px', overflowY: 'auto', overflowX: 'hidden', minHeight: 0 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeMobileMenu}
              style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '0.55rem 0.75rem', borderRadius: '8px',
                fontSize: '0.875rem', fontWeight: isActive ? 500 : 400,
                color: isActive ? 'var(--accent2)' : 'var(--text2)',
                background: isActive ? 'var(--accent-dim)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.15s',
              })}
            >
              <span style={{ fontSize: '0.9rem' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {/* User info card */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.6rem 0.75rem', background: 'var(--surface2)', borderRadius: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'var(--purple-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', fontWeight: 700, color: 'var(--purple)', flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ fontSize: '0.70rem', color: 'var(--text3)', lineHeight: 1.2, marginTop: '1px' }}>Admin</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="main-content" style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', width: 'calc(100% - 220px)' }}>
        {/* Top Navbar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 99,
          background: 'var(--bg2)', borderBottom: '1px solid var(--border)',
          padding: '0 1.75rem', height: '52px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          boxShadow: '0 1px 8px rgba(0,0,0,0.15)',
        }}>
          {/* Left: Menu toggle & portal label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button 
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Toggle Menu"
              style={{ display: 'none' }}
            >
              ☰
            </button>
            <div style={{ fontSize: '0.82rem', color: 'var(--text3)', letterSpacing: '0.05em', textTransform: 'uppercase', fontWeight: 600 }}>
              Admin Portal
            </div>
          </div>

          {/* Right: theme + logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Theme toggle */}
            <button onClick={toggleTheme} title={isDark ? 'Switch to Light' : 'Switch to Dark'}
              style={{ background: 'var(--surface)', border: '1px solid var(--border2)', borderRadius: '20px', padding: '4px 10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text2)', transition: 'all 0.18s' }}>
              {isDark ? '☀️' : '🌙'} {isDark ? 'Light' : 'Dark'}
            </button>

            {/* Logout */}
            <button onClick={handleLogout} style={{ background: 'var(--red-dim)', border: '1px solid rgba(255,77,109,0.2)', borderRadius: '8px', padding: '5px 12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: 'var(--red)', fontWeight: 500, transition: 'all 0.18s' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight:'4px'}}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Logout
            </button>
          </div>
        </header>

        <main style={{ flex: 1, padding: '2rem', background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}