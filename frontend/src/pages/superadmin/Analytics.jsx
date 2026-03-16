/**
 * Super Admin - Analytics
 * Phase 2: Added Managers to User Demographics chart
 */

import { useState, useEffect } from "react";
import api from "../../services/api";
import { Doughnut, Pie, Bar } from "react-chartjs-2";
import {
    Chart as ChartJS, ArcElement, Tooltip, Legend, Title,
    CategoryScale, LinearScale, BarElement
} from "chart.js";
import BackButton from "../../components/common/BackButton";
import ThemeSelector from "../../components/ThemeSelector";
import "../admin/Dashboard.css";

ChartJS.register(ArcElement, Tooltip, Legend, Title, CategoryScale, LinearScale, BarElement);

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function Analytics() {
    const [stats, setStats] = useState(null);
    const [dashStats, setDashStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [analyticsRes, dashRes] = await Promise.all([
                    api.get("/superadmin/analytics"),
                    api.get("/superadmin/dashboard")
                ]);
                setStats(analyticsRes.data);
                setDashStats(dashRes.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading || !stats || !dashStats) {
        return (
            <div className="dashboard-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
                <p style={{ color: 'var(--text-secondary)' }}>Loading analytics...</p>
            </div>
        );
    }

    const ud = stats.userDemographics || {};

    // Chart: Institute Status (Active / Expired / Suspended)
    const instituteStatusData = {
        labels: ["Active", "Expired", "Suspended"],
        datasets: [{
            data: [
                stats.instituteStatus?.active || 0,
                stats.instituteStatus?.expired || 0,
                stats.instituteStatus?.suspended || 0
            ],
            backgroundColor: ["#10b981", "#ef4444", "#f59e0b"],
            borderWidth: 0
        }]
    };

    // Chart: User Demographics (Students / Faculty / Managers / Parents / Admins)
    const usersData = {
        labels: ["Students", "Faculty", "Managers", "Parents", "Admins"],
        datasets: [{
            data: [
                ud.students || 0,
                ud.faculty || 0,
                ud.managers || 0,
                ud.parents || 0,
                ud.admins || 0
            ],
            backgroundColor: ["#3b82f6", "#8b5cf6", "#14b8a6", "#f97316", "#ec4899"],
            borderWidth: 0
        }]
    };

    // Chart: Monthly Revenue
    const monthlyLabels = (stats.monthlyRevenue || []).map(r => MONTH_NAMES[(r.month || r.dataValues?.month || 1) - 1] || "");
    const monthlyValues = (stats.monthlyRevenue || []).map(r => parseFloat(r.totalRevenue || r.dataValues?.totalRevenue || 0));

    const monthlyRevenueData = {
        labels: monthlyLabels.length > 0 ? monthlyLabels : ["No Data"],
        datasets: [{
            label: "Revenue (₹)",
            data: monthlyValues.length > 0 ? monthlyValues : [0],
            backgroundColor: "rgba(99,102,241,0.7)",
            borderColor: "#6366f1",
            borderWidth: 2,
            borderRadius: 8
        }]
    };

    const overviewStats = [
        { icon: '🏢', label: 'Total Institutes', value: dashStats.totalInstitutes },
        { icon: '👨‍🎓', label: 'Total Students', value: ud.students || 0 },
        { icon: '👩‍🏫', label: 'Total Faculty', value: ud.faculty || 0 },
        { icon: '🧑‍💼', label: 'Total Managers', value: ud.managers || 0 },
        { icon: '👪', label: 'Total Parents', value: ud.parents || 0 },
        { icon: '💰', label: 'Total Revenue', value: `₹${Number(dashStats.totalRevenue || 0).toLocaleString('en-IN')}` },
        { icon: '🎉', label: 'Platform Discounts', value: `₹${Number(dashStats.totalDiscount || 0).toLocaleString('en-IN')}` }
    ];

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <div>
                    <h1>📈 Platform Analytics</h1>
                    <p>Usage statistics and growth metrics</p>
                </div>
                <div className="dashboard-header-right">
                    <ThemeSelector />
                    <BackButton />
                </div>
            </div>

            {/* Overview Cards */}
            <div className="stats-grid" style={{ marginBottom: "2rem" }}>
                {overviewStats.map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-content">
                            <h3>{s.value}</h3>
                            <p>{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row 1 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <div className="card" style={{ padding: "1.5rem" }}>
                    <h3 className="card-title">Institute Health</h3>
                    <div style={{ height: "280px", display: "flex", justifyContent: "center" }}>
                        <Pie
                            data={instituteStatusData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: "bottom" },
                                    title: { display: true, text: "Active / Expired / Suspended" }
                                }
                            }}
                        />
                    </div>
                </div>

                <div className="card" style={{ padding: "1.5rem" }}>
                    <h3 className="card-title">User Demographics</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        Students · Faculty · Managers · Parents · Admins
                    </p>
                    <div style={{ height: "280px", display: "flex", justifyContent: "center" }}>
                        <Doughnut
                            data={usersData}
                            options={{
                                responsive: true,
                                plugins: {
                                    legend: { position: "bottom" },
                                    title: { display: true, text: "Platform User Distribution" }
                                }
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Monthly Revenue Bar Chart */}
            <div className="card" style={{ padding: "1.5rem" }}>
                <h3 className="card-title">Monthly Revenue</h3>
                <div style={{ height: "280px" }}>
                    <Bar
                        data={monthlyRevenueData}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                                legend: { display: false },
                                title: { display: true, text: "Revenue by Month (₹)" }
                            },
                            scales: {
                                y: {
                                    beginAtZero: true,
                                    ticks: { callback: v => `₹${v.toLocaleString()}` }
                                }
                            }
                        }}
                    />
                </div>
            </div>

            {/* User Demographics Breakdown Table */}
            <div className="card" style={{ padding: "1.5rem", marginTop: '2rem' }}>
                <h3 className="card-title">User Breakdown</h3>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Role</th>
                            <th>Count</th>
                            <th>% of Total Users</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[
                            { role: '👨‍🎓 Students', count: ud.students || 0, color: '#3b82f6' },
                            { role: '👩‍🏫 Faculty', count: ud.faculty || 0, color: '#8b5cf6' },
                            { role: '🧑‍💼 Managers', count: ud.managers || 0, color: '#14b8a6' },
                            { role: '👪 Parents', count: ud.parents || 0, color: '#f97316' },
                            { role: '🛡️ Admins', count: ud.admins || 0, color: '#ec4899' },
                        ].map(row => {
                            const total = (ud.students || 0) + (ud.faculty || 0) + (ud.managers || 0) + (ud.parents || 0) + (ud.admins || 0);
                            const pct = total > 0 ? ((row.count / total) * 100).toFixed(1) : '0.0';
                            return (
                                <tr key={row.role}>
                                    <td style={{ fontWeight: 600 }}>{row.role}</td>
                                    <td><span style={{ fontWeight: 700, color: row.color }}>{row.count}</span></td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{ flex: 1, background: 'var(--border-color)', borderRadius: '20px', height: '8px', overflow: 'hidden' }}>
                                                <div style={{ width: `${pct}%`, height: '100%', background: row.color, borderRadius: '20px', transition: 'width 0.8s ease' }} />
                                            </div>
                                            <span style={{ minWidth: '42px', fontSize: '13px', fontWeight: 600 }}>{pct}%</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Analytics;
