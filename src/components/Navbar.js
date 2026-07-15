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
            <>
              <Link href="/">
                <button style={{ fontWeight: 500 }}>Home</button>
              </Link>
              <Link href="/create">
                <button style={{ fontWeight: 600, color: 'var(--accent-color)' }}>+ Create</button>
              </Link>
              <Link href="/profile/me">
                <button style={{ fontWeight: 500 }}>Profile</button>
              </Link>
              <button onClick={handleLogout} className="btn btn-secondary">
                Logout
              </button>
            </>
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
