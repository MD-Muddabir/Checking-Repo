/**
 * Register Page — Premium Design (Phase 6)
 * Matches the Login page aesthetic with glassmorphism, animated orbs.
 * Uses Auth.css base + register-specific styles.
 * Always Pro theme active (same as login).
 */

import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import { ThemeContext } from "../../context/ThemeContext";
import ThemeSelector from "../../components/ThemeSelector";
import "../auth/Auth.css";
import "./Register.css";

function RegisterPage() {
    const navigate = useNavigate();
    const { setUser } = useContext(AuthContext);
    const { setTheme, isDark } = useContext(ThemeContext);

    const [loading, setLoading] = useState(false);
    const [plans, setPlans] = useState([]);
    const [errors, setErrors] = useState({});
    const [step, setStep] = useState(1);

    const [formData, setFormData] = useState({
        instituteName: "",
        email: "",
        password: "",
        confirmPassword: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        pincode: "",
        planId: "",
        agreedToTerms: false
    });

    useEffect(() => {
        fetchPlans();
        const selectedPlan = localStorage.getItem("selectedPlan");
        if (selectedPlan) setFormData(prev => ({ ...prev, planId: selectedPlan }));

        // Force pro theme for auth pages
        setTheme(isDark, "pro");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchPlans = async () => {
        try {
            const response = await api.get("/plans");
            setPlans(response.data.data.filter(plan => plan.status === "active"));
        } catch (error) {
            console.error("Error fetching plans:", error);
        }
    };

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phoneRegex = /^[6-9]\d{9}$/;
        const pincodeRegex = /^\d{6}$/;

        if (!formData.instituteName.trim() || formData.instituteName.trim().length < 3)
            newErrors.instituteName = "Institute name must be at least 3 characters";
        if (!formData.email.trim() || !emailRegex.test(formData.email))
            newErrors.email = "Please enter a valid email address";
        if (!formData.password || formData.password.length < 8)
            newErrors.password = "Password must be at least 8 characters";
        else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password))
            newErrors.password = "Password must contain uppercase, lowercase, and number";
        if (formData.password !== formData.confirmPassword)
            newErrors.confirmPassword = "Passwords do not match";
        if (!formData.phone.trim() || !phoneRegex.test(formData.phone.replace(/\s/g, "")))
            newErrors.phone = "Please enter a valid 10-digit phone number";
        if (!formData.address.trim()) newErrors.address = "Address is required";
        if (!formData.city.trim()) newErrors.city = "City is required";
        if (!formData.state.trim()) newErrors.state = "State is required";
        if (!formData.pincode.trim() || !pincodeRegex.test(formData.pincode))
            newErrors.pincode = "Please enter a valid 6-digit pincode";
        if (!formData.planId) newErrors.planId = "Please select a plan";
        if (!formData.agreedToTerms) newErrors.agreedToTerms = "You must agree to the Terms of Service";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;
        setLoading(true);
        try {
            const response = await api.post("/auth/register-institute", {
                name: formData.instituteName.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                phone: formData.phone.replace(/\s/g, ""),
                address: formData.address.trim(),
                city: formData.city.trim(),
                state: formData.state.trim(),
                pincode: formData.pincode.trim(),
                plan_id: formData.planId
            });

            if (response.data.success) {
                const selectedPlan = plans.find(p => p.id === parseInt(formData.planId));
                if (response.data.token) {
                    localStorage.setItem("token", response.data.token);
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                    setUser(response.data.user);
                }
                if (selectedPlan && selectedPlan.price > 0 && !selectedPlan.is_free_trial) {
                    alert("Registration successful! Redirecting to payment...");
                    navigate("/checkout");
                } else {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    if (selectedPlan && selectedPlan.is_free_trial) {
                        alert("Registration successful! Your free trial is active. Please login to continue.");
                    } else {
                        alert("Registration successful! Please login to continue.");
                    }
                    navigate("/login");
                }
            }
        } catch (error) {
            if (error.response?.data?.message?.includes("email")) {
                setErrors({ email: "This email is already registered" });
            } else {
                alert(error.response?.data?.message || "Registration failed. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* Animated background orbs */}
            <div className="auth-orb auth-orb--1" />
            <div className="auth-orb auth-orb--2" />
            <div className="auth-orb auth-orb--3" />

            {/* Theme toggle (top-right, login mode) */}
            <div className="auth-theme-controls">
                <ThemeSelector loginMode />
            </div>

            <div className="auth-container" style={{ maxWidth: "560px" }}>
                <div className="auth-card reg-card">
                    {/* Header */}
                    <div className="auth-header">
                        <div className="auth-logo">🏫</div>
                        <h1 className="auth-title">Register Your Institute</h1>
                        <p className="auth-subtitle">Join thousands of institutes. Start free, scale as you grow.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form reg-form" noValidate>

                        {/* ── Section 1: Institute Info ── */}
                        <div className="reg-section">
                            <h3 className="reg-section-title">🏫 Institute Information</h3>

                            <div className="auth-field">
                                <label className="auth-label">
                                    <span className="auth-label__icon">🏷️</span> Institute Name *
                                </label>
                                <input type="text" name="instituteName" className={`auth-input${errors.instituteName ? " auth-input--error" : ""}`}
                                    placeholder="e.g. Sunrise Academy" value={formData.instituteName} onChange={handleChange} />
                                {errors.instituteName && <span className="reg-error">{errors.instituteName}</span>}
                            </div>

                            <div className="reg-row">
                                <div className="auth-field">
                                    <label className="auth-label">
                                        <span className="auth-label__icon">✉️</span> Email *
                                    </label>
                                    <input type="email" name="email" className={`auth-input${errors.email ? " auth-input--error" : ""}`}
                                        placeholder="institute@example.com" value={formData.email} onChange={handleChange} />
                                    {errors.email && <span className="reg-error">{errors.email}</span>}
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">
                                        <span className="auth-label__icon">📱</span> Phone *
                                    </label>
                                    <input type="tel" name="phone" className={`auth-input${errors.phone ? " auth-input--error" : ""}`}
                                        placeholder="9876543210" value={formData.phone} onChange={handleChange} />
                                    {errors.phone && <span className="reg-error">{errors.phone}</span>}
                                </div>
                            </div>

                            <div className="auth-field">
                                <label className="auth-label">
                                    <span className="auth-label__icon">📍</span> Address *
                                </label>
                                <input type="text" name="address" className={`auth-input${errors.address ? " auth-input--error" : ""}`}
                                    placeholder="Street / Area / Locality" value={formData.address} onChange={handleChange} />
                                {errors.address && <span className="reg-error">{errors.address}</span>}
                            </div>

                            <div className="reg-row reg-row--3">
                                <div className="auth-field">
                                    <label className="auth-label">🏙️ City *</label>
                                    <input type="text" name="city" className={`auth-input${errors.city ? " auth-input--error" : ""}`}
                                        placeholder="City" value={formData.city} onChange={handleChange} />
                                    {errors.city && <span className="reg-error">{errors.city}</span>}
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">🗺️ State *</label>
                                    <input type="text" name="state" className={`auth-input${errors.state ? " auth-input--error" : ""}`}
                                        placeholder="State" value={formData.state} onChange={handleChange} />
                                    {errors.state && <span className="reg-error">{errors.state}</span>}
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">📮 ZIP Code *</label>
                                    <input type="text" name="pincode" className={`auth-input${errors.pincode ? " auth-input--error" : ""}`}
                                        placeholder="123456" value={formData.pincode} onChange={handleChange} maxLength="6" />
                                    {errors.pincode && <span className="reg-error">{errors.pincode}</span>}
                                </div>
                            </div>
                        </div>

                        {/* ── Section 2: Security ── */}
                        <div className="reg-section">
                            <h3 className="reg-section-title">🔐 Security</h3>
                            <div className="reg-row">
                                <div className="auth-field">
                                    <label className="auth-label">
                                        <span className="auth-label__icon">🔒</span> Password *
                                    </label>
                                    <input type="password" name="password" className={`auth-input${errors.password ? " auth-input--error" : ""}`}
                                        placeholder="Min 8 chars, A-Z, 0-9" value={formData.password} onChange={handleChange} />
                                    {errors.password && <span className="reg-error">{errors.password}</span>}
                                </div>
                                <div className="auth-field">
                                    <label className="auth-label">
                                        <span className="auth-label__icon">✅</span> Confirm Password *
                                    </label>
                                    <input type="password" name="confirmPassword" className={`auth-input${errors.confirmPassword ? " auth-input--error" : ""}`}
                                        placeholder="Repeat password" value={formData.confirmPassword} onChange={handleChange} />
                                    {errors.confirmPassword && <span className="reg-error">{errors.confirmPassword}</span>}
                                </div>
                            </div>
                        </div>

                        {/* ── Section 3: Plan Selection ── */}
                        <div className="reg-section">
                            <h3 className="reg-section-title">📦 Choose Your Plan</h3>
                            <div className="auth-field">
                                <label className="auth-label">
                                    <span className="auth-label__icon">🎯</span> Select Plan *
                                </label>
                                <select name="planId" className={`auth-input${errors.planId ? " auth-input--error" : ""}`}
                                    value={formData.planId} onChange={handleChange}>
                                    <option value="">-- Select a plan --</option>
                                    {plans.map(plan => (
                                        <option key={plan.id} value={plan.id}>
                                            {plan.name} — {plan.is_free_trial ? '₹0/month (Free Trial)' : `₹${plan.price}/month`}
                                            {plan.max_students ? ` · Up to ${plan.max_students} students` : " · Unlimited"}
                                        </option>
                                    ))}
                                </select>
                                {errors.planId && <span className="reg-error">{errors.planId}</span>}
                                <div className="reg-plan-hint">
                                    <Link to="/pricing" target="_blank" className="auth-link">
                                        📋 View all plans & features
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* ── Terms Checkbox ── */}
                        <div className="reg-terms">
                            <label className="reg-terms-label">
                                <input type="checkbox" name="agreedToTerms" checked={formData.agreedToTerms} onChange={handleChange} />
                                <span>
                                    I agree to the{" "}
                                    <Link to="/terms" target="_blank" className="auth-link">Terms of Service</Link>
                                    {" "}and{" "}
                                    <Link to="/privacy" target="_blank" className="auth-link">Privacy Policy</Link>
                                </span>
                            </label>
                            {errors.agreedToTerms && <span className="reg-error">{errors.agreedToTerms}</span>}
                        </div>

                        {/* ── Submit ── */}
                        <button
                            type="submit"
                            className={`auth-submit${loading ? " auth-submit--loading" : ""}`}
                            disabled={loading}
                            style={{ marginTop: "0.5rem" }}
                        >
                            {loading ? (
                                <><span className="auth-spinner" /> Creating Account...</>
                            ) : (
                                <><span>🚀</span> Create Account &amp; Continue</>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="auth-footer">
                        <div className="auth-divider"><span>OR</span></div>
                        <p className="auth-footer__text">
                            Already have an account?{" "}
                            <Link to="/login" className="auth-link">Login here</Link>
                        </p>
                        <Link to="/" className="auth-back-home">← Back to Home</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
