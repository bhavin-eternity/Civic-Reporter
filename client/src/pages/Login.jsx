import React from 'react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';

function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/login', formData);
            login(data);
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong')
        }finally{
            setLoading(false);
        }
    }
   return (
  <div style={styles.container}>
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.heading}>Welcome Back</h2>
      <p style={styles.subtitle}>
        Sign in to continue to your account
      </p>

      {error && <p style={styles.error}>{error}</p>}

      <input
        style={styles.input}
        type="email"
        name="email"
        placeholder="Email address"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <input
        style={styles.input}
        type="password"
        name="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      />

      <button
        style={{
          ...styles.button,
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "not-allowed" : "pointer",
        }}
        type="submit"
        disabled={loading}
      >
        {loading ? "Logging in..." : "Log In"}
      </button>

      <p style={styles.linkText}>
        Don't have an account?{" "}
        <Link style={styles.link} to="/signup">
          Sign up
        </Link>
      </p>
    </form>
  </div>
);
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    padding: "24px",
  },

  form: {
    width: "100%",
    maxWidth: "400px",
    backgroundColor: "#ffffff",
    padding: "36px",
    borderRadius: "12px",
    border: "1px solid #e5e7eb",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },

  heading: {
    margin: 0,
    textAlign: "center",
    fontSize: "28px",
    fontWeight: "600",
    color: "#111827",
  },

  subtitle: {
    margin: 0,
    textAlign: "center",
    color: "#6b7280",
    fontSize: "14px",
    marginBottom: "8px",
  },

  input: {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    boxSizing: "border-box",
  },

  button: {
    backgroundColor: "#111827",
    color: "#ffffff",
    border: "none",
    borderRadius: "8px",
    padding: "12px",
    fontSize: "14px",
    fontWeight: "500",
    transition: "0.2s ease",
  },

  error: {
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fecaca",
    borderRadius: "8px",
    padding: "10px 12px",
    fontSize: "14px",
  },

  linkText: {
    textAlign: "center",
    fontSize: "14px",
    color: "#6b7280",
    margin: 0,
  },

  link: {
    color: "#111827",
    textDecoration: "none",
    fontWeight: "500",
  },
};

export default Login
