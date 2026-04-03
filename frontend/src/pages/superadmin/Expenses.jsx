import { useState, useEffect } from "react";
import ThemeSelector from "../../components/ThemeSelector";
import api from "../../services/api";
import "../admin/Dashboard.css"; // Reuse dashboard UI
import "../../components/common/Buttons.css";
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function SuperAdminExpenses() {
    const [loading, setLoading] = useState(true);
    const [expenses, setExpenses] = useState([]);
    const [stats, setStats] = useState({
        totalExpense: 0,
        totalIncome: 0,
        profitLoss: 0,
        burnRate: 0
    });
    const [chartDataState, setChartDataState] = useState(null);
    const [filterPeriod, setFilterPeriod] = useState("current_month");
    const [filterDateValue, setFilterDateValue] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        category: "Hosting",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        description: ""
    });

    useEffect(() => {
        const delayBounceFn = setTimeout(() => {
            fetchExpensesData();
        }, 300);
        return () => clearTimeout(delayBounceFn);
    }, [filterPeriod, filterDateValue]);

    const fetchExpensesData = async () => {
        try {
            setLoading(true);
            let query = `?period=${filterPeriod}`;
            if (filterDateValue) {
                query += `&dateValue=${filterDateValue}`;
            }

            const [statsRes, expensesRes] = await Promise.all([
                api.get(`/expenses/stats${query}`),
                api.get(`/expenses${query}`)
            ]);

            if (statsRes.data.success) {
                setStats(statsRes.data.stats);
                if (statsRes.data.chartData) {
                    const sortedData = statsRes.data.chartData;
                    setChartDataState({
                        labels: sortedData.map(d => d.month),
                        datasets: [
                            {
                                label: 'Income (₹)',
                                data: sortedData.map(d => d.income),
                                borderColor: '#10b981',
                                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                fill: true,
                                tension: 0.4
                            },
                            {
                                label: 'Expenses (₹)',
                                data: sortedData.map(d => d.expense),
                                borderColor: '#ef4444',
                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                fill: true,
                                tension: 0.4
                            }
                        ]
                    });
                }
            }
            if (expensesRes.data.success) {
                setExpenses(expensesRes.data.expenses);
            }
        } catch (error) {
            console.error("Error fetching expenses data:", error);
            alert("Failed to fetch expenses data.");
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post("/expenses", formData);
            if (res.data.success) {
                alert("Expense added successfully!");
                setShowAddModal(false);
                setFormData({
                    title: "",
                    category: "Hosting",
                    amount: "",
                    date: new Date().toISOString().split('T')[0],
                    description: ""
                });
                fetchExpensesData();
            }
        } catch (error) {
            console.error("Error adding expense:", error);
            alert("Failed to add expense.");
        }
    };

    const handleDeleteExpense = async (id) => {
        if (!window.confirm("Are you sure you want to delete this expense?")) return;
        try {
            const res = await api.delete(`/expenses/${id}`);
            if (res.data.success) {
                alert("Expense deleted!");
                fetchExpensesData();
            }
        } catch (error) {
            console.error("Error deleting expense:", error);
            alert("Failed to delete expense.");
        }
    };

    if (loading) {
        return <div className="dashboard-container">Loading Finances...</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>💸 Super Admin Finances (Transport)</h1>
                    <p>Track monthly expenses, income, burn rate and profit/loss</p>
                </div>
                <div className="dashboard-header-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <ThemeSelector />
                    <button className="animated-btn primary" onClick={() => setShowAddModal(true)}>
                        <span className="icon">➕</span> Add Expense
                    </button>
                    <button className="animated-btn secondary" onClick={() => window.location.href = "/superadmin/dashboard"}>
                        <span className="icon icon-back">←</span> Back to Dashboard
                    </button>
                </div>
            </div>

            {/* Filter Section */}
            <div className="filter-container" style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                marginBottom: '1.5rem',
                padding: '1rem',
                borderRadius: '12px',
                backgroundColor: 'var(--card-bg, rgba(255, 255, 255, 0.05))',
                border: '1px solid var(--border-color, rgba(255, 255, 255, 0.1))',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '1.2rem' }}>📅</span>
                    <strong style={{ color: 'var(--text-primary)', marginLeft: '4px' }}>Filter Timeline:</strong>
                </div>
                <select
                    className="form-select"
                    style={{ padding: '0.6rem 1rem', minWidth: '180px', margin: 0, borderRadius: '8px', border: '1px solid var(--border-color)' }}
                    value={filterPeriod}
                    onChange={(e) => {
                        setFilterPeriod(e.target.value);
                        setFilterDateValue("");
                    }}
                >
                    <option value="current_month">Current Month</option>
                    <option value="month">Specific Month</option>
                    <option value="year">Specific Year</option>
                    <option value="all">All Time</option>
                </select>
                {filterPeriod === 'month' && (
                    <input
                        type="month"
                        className="form-input"
                        style={{ padding: '0.6rem 1rem', margin: 0, borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        value={filterDateValue}
                        onChange={(e) => setFilterDateValue(e.target.value)}
                    />
                )}
                {filterPeriod === 'year' && (
                    <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 2026"
                        style={{ padding: '0.6rem 1rem', width: '150px', margin: 0, borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        value={filterDateValue}
                        onChange={(e) => setFilterDateValue(e.target.value)}
                    />
                )}
            </div>

            {/* Statistics Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: "rgba(16, 185, 129, 0.1)", color: "#10b981" }}>💵</div>
                    <div className="stat-content">
                        <h3>₹{stats.totalIncome?.toLocaleString() || 0}</h3>
                        <p>Monthly Income</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)", color: "#ef4444" }}>🔥</div>
                    <div className="stat-content">
                        <h3>₹{stats.totalExpense?.toLocaleString() || 0}</h3>
                        <p>Total Expenses (Burn Rate)</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon" style={{ backgroundColor: stats.profitLoss >= 0 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)", color: stats.profitLoss >= 0 ? "#10b981" : "#ef4444" }}>📈</div>
                    <div className="stat-content">
                        <h3>₹{stats.profitLoss?.toLocaleString() || 0}</h3>
                        <p>Profit / Loss</p>
                    </div>
                </div>
            </div>

            {/* Chart Section */}
            {chartDataState && (
                <div className="card" style={{ marginTop: "2rem", padding: "1.5rem" }}>
                    <h3 style={{ marginBottom: "1rem" }}>6-Month Financial Overview</h3>
                    <div style={{ height: "300px", width: "100%" }}>
                        <Line
                            data={chartDataState}
                            options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { position: 'top' }
                                },
                                scales: {
                                    y: { beginAtZero: true }
                                }
                            }}
                        />
                    </div>
                </div>
            )}

            {/* Add Expense Modal */}
            {showAddModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Add New Expense</h2>
                        <form onSubmit={handleAddExpense} className="form-grid">
                            <div className="form-group">
                                <label>Title</label>
                                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required placeholder="e.g. Domain Renewal" />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select name="category" value={formData.category} onChange={handleInputChange}>
                                    <option value="Hosting">Hosting</option>
                                    <option value="Domain">Domain</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Software">Software</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Amount (₹)</label>
                                <input type="number" name="amount" value={formData.amount} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
                            </div>
                            <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                                <label>Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} rows="3"></textarea>
                            </div>
                            <div className="form-actions" style={{ gridColumn: "1 / -1" }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Expense</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Expenses List */}
            <div className="card" style={{ marginTop: "2rem" }}>
                <div className="card-header">
                    <h3 className="card-title">Recent Expenses</h3>
                </div>
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.length === 0 ? (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                                        No expenses recorded yet.
                                    </td>
                                </tr>
                            ) : (
                                expenses.map((exp) => (
                                    <tr key={exp.id}>
                                        <td>{new Date(exp.date).toLocaleDateString()}</td>
                                        <td>
                                            <strong>{exp.title}</strong>
                                            {exp.description && <div style={{ fontSize: "0.85rem", color: "#666" }}>{exp.description}</div>}
                                        </td>
                                        <td>
                                            <span className="badge badge-primary">{exp.category}</span>
                                        </td>
                                        <td style={{ color: "#ef4444", fontWeight: "bold" }}>
                                            -₹{parseFloat(exp.amount).toLocaleString()}
                                        </td>
                                        <td>
                                            <button className="btn btn-sm btn-danger" onClick={() => handleDeleteExpense(exp.id)}>
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default SuperAdminExpenses;
