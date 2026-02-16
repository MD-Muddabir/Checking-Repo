

//                                              Example of Super Admin Dashboard Component

import { useEffect, useState } from "react";
import api from "../../services/api";

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    const fetchStats = async () => {
      const res = await api.get("/superadmin/dashboard");
      setStats(res.data);
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h2>Super Admin Dashboard</h2>
      <p>Total Institutes: {stats.totalInstitutes}</p>
      <p>Active Institutes: {stats.activeInstitutes}</p>
      <p>Expired Institutes: {stats.expiredInstitutes}</p>
      <p>Total Revenue: ₹{stats.totalRevenue}</p>
    </div>
  );
};

export default SuperAdminDashboard;
