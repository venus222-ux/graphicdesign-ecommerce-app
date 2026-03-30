import React, { useMemo } from "react";
import { Bar, Pie } from "react-chartjs-2";
import styles from "../../pages/AdminDashboard.module.css";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
);

interface Product {
  id: number;
  is_published: boolean;
  category?: { name: string };
  // add other fields as necessary
}

interface DashboardChartsProps {
  products: Product[];
}

const DashboardCharts: React.FC<DashboardChartsProps> = ({ products }) => {
  const stats = useMemo(() => {
    const published = products.filter((p) => p.is_published).length;
    const draft = products.length - published;

    const catCounts: Record<string, number> = {};
    products.forEach((p) => {
      const name = p.category?.name || "Uncategorized";
      catCounts[name] = (catCounts[name] || 0) + 1;
    });

    return { published, draft, catCounts };
  }, [products]);

  const barChartData = {
    labels: Object.keys(stats.catCounts),
    datasets: [
      {
        label: "Products per Category",
        data: Object.values(stats.catCounts),
        backgroundColor: "rgba(99, 102, 241, 0.6)",
        borderColor: "rgba(99, 102, 241, 1)",
        borderWidth: 1,
        borderRadius: 5,
      },
    ],
  };

  const pieChartData = {
    labels: ["Active", "Draft"],
    datasets: [
      {
        data: [stats.published, stats.draft],
        backgroundColor: ["rgba(34, 197, 94, 0.6)", "rgba(249, 115, 22, 0.6)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(249, 115, 22, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" as const },
    },
  };

  return (
    <div className={styles.chartsGrid}>
      <div className={styles.glassCard}>
        <div className={styles.cardHeader}>
          <h3>Category Distribution</h3>
        </div>
        <div style={{ height: "300px" }}>
          <Bar data={barChartData} options={chartOptions} />
        </div>
      </div>

      <div className={styles.glassCard}>
        <div className={styles.cardHeader}>
          <h3>Publishing Status</h3>
        </div>
        <div style={{ height: "300px" }}>
          <Pie data={pieChartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
