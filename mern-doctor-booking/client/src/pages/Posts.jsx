import { useEffect, useState } from 'react';
import api, { SERVER_URL } from '../api/client';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState(null);

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
      <h1>All Awareness posts</h1>
      {posts.length === 0 && <p className="muted">No posts yet.</p>}
      <div className="post-feed">
        {posts.map((p) => {
          const isExpanded = expandedPostId === p._id;
          const shouldTruncate = p.content.length > 220;
          const displayContent = isExpanded ? p.content : p.content.slice(0, 220);

          return (
            <div className="doctor-card card" key={p._id}>
              {p.imagePath && (
                <img
                  src={`${SERVER_URL}/uploads/${p.imagePath}`}
                  alt="post"
                  style={{ width: '100%', borderRadius: 8 }}
                />
              )}
              <h3>{p.title}</h3>
              <p className="muted">By Dr. {p.doctor?.firstName} {p.doctor?.lastName}</p>
              <p>
                {displayContent}
                {shouldTruncate && !isExpanded && '...'}
              </p>
              {shouldTruncate && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setExpandedPostId(isExpanded ? null : p._id)}
                >
                  {isExpanded ? 'Show less' : 'Continue reading'}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
