/**
 * Payment / Checkout Page
 * Handles new subscriptions and renewals
 * Simulates payment flow if Razorpay keys are missing
 */

import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../../services/api";
import "./PublicPages.css";

function PaymentPage() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    // Get plan details from URL or local state
    const [planId, setPlanId] = useState(searchParams.get("plan_id"));
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [billingCycle, setBillingCycle] = useState("monthly");

    useEffect(() => {
        // If logged in, fetch current pending plan or plan from URL
        fetchPlanDetails();
    }, [planId]);

    const fetchPlanDetails = async () => {
        try {
            // First check if user is logged in
            // If so, we might get plan from their pending subscription
            // For now, let's just fetch the plan from IDs
            if (!planId) {
                // Try fetching user profile to see if they have a pending plan
                try {
                    const profile = await api.get("/auth/profile");

                    if (profile.data.user && profile.data.user.Institute) {
                        const institute = profile.data.user.Institute;

                        if (institute.plan_id) {
                            // If we have a plan ID, use it!
                            // Also if we have Plan details directly, we can skip one API call, but let's stick to the flow
                            setPlanId(institute.plan_id);

                            // If plan is already in the include, use it
                            if (institute.Plan) {
                                setPlan(institute.Plan);
                                setLoading(false);
                                return; // Skip the rest
                            }
                        } else {
                            // No plan associated, go to pricing
                            navigate("/pricing");
                            return;
                        }
                    } else {
                        navigate("/login");
                        return;
                    }
                } catch (e) {
                    navigate("/login");
                    return;
                }
            }

            // If we still don't have a plan set (because we only had ID), fetch from list
            const response = await api.get("/plans");
            const currentPlanId = planId || (plan ? plan.id : null);

            if (currentPlanId) {
                const selectedPlan = response.data.data.find(p => p.id === parseInt(currentPlanId));
                if (selectedPlan) {
                    setPlan(selectedPlan);
                } else {
                    alert("Invalid Plan");
                    navigate("/pricing");
                }
            } else {
                navigate("/pricing");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handlePayment = async () => {
        setProcessing(true);
        try {
            // 1. Initiate Payment
            const initResponse = await api.post("/payment/initiate", {
                planId: plan.id,
                billingCycle
            });

            const { order, key } = initResponse.data;

            // 2. Open Razorpay (or Mock)
            const options = {
                key: key,
                amount: order.amount,
                currency: order.currency,
                name: "EduManage SaaS",
                description: `Subscription for ${plan.name}`,
                order_id: order.id,
                handler: async (response) => {
                    // 3. Verify Payment
                    try {
                        const verifyRes = await api.post("/payment/verify", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            planId: plan.id,
                            billingCycle
                        });

                        if (verifyRes.data.success) {
                            alert("Payment Successful! Redirecting to Dashboard...");
                            window.location.href = "/admin/dashboard";
                        }
                    } catch (verifyError) {
                        alert("Payment Verification Failed: " + verifyError.response?.data?.message);
                        setProcessing(false);
                    }
                },
                prefill: {
                    name: "Admin User",
                    email: "admin@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#4f46e5"
                }
            };

            // Check if mock flow or real Razorpay
            if (key === "rzp_test_mock") {
                // Simulate Razorpay Modal for Mock
                const confirmMock = window.confirm(`Mock Payment Gateway\n\nPay ₹${order.amount / 100} for ${plan.name}?\n\nClick OK to succeed, Cancel to fail.`);
                if (confirmMock) {
                    options.handler({
                        razorpay_order_id: order.id,
                        razorpay_payment_id: `pay_mock_${Date.now()}`,
                        razorpay_signature: "mock_signature"
                    });
                } else {
                    setProcessing(false);
                }
            } else {
                // Real Razorpay
                const rzp1 = new window.Razorpay(options);
                rzp1.open();
                rzp1.on('payment.failed', function (response) {
                    alert(response.error.description);
                    setProcessing(false);
                });
            }

        } catch (error) {
            console.error("Payment Error:", error);
            alert("Payment initiation failed: " + (error.response?.data?.message || error.message));
            setProcessing(false); // Reset processing state ONLY IF initiation fails. 
            // If modal opens, processing stays true until handler or failure.
        }
    };

    if (loading) return <div className="loading-state">Loading...</div>;
    if (!plan) return null;

    const price = billingCycle === 'yearly'
        ? Math.round(plan.price * 12 * 0.8)
        : plan.price;

    return (
        <div className="payment-page">
            <div className="container-small">
                <div className="payment-card">
                    <div className="payment-header">
                        <h2>Complete Your Subscription</h2>
                        <p>Secure payment for <strong>{plan.name}</strong></p>
                    </div>

                    <div className="billing-cycle-selector">
                        <label className={billingCycle === 'monthly' ? 'active' : ''}>
                            <input
                                type="radio"
                                name="billing"
                                value="monthly"
                                checked={billingCycle === 'monthly'}
                                onChange={() => setBillingCycle('monthly')}
                            />
                            Monthly (₹{plan.price}/mo)
                        </label>
                        <label className={billingCycle === 'yearly' ? 'active' : ''}>
                            <input
                                type="radio"
                                name="billing"
                                value="yearly"
                                checked={billingCycle === 'yearly'}
                                onChange={() => setBillingCycle('yearly')}
                            />
                            Yearly (Save 20%)
                        </label>
                    </div>

                    <div className="order-summary">
                        <div className="summary-row">
                            <span>Plan</span>
                            <span>{plan.name}</span>
                        </div>
                        <div className="summary-row">
                            <span>Billing Cycle</span>
                            <span>{billingCycle === 'yearly' ? 'Yearly' : 'Monthly'}</span>
                        </div>
                        <div className="summary-row total">
                            <span>Total Amount</span>
                            <span>₹{price}</span>
                        </div>
                    </div>

                    <button
                        className="btn-primary-large btn-block"
                        onClick={handlePayment}
                        disabled={processing}
                    >
                        {processing ? "Processing..." : `Pay ₹${price}`}
                    </button>

                    <div className="secure-badge">
                        🔒 Secured by Razorpay (Test Mode)
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PaymentPage;
