import React, { useMemo } from "react";
import { Line, Doughnut } from "react-chartjs-2";
import styles from "../../styles/AdminDashboard.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface DashboardChartsProps {
  stats: any;
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ stats }) => {
  if (!stats) return <p>Loading charts...</p>;

  // Format Line Chart Data (Revenue & Orders)
  const lineChartData = useMemo(() => {
    const labels = stats.charts.sales.map((s: any) => s.date);
    const revenue = stats.charts.sales.map((s: any) => s.revenue);
    const orders = stats.charts.sales.map((s: any) => s.orders);

    return {
      labels,
      datasets: [
        {
          label: "Revenue ($)",
          data: revenue,
          borderColor: "rgba(99, 102, 241, 1)",
          backgroundColor: "rgba(99, 102, 241, 0.2)",
          yAxisID: "y",
          tension: 0.3,
          fill: true,
        },
        {
          label: "Orders",
          data: orders,
          borderColor: "rgba(34, 197, 94, 1)",
          backgroundColor: "rgba(34, 197, 94, 0.2)",
          yAxisID: "y1",
          tension: 0.3,
        },
      ],
    };
  }, [stats]);

  // Format Doughnut Chart Data (Traffic Sources)
  const trafficChartData = useMemo(() => {
    const labels = stats.charts.traffic.map((t: any) => t.source);
    const data = stats.charts.traffic.map((t: any) => t.value);

    return {
      labels,
      datasets: [
        {
          data,
          backgroundColor: [
            "#ef4444", // Google
            "#3b82f6", // Facebook
            "#10b981", // Direct
            "#000000", // TikTok
          ],
          borderWidth: 0,
        },
      ],
    };
  }, [stats]);

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    scales: {
      y: { type: "linear" as const, display: true, position: "left" as const },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: { drawOnChartArea: false },
      },
    },
  };

  return (
    <div
      className={styles.chartsGrid}
      style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}
    >
      {/* REVENUE & ORDERS OVER TIME */}
      <div className={styles.glassCard} style={{ padding: "20px" }}>
        <h3 style={{ marginBottom: "16px" }}>Sales & Orders (Last 30 Days)</h3>
        <div style={{ height: "300px" }}>
          <Line data={lineChartData} options={lineOptions} />
        </div>
      </div>

      {/* TRAFFIC SOURCES */}
      <div className={styles.glassCard} style={{ padding: "20px" }}>
        <h3 style={{ marginBottom: "16px" }}>Traffic Sources</h3>
        <div
          style={{ height: "300px", display: "flex", justifyContent: "center" }}
        >
          <Doughnut
            data={trafficChartData}
            options={{
              maintainAspectRatio: false,
              plugins: { legend: { position: "bottom" } },
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
