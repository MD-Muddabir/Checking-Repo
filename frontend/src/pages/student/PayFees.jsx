import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";
import { AuthContext } from "../../context/AuthContext";
import BackButton from "../../components/common/BackButton";
import "../admin/Dashboard.css";
import jsPDF from "jspdf";
import { useRazorpayPayment } from "../../hooks/useRazorpayPayment";

function PayFees() {
    const { user } = useContext(AuthContext);
    const [feeStructures, setFeeStructures] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedFee, setSelectedFee] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [error, setError] = useState("");
    const [studentId, setStudentId] = useState(null);
    const [totalPaid, setTotalPaid] = useState(0);
    const [isTestMode, setIsTestMode] = useState(true);

    const { initializePayment, isPaymentLoading, paymentError, setPaymentError } = useRazorpayPayment();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // First get the student profile
            const meRes = await api.get('/students/me');
            const myStudentId = meRes.data.data.id;
            setStudentId(myStudentId);

            // Fetch Fee Structures applicable to the student's classes
            const structuresRes = await api.get('/fees/structure');
            const structures = structuresRes.data.data;
            setFeeStructures(structures);

            // Fetch Student's own payments
            const paymentRes = await api.get(`/fees/payment/${myStudentId}`);
            setPayments(paymentRes.data.data.payments);
            setTotalPaid(paymentRes.data.data.total_paid);

        } catch (err) {
            console.error(err);
            setError("Failed to load fee information.");
        } finally {
            setLoading(false);
        }
    };

    const handlePayClick = (fee) => {
        const balance = Math.max(0, (parseFloat(fee.amount) || 0) - (fee.paid_amount || 0));
        setSelectedFee(fee);
        setPaymentAmount(balance.toFixed(2)); // Default to balance amount
        setShowModal(true);
        setPaymentError?.(null);
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        try {
            // 1. Create Order on Backend
            const orderRes = await api.post("/payment/fees/create-order", {
                student_fee_id: selectedFee.id,
                amount: parseFloat(paymentAmount),
                testMode: isTestMode
            });

            const { order, key } = orderRes.data;

            if (key === "rzp_test_mock") {
                // Mock verification flow
                const confirmMock = window.confirm(`Mock Payment Gateway\n\nPay ₹${order.amount / 100}?\n\nClick OK to succeed, Cancel to fail.`);
                if (confirmMock) {
                    try {
                        await api.post("/payment/fees/verify", {
                            razorpay_order_id: order.id,
                            razorpay_payment_id: `pay_mock_${Date.now()}`,
                            razorpay_signature: "mock_signature",
                            student_fee_id: selectedFee.id,
                            amount: parseFloat(paymentAmount)
                        });

                        alert("Payment Successful!");
                        setShowModal(false);
                        setPaymentAmount("");
                        setSelectedFee(null);
                        fetchData();
                    } catch (verifyErr) {
                        alert(verifyErr.response?.data?.message || "Payment Verification Failed.");
                    }
                }
                return;
            }

            // 2. Initialize Razorpay Checkout
            initializePayment({
                orderConfig: {
                    key: key,
                    amount: order.amount,
                    currency: order.currency,
                    order_id: order.id,
                },
                userConfig: {
                    name: user.name,
                    email: user.email,
                    contact: user.phone || ""
                },
                onSuccess: async (paymentData) => {
                    try {
                        // 3. Verify Payment
                        await api.post("/payment/fees/verify", {
                            razorpay_order_id: paymentData.razorpay_order_id,
                            razorpay_payment_id: paymentData.razorpay_payment_id,
                            razorpay_signature: paymentData.razorpay_signature,
                            student_fee_id: selectedFee.id,
                            amount: parseFloat(paymentAmount)
                        });

                        alert("Payment Successful!");
                        setShowModal(false);
                        setPaymentAmount("");
                        setSelectedFee(null);
                        fetchData();
                    } catch (verifyErr) {
                        alert(verifyErr.response?.data?.message || "Payment Verification Failed.");
                    }
                },
                onFailure: (errDesc) => {
                    alert(`Payment Failed: ${errDesc}`);
                }
            });

        } catch (err) {
            alert(err.response?.data?.message || "Could not initiate payment.");
        }
    };

    const generateReceipt = (payment) => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.text("Fee Payment Receipt", 105, 20, null, null, "center");

        doc.setFontSize(12);
        doc.text(`Transaction ID: ${payment.transaction_id}`, 20, 40);
        doc.text(`Date: ${new Date(payment.payment_date).toLocaleDateString()}`, 20, 50);
        doc.text(`Payment Method: ${payment.payment_method}`, 20, 60);
        doc.text(`Amount Paid: $${parseFloat(payment.amount_paid).toFixed(2)}`, 20, 70);
        doc.text(`Status: ${payment.status}`, 20, 80);

        doc.save(`Receipt_${payment.transaction_id}.pdf`);
    };

    if (loading) return <div className="dashboard-container">Loading...</div>;

    const safeTotalPaid = feeStructures.reduce((sum, fee) => sum + (fee.paid_amount || 0), 0);
    const totalRequired = feeStructures.reduce((sum, fee) => sum + (parseFloat(fee.amount) || 0), 0);
    const balanceDue = totalRequired - safeTotalPaid;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1>💳 Pay Fees</h1>
                    <p>View your fee structures and make online payments</p>
                </div>
                <BackButton to="/student/dashboard" />
            </div>

            {error && <div style={{ color: "red", padding: "10px", marginBottom: "1rem", backgroundColor: "#ffebeb", borderRadius: "5px" }}>{error}</div>}

            <div className="stats-grid" style={{ marginBottom: "2rem" }}>
                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <h3>${totalRequired.toFixed(2)}</h3>
                        <p>Total Fees Assigned</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>${safeTotalPaid.toFixed(2)}</h3>
                        <p>Total Paid</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">⚠️</div>
                    <div className="stat-content">
                        <h3 style={{ color: balanceDue > 0 ? "red" : "green" }}>
                            ${Math.max(0, balanceDue).toFixed(2)}
                        </h3>
                        <p>Balance Due</p>
                    </div>
                </div>
            </div>

            <div className="card" style={{ marginBottom: "2rem" }}>
                <div className="card-header">
                    <h3 className="card-title">Pending Fee Structures</h3>
                </div>
                <div className="table-container">
                    <table className="table mobile-keep">
                        <thead>
                            <tr>
                                <th>Fee Type</th>
                                <th>Description</th>
                                <th>Due Date</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {feeStructures.length === 0 ? (
                                <tr>
                                    <td colSpan="6" style={{ textAlign: "center", padding: "2rem" }}>
                                        No fees assigned to your classes yet.
                                    </td>
                                </tr>
                            ) : (
                                feeStructures.map((fee) => {
                                    const feeAmount = parseFloat(fee.amount) || 0;
                                    const paidAmount = fee.paid_amount || 0;
                                    const balance = Math.max(0, feeAmount - paidAmount);
                                    const isPaidOff = balance <= 0;

                                    return (
                                        <tr key={fee.id}>
                                            <td>
                                                <strong>{fee.fee_type}</strong>
                                                <br />
                                                <small style={{ color: "#6b7280" }}>
                                                    {fee.Subject ? `Subject: ${fee.Subject.name}` : "Full Course / General"}
                                                </small>
                                                {fee.is_enrolled && <><br /><span className="badge badge-success" style={{ fontSize: "0.7rem" }}>Enrolled</span></>}
                                            </td>
                                            <td>{fee.description || "-"}</td>
                                            <td>{new Date(fee.due_date).toLocaleDateString()}</td>
                                            <td>
                                                Total: ${feeAmount.toFixed(2)}<br />
                                                <small style={{ color: "gray" }}>Paid: ${paidAmount.toFixed(2)}</small><br />
                                                <strong style={{ color: balance > 0 ? "red" : "green" }}>Due: ${balance.toFixed(2)}</strong>
                                            </td>
                                            <td>
                                                <span className={`badge ${isPaidOff ? 'badge-success' : paidAmount > 0 ? 'badge-warning' : 'badge-secondary'}`}>
                                                    {isPaidOff ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Assigned'}
                                                </span>
                                            </td>
                                            <td>
                                                {isPaidOff ? (
                                                    <span style={{ color: "green", fontWeight: "bold" }}>✓ Fully Paid</span>
                                                ) : (
                                                    <button
                                                        onClick={() => handlePayClick(fee)}
                                                        className="btn btn-sm btn-primary"
                                                    >
                                                        Pay Now
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="card">
                <div className="card-header">
                    <h3 className="card-title">Payment History</h3>
                </div>
                <div className="table-container">
                    <table className="table mobile-keep">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Date</th>
                                <th>Method</th>
                                <th>Amount Paid</th>
                                <th>Status</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                                        No payment history found.
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td>
                                            <span className="badge badge-secondary">{payment.transaction_id}</span>
                                        </td>
                                        <td>{new Date(payment.payment_date).toLocaleDateString()}</td>
                                        <td>{payment.payment_method}</td>
                                        <td><strong>${parseFloat(payment.amount_paid).toFixed(2)}</strong></td>
                                        <td>
                                            <span className={`badge ${payment.status === 'success' ? 'badge-success' : 'badge-danger'}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td>
                                            {payment.status === 'success' && (
                                                <button
                                                    onClick={() => generateReceipt(payment)}
                                                    className="btn btn-sm btn-secondary"
                                                    style={{ backgroundColor: "#4f46e5", color: "white" }}
                                                >
                                                    ⬇ Receipt
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Payment Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
                        <div className="modal-header">
                            <h3>💳 Secure Checkout</h3>
                            <button onClick={() => setShowModal(false)} className="btn btn-sm">×</button>
                        </div>
                        <div className="modal-body">
                            {paymentError && (
                                <div style={{ color: "red", padding: "10px", marginBottom: "1rem", backgroundColor: "#ffebeb", borderRadius: "5px" }}>
                                    {paymentError}
                                </div>
                            )}
                            <form onSubmit={handlePaymentSubmit}>
                                <div className="form-group">
                                    <label className="form-label">Fee Details</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={selectedFee?.fee_type || ""}
                                        disabled
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Amount (INR) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="form-input"
                                        value={paymentAmount}
                                        onChange={e => setPaymentAmount(e.target.value)}
                                        required
                                        min="1"
                                    />
                                </div>
                                <div className="payment-mode-toggle" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '15px', marginBottom: '15px' }}>
                                    <span style={{ fontWeight: isTestMode ? '600' : '400', color: isTestMode ? 'var(--primary-color, #3f51b5)' : '#666' }}>Test Mode</span>
                                    <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '26px' }}>
                                        <input 
                                            type="checkbox" 
                                            checked={!isTestMode} 
                                            onChange={(e) => setIsTestMode(!e.target.checked)} 
                                            style={{ opacity: 0, width: 0, height: 0, margin: 0, padding: 0 }}
                                        />
                                        <span style={{
                                            position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0,
                                            backgroundColor: isTestMode ? '#ccc' : 'var(--primary-color, #3f51b5)', transition: '.3s', borderRadius: '34px'
                                        }}>
                                            <span style={{
                                                position: 'absolute', height: '20px', width: '20px', left: '3px', bottom: '3px',
                                                backgroundColor: 'white', transition: '.3s', borderRadius: '50%',
                                                transform: isTestMode ? 'translateX(0)' : 'translateX(24px)',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}></span>
                                        </span>
                                    </label>
                                    <span style={{ fontWeight: !isTestMode ? '600' : '400', color: !isTestMode ? 'var(--primary-color, #3f51b5)' : '#666' }}>Real Mode</span>
                                </div>
                                
                                <div className="modal-footer" style={{ marginTop: "20px" }}>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary" disabled={isPaymentLoading}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary" style={{ backgroundColor: "#10b981", borderColor: "#10b981" }} disabled={isPaymentLoading}>
                                        {isPaymentLoading ? "Processing..." : `Pay ₹${paymentAmount || 0}`}
                                    </button>
                                </div>
                                <div className="secure-badge" style={{ marginTop: '16px', textAlign: 'center', fontSize: '12px', color: '#666', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px' }}>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                    Secured by Razorpay ({isTestMode ? 'Test Mode' : 'Live Mode'})
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PayFees;
