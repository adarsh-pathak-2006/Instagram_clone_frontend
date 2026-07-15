'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/utils/api';
import Link from 'next/link';

export default function Register() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(formData);
      const data = await res.json();
      
      if (res.ok && data.message === 'registration successfull') {
        router.push('/login');
      } else {
        setError(JSON.stringify(data));
      }
    } catch (err) {
      setError('Network error occurred');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h1 className="brand-logo">InstaClone</h1>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '20px', fontWeight: 600 }}>
          Sign up to see photos and videos from your friends.
        </p>
        <form className="auth-form" onSubmit={handleRegister}>
          <input className="input-field" name="first_name" type="text" placeholder="First Name" onChange={handleChange} required />
          <input className="input-field" name="last_name" type="text" placeholder="Last Name" onChange={handleChange} required />
          <input className="input-field" name="username" type="text" placeholder="Username" onChange={handleChange} required />
          <input className="input-field" name="email" type="email" placeholder="Email" onChange={handleChange} required />
          <input className="input-field" name="password" type="password" placeholder="Password" onChange={handleChange} required />
          <button className="btn btn-brand" type="submit" style={{ marginTop: '8px' }}>
            Sign Up
          </button>
        </form>
        {error && <div className="error-text">{error}</div>}
      </div>
      
      <div className="auth-box" style={{ marginTop: '10px', padding: '20px' }}>
        <p style={{ fontSize: '14px' }}>
          Have an account?{' '}
          <Link href="/login" style={{ color: 'var(--accent-color)', fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
