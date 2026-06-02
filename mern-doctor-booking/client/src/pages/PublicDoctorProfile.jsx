import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { SERVER_URL } from '../api/client';

const POSTS_PER_PAGE = 2;

export default function PublicDoctorProfile() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedPostId, setExpandedPostId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [doctorRes, postsRes] = await Promise.all([
          api.get(`/doctors/${id}`),
          api.get(`/posts/doctor/${id}`),
        ]);
        setDoctor(doctorRes.data.data);
        setPosts(postsRes.data.data);
        setPage(1);
      } catch (err) {
        console.error('Failed to load doctor profile', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) return <p className="page-center">Loading doctor profile…</p>;
  if (!doctor) return <p className="page-center">Doctor not found</p>;

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const pagePosts = posts.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);

  return (
    <div className="page">
      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
          <div
            className="doctor-avatar"
            style={{
              fontSize: '4rem',
              width: '120px',
              height: '120px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {doctor.firstName[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h1 style={{ marginTop: 0 }}>
              Dr. {doctor.firstName} {doctor.lastName}
            </h1>
            <p className="tag">{doctor.doctorProfile?.specialization}</p>
            <p>
              <strong>Clinic:</strong> {doctor.doctorProfile?.clinicName || 'N/A'}
            </p>
            <p>
              <strong>City:</strong> {doctor.doctorProfile?.city || 'N/A'}
            </p>
            <p>
              <strong>Experience:</strong> {doctor.doctorProfile?.experience || 'N/A'}
            </p>
            <p>
              <strong>Consultation Fee:</strong> Rs. {doctor.doctorProfile?.consultationFee || 'N/A'}
            </p>
            {doctor.doctorProfile?.bio && (
              <p>
                <strong>Bio:</strong> {doctor.doctorProfile.bio}
              </p>
            )}
            <Link to={`/doctors/${doctor._id}/book`} className="btn">
              Book appointment
            </Link>
          </div>
        </div>
      </div>

      <h2>Awareness Posts</h2>
      {posts.length === 0 ? (
        <p className="muted">No posts yet from this doctor.</p>
      ) : (
        <>
          <div className="post-feed">
            {pagePosts.map((post) => {
              const isExpanded = expandedPostId === post._id;
              const shouldTruncate = post.content.length > 220;
              const displayContent = isExpanded ? post.content : post.content.slice(0, 220);

              return (
                <div className="doctor-card card" key={post._id}>
                  {post.imagePath && (
                    <img
                      src={`${SERVER_URL}/uploads/${post.imagePath}`}
                      alt={post.title}
                      style={{ width: '100%', borderRadius: 8 }}
                    />
                  )}
                  <h3>{post.title}</h3>
                  <p className="muted">
                    Posted {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                  <p>
                    {displayContent}
                    {shouldTruncate && !isExpanded && '...'}
                  </p>
                  {shouldTruncate && (
                    <button
                      type="button"
                      className="btn btn-sm btn-ghost"
                      onClick={() => setExpandedPostId(isExpanded ? null : post._id)}
                    >
                      {isExpanded ? 'Show less' : 'Continue reading'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="pagination-row">
              {page > 1 && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                >
                  Previous
                </button>
              )}
              <span>
                Page {page} of {totalPages}
              </span>
              {page < totalPages && (
                <button
                  type="button"
                  className="btn btn-sm btn-ghost"
                  onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                >
                  Next
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
