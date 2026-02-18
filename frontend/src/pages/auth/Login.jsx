/**
 * Login Page
 * Handles user authentication with role-based redirection
 */

import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Auth.css";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(""); // Clear error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(formData);

      // Get user from localStorage to determine redirect
      const user = JSON.parse(localStorage.getItem("user"));

      // Role-based redirection
      switch (user.role) {
        case "super_admin":
          navigate("/superadmin/dashboard");
          break;
        case "admin":
          navigate("/admin/dashboard");
          break;
        case "faculty":
          navigate("/faculty/dashboard");
          break;
        case "student":
          navigate("/student/dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      if (err.response?.status === 402 || err.response?.data?.code === 'PAYMENT_REQUIRED') {
        // Redirect to payment if subscription is pending
        const pendingUser = err.response.data.user; // If backend sends user data on 402, otherwise we might need another way
        // But usually Login fails fully. 
        // Let's check how checkSubscription middleware behaves. 
        // Actually, Login API (auth.controller) does NOT use checkSubscription. 
        // So user CAN login, but subsequent API calls will fail with 402.
        // However, if the user account is created but not activated, they can login. 
        // The redirection happens AFTER login when they try to access Dashboard.

        // Wait, if login is successful, we go to dashboard.
        // Then dashboard API calls (e.g. stats) will fail with 402.
        // So we need to handle 402 in the AXIOS INTERCEPTOR or in the Dashboard page.

        // BUT, if we want to catch it here (if we decide to block login for unpaid):
        // Current implementation allows login. 
        setError(err.response?.data?.message || "Login failed. Please try again.");
      } else {
        setError(err.response?.data?.message || "Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">🎓 Student SaaS</h1>
          <p className="auth-subtitle">Sign in to your account</p>
        </div>

        {error && (
          <div className="alert alert-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="admin@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group flex justify-between items-center">
            <label className="checkbox-label">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" className="text-sm">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/register" className="font-semibold">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
