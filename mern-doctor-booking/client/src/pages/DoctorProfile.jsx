import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const emptyPost = { title: '', imageUrl: '', content: '' };

export default function DoctorProfile() {
  const { user, setSession } = useAuth();
  const [profile, setProfile] = useState(user?.doctorProfile || {});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [posts, setPosts] = useState([]);
  const [postForm, setPostForm] = useState(emptyPost);
  const [selectedPost, setSelectedPost] = useState(null);
  const [postLoading, setPostLoading] = useState(false);
  const [postMsg, setPostMsg] = useState('');

  useEffect(() => {
    setProfile(user?.doctorProfile || {});
    if (user) {
      loadPosts();
    }
  }, [user]);

  const loadPosts = async () => {
    try {
      const { data } = await api.get(`/posts/doctor/${user._id}`);
      setPosts(data.data);
    } catch {
      setPosts([]);
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const { data } = await api.put(`/users/${user._id}`, { doctorProfile: profile });
      setSession(localStorage.getItem('token'), data.data);
      setMsg('Saved');
    } catch (err) {
      setMsg(err.response?.data?.message || 'Could not save');
    } finally {
      setLoading(false);
    }
  };

  const resetPostForm = () => {
    setSelectedPost(null);
    setPostForm(emptyPost);
    setPostMsg('');
  };

  const savePost = async (e) => {
    e.preventDefault();
    setPostLoading(true);
    setPostMsg('');
    try {
      if (selectedPost) {
        await api.put(`/posts/${selectedPost._id}`, postForm);
        setPostMsg('Post updated');
      } else {
        await api.post('/posts', postForm);
        setPostMsg('Post created');
      }
      resetPostForm();
      await loadPosts();
    } catch (err) {
      setPostMsg(err.response?.data?.message || 'Could not save post');
    } finally {
      setPostLoading(false);
    }
  };

  if (!user) return <p className="page-center">Loading…</p>;

  return (
    <div className="page narrow">
      <h1>My profile</h1>
      <form className="card form-card" onSubmit={save}>
        {msg && <p className="muted">{msg}</p>}
        <label>
          Specialization
          <input value={profile.specialization || ''} onChange={(e) => setProfile({ ...profile, specialization: e.target.value })} />
        </label>
        <label>
          Consultation fee
          <input type="number" value={profile.consultationFee || 0} onChange={(e) => setProfile({ ...profile, consultationFee: Number(e.target.value) })} />
        </label>
        <label>
          City
          <input value={profile.city || ''} onChange={(e) => setProfile({ ...profile, city: e.target.value })} />
        </label>
        <button className="btn btn-block" disabled={loading} type="submit">{loading ? 'Saving…' : 'Save'}</button>
        <button
          type="button"
          className="btn btn-ghost"
          style={{ marginTop: 12 }}
          onClick={async () => {
            if (!window.confirm('Request account deletion? Admin will confirm.')) return;
            try {
              await api.delete(`/users/${user._id}`);
              alert('Deletion requested. Admin will confirm.');
            } catch (err) {
              alert(err.response?.data?.message || 'Could not request deletion');
            }
          }}
        >
          Delete account
        </button>
      </form>

      <h2>My awareness posts</h2>
      <form className="card form-card" onSubmit={savePost}>
        {postMsg && <p className={postMsg.includes('could not') ? 'error' : 'muted'}>{postMsg}</p>}
        <label>
          Title
          <input
            value={postForm.title}
            onChange={(e) => setPostForm({ ...postForm, title: e.target.value })}
            required
          />
        </label>
        <label>
          Image URL
          <input value={postForm.imageUrl} onChange={(e) => setPostForm({ ...postForm, imageUrl: e.target.value })} />
        </label>
        <label>
          Content
          <textarea
            rows={6}
            value={postForm.content}
            onChange={(e) => setPostForm({ ...postForm, content: e.target.value })}
            required
          />
        </label>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-block" disabled={postLoading} type="submit">
            {postLoading ? (selectedPost ? 'Updating…' : 'Publishing…') : selectedPost ? 'Update post' : 'Publish post'}
          </button>
          {selectedPost && (
            <button type="button" className="btn btn-ghost" onClick={resetPostForm}>
              Cancel edit
            </button>
          )}
        </div>
      </form>

      {posts.length === 0 ? (
        <p className="muted">No awareness posts yet. Create one above to show on your doctor profile.</p>
      ) : (
        <div className="doctor-grid">
          {posts.map((post) => (
            <div key={post._id} className="doctor-card card">
              {post.imageUrl && <img src={post.imageUrl} alt={post.title} style={{ width: '100%', borderRadius: 8 }} />}
              <h3>{post.title}</h3>
              <p>{post.content.slice(0, 200)}{post.content.length > 200 ? '...' : ''}</p>
              <button type="button" className="btn btn-ghost" onClick={() => {
                setSelectedPost(post);
                setPostForm({ title: post.title, imageUrl: post.imageUrl || '', content: post.content });
              }}>
                Edit post
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
