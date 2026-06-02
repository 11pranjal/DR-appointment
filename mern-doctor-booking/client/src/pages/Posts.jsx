import { useEffect, useState } from 'react';
import api, { SERVER_URL } from '../api/client';

const POSTS_PER_PAGE = 2;

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    api
      .get('/posts')
      .then((res) => {
        setPosts(res.data.data);
        setPage(1);
      })
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="page-center">Loading posts…</p>;

  return (
    <div className="page">
      <h1>All Awareness posts</h1>
      {posts.length === 0 && <p className="muted">No posts yet.</p>}
      <div className="posts-grid">
        {posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE).map((p) => {
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
      {posts.length > POSTS_PER_PAGE && (
        <div className="pagination-row">
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            disabled={page === 1}
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          >
            Previous
          </button>
          <span>Page {page} of {Math.ceil(posts.length / POSTS_PER_PAGE)}</span>
          <button
            type="button"
            className="btn btn-sm btn-ghost"
            disabled={page === Math.ceil(posts.length / POSTS_PER_PAGE)}
            onClick={() => setPage((prev) => Math.min(prev + 1, Math.ceil(posts.length / POSTS_PER_PAGE)))}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
