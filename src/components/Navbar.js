'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    setIsAuthenticated(!!localStorage.getItem('access_token'));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <nav className="glass-nav" style={{ padding: '12px 20px' }}>
      <div className="container flex-between">
        <Link href="/">
          <div className="brand-logo" style={{ fontSize: '24px', margin: 0 }}>
            InstaClone
          </div>
        </Link>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <Link href="/" className="btn" style={{ background: 'transparent', color: 'var(--text-color)', border: 'none', fontWeight: 500 }}>
                Home
              </Link>
              <Link href="/create" className="btn" style={{ background: 'transparent', color: 'var(--accent-color)', border: 'none', fontWeight: 600 }}>
                + Create
              </Link>
              <Link href="/messages" className="btn" style={{ background: 'transparent', color: 'var(--text-color)', border: 'none', fontWeight: 500 }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </Link>
              <Link href="/profile/me" className="btn" style={{ background: 'transparent', color: 'var(--text-color)', border: 'none', fontWeight: 500 }}>
                Profile
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login">
                <button className="btn btn-secondary">Log In</button>
              </Link>
              <Link href="/register">
                <button className="btn btn-brand">Sign Up</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
