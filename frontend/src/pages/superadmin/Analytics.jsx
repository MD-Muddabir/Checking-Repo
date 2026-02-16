import { useEffect, useState } from "react";
import api from "../../services/api";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const Analytics = () => {
  const [data, setData] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      const res = await api.get("/superadmin/analytics");
      setData(res.data);
    };
    fetchAnalytics();
  }, []);

  if (!data) return <p>Loading...</p>;

  const revenueData = {
    labels: data.monthlyRevenue.map(r => `Month ${r.month}`),
    datasets: [
      {
        label: "Revenue",
        data: data.monthlyRevenue.map(r => r.totalRevenue)
      }
    ]
  };

  const statusData = {
    labels: ["Active", "Expired"],
    datasets: [
      {
        data: [data.instituteStatus.active, data.instituteStatus.expired]
      }
    ]
  };

  return (
    <div>
      <h2>Super Admin Analytics</h2>

      <div style={{ width: "600px" }}>
        <h3>Monthly Revenue</h3>
        <Bar data={revenueData} />
      </div>

      <div style={{ width: "400px", marginTop: "40px" }}>
        <h3>Institute Status</h3>
        <Pie data={statusData} />
      </div>
    </div>
  );
};

export default Analytics;
