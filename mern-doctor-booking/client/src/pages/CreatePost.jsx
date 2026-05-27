import { useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';

export default function CreatePost() {
  const [title, setTitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.post('/posts', { title, imageUrl, content });
      navigate('/posts');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not create post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page narrow">
      <h1>Create awareness post</h1>
      <form className="card form-card" onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </label>
        <label>
          Image URL (optional)
          <input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
        </label>
        <label>
          Content
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6} required />
        </label>
        <button type="submit" className="btn btn-block" disabled={loading}>
          {loading ? 'Posting…' : 'Publish'}
        </button>
      </form>
    </div>
  );
}
