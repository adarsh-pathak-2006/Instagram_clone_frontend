'use client';
import { useState } from 'react';
import { updateProfile } from '@/utils/api';

export default function EditProfileModal({ profile, onClose, onSave }) {
  const [name, setName] = useState(profile.name || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [preview, setPreview] = useState(profile.profile_picture || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('bio', bio);
    if (avatarFile) {
      formData.append('profile_picture', avatarFile);
    }

    try {
      const res = await updateProfile(formData);
      if (res.ok) {
        const updated = await res.json();
        onSave(updated);
        onClose();
      } else {
        const err = await res.json();
        setError(JSON.stringify(err));
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div style={{
        background: '#fff',
        borderRadius: '12px',
        width: '100%',
        maxWidth: '520px',
        overflow: 'hidden',
        boxShadow: '0 16px 40px rgba(0,0,0,0.2)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid var(--border-color)' }}>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'var(--text-color)', lineHeight: 1 }}>✕</button>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Edit Profile</h2>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{ background: 'none', border: 'none', color: 'var(--accent-color)', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: loading ? 0.5 : 1 }}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Avatar Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <label htmlFor="avatar-upload" style={{ cursor: 'pointer', flexShrink: 0 }}>
              <img
                src={preview || `https://ui-avatars.com/api/?name=${name}&background=random`}
                alt="avatar"
                style={{ width: '72px', height: '72px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${name}`; }}
              />
            </label>
            <div>
              <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{profile.user?.username}</p>
              <label htmlFor="avatar-upload" style={{ color: 'var(--accent-color)', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>
                Change profile photo
              </label>
              <input id="avatar-upload" type="file" accept="image/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>
          </div>

          {/* Name */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field"
              placeholder="Your name"
            />
          </div>

          {/* Bio */}
          <div>
            <label style={{ display: 'block', fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input-field"
              placeholder="Write something about yourself..."
              rows={4}
              style={{ resize: 'vertical' }}
            />
          </div>

          {error && <p style={{ color: 'var(--red)', fontSize: '13px' }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}
