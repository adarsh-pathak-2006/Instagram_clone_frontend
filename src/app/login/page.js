'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/utils/api';
import Link from 'next/link';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(username, password);
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        // Dispatch event for Navbar update (or simple reload)
        window.location.href = '/';
      } else {
        setError(data.detail || 'Invalid username or password');
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="brand-logo">InstaClone</h1>
        <form className="auth-form" onSubmit={handleLogin}>
          <input
            className="input-field"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            className="input-field"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button className="btn btn-brand" type="submit" style={{ marginTop: '8px' }}>
            Log In
          </button>
        </form>
        {error && <div className="error-text">{error}</div>}
      </div>
      
      <div className="auth-box" style={{ marginTop: '10px', padding: '20px' }}>
        <p style={{ fontSize: '14px' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
