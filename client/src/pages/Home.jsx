import React from 'react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const CATEGORIES = ['all', 'road', 'garbage', 'water', 'electricity', 'traffic', 'other'];
const STATUSES = ['all', 'open', 'in_progress', 'resolved', 'closed'];

function Home() {
  const { user } = useAuth();
  const { socket } = useSocket();

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
  });

  useEffect(() => {
    fetchIssues();
  }, [filters, page]);

  useEffect(() => {
    if (!socket) return;

    socket.on('new-issue', (issue) => {

      const categoryMatch = !filters.category ||
        issue.category === filters.category;

      const statusMatch = !filters.status ||
        issue.status === filters.status;

      if (categoryMatch && statusMatch) {
        setIssues(prev => [issue, ...prev]);
      }
    });

    return () => socket.off('new-issue');
  }, [socket, filters]);

  const fetchIssues = async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 10 };
      if (filters.category) params.category = filters.category;
      if (filters.status) params.status = filters.status;

      const { data } = await api.get('/issues', { params });
      setIssues(data.issues);
      setTotalPages(data.totalPages);
    } catch (error) {
      setError('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters(prev => ({ ...prev, [key]: value === 'all' ? '' : value }));
  };

  const handleUpvote = async (issueId) => {
      

    try {
      const { data } = await api.put(`/issues/${issueId}/upvote`);
      setIssues(prev =>
        prev.map(issue =>
          issue._id === issueId
            ? { ...issue, upvotes: Array(data.upvotes).fill(null) }
            : issue
        )
      );
    } catch (error) {
      console.error('Upvote failed:', error.message);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Civic Issues</h1>
          <p style={styles.subtitle}>
            Real-time community issue tracker
          </p>
        </div>
        {user && user.role === 'citizen' && (
          <Link to="/issues/new" style={styles.reportBtn}>
            + Report Issue
          </Link>
        )}

      </div>
      <div style={styles.filters}>
        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Category</label>
          <select
            style={styles.select}
            value={filters.category || 'all'}
            onChange={(e) => handleFilterChange('category', e.target.value)}
          >
            {CATEGORIES.map(c => (
              <option key={c} value={c}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.filterLabel}>Status</label>
          <select
            style={styles.select}
            value={filters.status || 'all'}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            {STATUSES.map(s => (
              <option key={s} value={s}>
                {s.replace('_', ' ').charAt(0).toUpperCase() +
                  s.replace('_', ' ').slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <p style={styles.message}>Loading issues...</p>
      ) : error ? (
        <p style={{ ...styles.message, color: 'red' }}>{error}</p>
      ) : issues.length === 0 ? (
        <p style={styles.message}>No issues found</p>
      ) : (
        <div style={styles.issueList}>
          {issues.map(issue => (
           
            
            <IssueCard
              key={issue._id}
              issue={issue}
              user={user}
              onUpvote={handleUpvote}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            style={styles.pageBtn}
            disabled={page === 1}
            onClick={() => setPage(p => p - 1)}
          >
            ← Prev
          </button>
          <span style={styles.pageInfo}>
            {page} of {totalPages}
          </span>
          <button
            style={styles.pageBtn}
            disabled={page === totalPages}
            onClick={() => setPage(p => p + 1)}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

const statusColors = {
  open: '#dc2626',
  in_progress: '#d97706',
  resolved: '#16a34a',
  closed: '#6b7280',
};

const IssueCard = ({ issue, user, onUpvote }) => {
  const hasUpvoted = user && issue.upvotes?.some(
    id => id === user._id || id?._id === user._id
  );

  return (
    <div style={styles.card}>
      {issue.photo && (
        <img
          src={issue.photo}
          alt={issue.title}
          style={styles.cardImage}
        />
      )}
      <div style={styles.cardBody}>
        <div style={styles.cardTop}>
          <span style={styles.category}>{issue.category}</span>
          <span style={{
            ...styles.status,
            backgroundColor: statusColors[issue.status] + '20',
            color: statusColors[issue.status],
          }}>
            {issue.status.replace('_', ' ')}
          </span>
        </div>

        <Link to={`/issues/${issue._id}`} style={styles.issueTitle}>
          {issue.title}
        </Link>

        <p style={styles.description}>
          {issue.description.substring(0, 100)}...
        </p>

        <p style={styles.address}>
          📍 {issue.location?.address}
        </p>

        <div style={styles.cardFooter}>
          <span style={styles.author}>
            
            By {issue.author?.name}
          </span>

          <button
            style={{
              ...styles.upvoteBtn,
              background: hasUpvoted ? '#111827' : 'white',
              color: hasUpvoted ? 'white' : '#111827',
            }}
            onClick={() => onUpvote(issue._id)}
            disabled={!user}
          >
            ▲ {issue.upvotes?.length || 0}
          </button>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '32px 16px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  subtitle: {
    color: '#6b7280',
    fontSize: '14px',
    margin: '4px 0 0',
  },
  reportBtn: {
    padding: '10px 18px',
    backgroundColor: '#111827',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '500',
  },
  filters: {
    display: 'flex',
    gap: '16px',
    marginBottom: '24px',
  },
  filterGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  filterLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  select: {
    padding: '8px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#111827',
    background: 'white',
    cursor: 'pointer',
  },
  issueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  message: {
    textAlign: 'center',
    color: '#6b7280',
    padding: '48px 0',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    overflow: 'hidden',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardImage: {
    width: '100%',
    height: '180px',
    objectFit: 'cover',
  },
  cardBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  cardTop: {
    display: 'flex',
    gap: '8px',
  },
  category: {
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#6b7280',
    background: '#f3f4f6',
    padding: '3px 8px',
    borderRadius: '4px',
  },
  status: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 8px',
    borderRadius: '4px',
    textTransform: 'capitalize',
  },
  issueTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    textDecoration: 'none',
  },
  description: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.5',
    margin: 0,
  },
  address: {
    fontSize: '13px',
    color: '#9ca3af',
    margin: 0,
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '4px',
  },
  author: {
    fontSize: '13px',
    color: '#9ca3af',
  },
  upvoteBtn: {
    border: '1px solid #111827',
    borderRadius: '6px',
    padding: '6px 12px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: '0.15s ease',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '32px',
  },
  pageBtn: {
    padding: '8px 16px',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    background: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  pageInfo: {
    fontSize: '14px',
    color: '#6b7280',
  },
};

export default Home
