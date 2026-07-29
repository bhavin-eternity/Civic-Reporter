import React from 'react'
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

function Signup() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const { data } = await api.post('/auth/signup', formData);
            login(data);
            if (data.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Something went wrong')
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2 style={styles.heading}>Create Account</h2>
                <p style={styles.subtitle}>
                    Join us and start your journey today
                </p>

                {error && <p style={styles.error}>{error}</p>}

                <input
                    style={styles.input}
                    type="text"
                    name="name"
                    placeholder="Full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                />
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

                <button style={styles.button} type="submit" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                </button>

                <p style={styles.linkText}>
                    Already have an account?{" "}
                    <Link style={styles.link} to="/login">
                        Log in
                    </Link>
                </p>
            </form>
        </div>
    )
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f8fafc",
        padding: "24px",
    },

    form: {
        width: "100%",
        maxWidth: "400px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
        padding: "32px",
        backgroundColor: "#ffffff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    },

    heading: {
        margin: 0,
        fontSize: "28px",
        fontWeight: "600",
        color: "#111827",
        textAlign: "center",
    },

    subtitle: {
        margin: 0,
        textAlign: "center",
        color: "#6b7280",
        fontSize: "14px",
        marginBottom: "8px",
    },

    input: {
        padding: "12px 14px",
        fontSize: "14px",
        border: "1px solid #d1d5db",
        borderRadius: "8px",
        outline: "none",
        backgroundColor: "#ffffff",
        color: "#111827",
    },

    button: {
        marginTop: "8px",
        padding: "12px",
        border: "none",
        borderRadius: "8px",
        backgroundColor: "#111827",
        color: "#ffffff",
        fontSize: "14px",
        fontWeight: "500",
        cursor: "pointer",
    },

    linkText: {
        textAlign: "center",
        fontSize: "14px",
        color: "#6b7280",
        margin: 0,
    },

    link: {
        color: "#111827",
        fontWeight: "500",
        textDecoration: "none",
    },

    error: {
        padding: "10px 12px",
        borderRadius: "8px",
        backgroundColor: "#fef2f2",
        border: "1px solid #fecaca",
        color: "#dc2626",
        fontSize: "14px",
    },
};

export default Signup
