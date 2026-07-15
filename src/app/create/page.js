'use client';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createPost, createReel } from '@/utils/api';

export default function Create() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('post'); // 'post' or 'reel'
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setFile(null);
    setPreviewUrl(null);
    setFormData({ title: '', description: '' });
    setError('');
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    
    if (activeTab === 'post') {
      data.append('attachment', file);
    } else {
      data.append('video', file);
    }

    try {
      const res = activeTab === 'post' ? await createPost(data) : await createReel(data);
      if (res.ok) {
        router.push('/');
      } else {
        const errorData = await res.json();
        setError(JSON.stringify(errorData));
      }
    } catch (err) {
      setError('A network error occurred while uploading.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '600px', marginTop: '40px', marginBottom: '40px' }}>
      <div className="card" style={{ padding: '24px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '24px', fontWeight: 600 }}>Create New</h1>
        
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
          <button 
            style={{ flex: 1, padding: '12px', fontWeight: 600, borderBottom: activeTab === 'post' ? '2px solid var(--text-color)' : '2px solid transparent', color: activeTab === 'post' ? 'var(--text-color)' : 'var(--text-secondary)' }}
            onClick={() => handleTabChange('post')}
          >
            Post (Photo)
          </button>
          <button 
            style={{ flex: 1, padding: '12px', fontWeight: 600, borderBottom: activeTab === 'reel' ? '2px solid var(--text-color)' : '2px solid transparent', color: activeTab === 'reel' ? 'var(--text-color)' : 'var(--text-secondary)' }}
            onClick={() => handleTabChange('reel')}
          >
            Reel (Video)
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* File Upload Area */}
          <div 
            style={{ border: '2px dashed var(--border-color)', borderRadius: '8px', padding: previewUrl ? '0' : '40px', textAlign: 'center', cursor: 'pointer', overflow: 'hidden', backgroundColor: 'var(--bg-color)' }}
            onClick={() => fileInputRef.current?.click()}
          >
            {previewUrl ? (
              activeTab === 'post' ? (
                <img src={previewUrl} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', display: 'block' }} />
              ) : (
                <video src={previewUrl} controls style={{ width: '100%', maxHeight: '400px', display: 'block' }} />
              )
            ) : (
              <div style={{ color: 'var(--text-secondary)' }}>
                <svg aria-label="Icon to represent media such as images or videos" fill="currentColor" height="77" role="img" viewBox="0 0 97.6 77.3" width="96" style={{ margin: '0 auto 16px' }}><path d="M16.3 24h.3c2.8-.2 4.9-2.6 4.8-5.4-.2-2.8-2.6-4.9-5.4-4.8s-4.9 2.6-4.8 5.4c.1 2.7 2.4 4.8 5.1 4.8zm-2.4-7.2c.5-.6 1.3-1 2.1-1h.2c1.7 0 3.1 1.4 3.1 3.1 0 1.7-1.4 3.1-3.1 3.1-1.7 0-3.1-1.4-3.1-3.1 0-.8.3-1.5.8-2.1z" fill="currentColor"></path><path d="M84.7 18.4 58.6 12.2C54.6 11.3 50.7 13.9 49.8 17.9L46.7 33.5c-.8 3.9 1.7 7.9 5.7 8.8l26.1 6.1c3.9.8 7.9-1.7 8.8-5.7l3.1-15.5c.8-4-1.7-8-5.7-8.8zm-2.9 19.8c-.5 2.5-3 4-5.5 3.5L50.2 35.6c-2.5-.5-4-3-3.5-5.5l3.1-15.5c.5-2.5 3-4 5.5-3.5l26.1 6.1c2.5.5 4 3 3.5 5.5l-3.1 15.6z" fill="currentColor"></path><path d="M10.4 54.2h2.77L13 53.6c-1.5-1.5-1.5-3.8 0-5.3l12.7-12.7c1.5-1.5 3.8-1.5 5.3 0l7.4 7.4c1.5 1.5 3.8 1.5 5.3 0l14.7-14.7c1.5-1.5 3.8-1.5 5.3 0l10.1 10.1c1.5 1.5 1.5 3.8 0 5.3-1.5 1.5-3.8 1.5-5.3 0l-7.4-7.4-14.7 14.7c-1.5 1.5-3.8 1.5-5.3 0l-7.4-7.4-12.7 12.7c-1.5 1.5-3.8 1.5-5.3 0-1.5-1.5-1.5-3.8 0-5.3z" fill="currentColor"></path></svg>
                <p style={{ fontSize: '18px', fontWeight: 600 }}>Click to select {activeTab === 'post' ? 'a photo' : 'a video'}</p>
              </div>
            )}
          </div>
          
          <input 
            type="file" 
            accept={activeTab === 'post' ? 'image/*' : 'video/*'}
            ref={fileInputRef}
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <input 
            className="input-field" 
            name="title" 
            type="text" 
            placeholder="Title" 
            value={formData.title} 
            onChange={handleChange} 
            required 
          />
          
          <textarea 
            className="input-field" 
            name="description" 
            placeholder="Write a caption..." 
            rows="3"
            value={formData.description} 
            onChange={handleChange} 
            style={{ resize: 'vertical' }}
          ></textarea>

          {error && <div className="error-text">{error}</div>}

          <button 
            className="btn btn-brand" 
            type="submit" 
            disabled={loading}
            style={{ marginTop: '8px', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Uploading...' : 'Share'}
          </button>
        </form>
      </div>
    </div>
  );
}
