import { useEffect, useState } from 'react';
import api from '../api/client';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/posts')
      .then((res) => setPosts(res.data.data))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page-center">Loading posts…</p>;

  return (
    <div className="page">
      <h1>Awareness posts</h1>
      {posts.length === 0 && <p className="muted">No posts yet.</p>}
      <div className="doctor-grid">
        {posts.map((p) => (
          <div className="doctor-card card" key={p._id}>
            {p.imageUrl && <img src={p.imageUrl} alt="post" style={{ width: '100%', borderRadius: 8 }} />}
            <h3>{p.title}</h3>
            <p className="muted">By Dr. {p.doctor?.firstName} {p.doctor?.lastName}</p>
            <p>{p.content.slice(0, 220)}{p.content.length>220?'...':''}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
