import { useEffect, useState, useMemo } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import RefundModal from "./RefundModal";
import {
  RotateCcw,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  RefreshCw,
  Download,
  Search,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";

import styles from "../../styles/OrdersTab.module.css";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement,
  Tooltip,
  Legend,
);

const isFullyRefunded = (o: any) =>
  Number(o.refunded_total || 0) >= Number(o.total);
const isPartiallyRefunded = (o: any) =>
  Number(o.refunded_total || 0) > 0 &&
  Number(o.refunded_total || 0) < Number(o.total);
const canRefund = (o: any) => !isFullyRefunded(o);

const OrdersTab = () => {
  const {
    orders,
    fetchOrders,
    fetchRefunds,
    downloadInvoice,
    selectedOrder,
    setSelectedOrder,
    fetchOrderById,
  } = useAdminStore();

  const [refundOpen, setRefundOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const applyFilters = (page = 1) => {
    fetchOrders(page, {
      search,
      status: status === "all" ? "" : status,
      per_page: 20,
    });
  };

  useEffect(() => {
    applyFilters(1);
    fetchRefunds();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => applyFilters(1), 500);
    return () => clearTimeout(t);
  }, [search, status]);

  const openDetails = async (order: any) => {
    setSelectedOrder(order);
    setDetailsOpen(true);
    await fetchOrderById(order.id);
  };

  const openRefund = (order: any) => {
    setSelectedOrder(order);
    setRefundOpen(true);
  };

  const kpis = useMemo(
    () => ({
      totalOrders: orders.length,
      revenue: orders.reduce((s, o) => s + Number(o.total), 0),
      refunded: orders.reduce((s, o) => s + Number(o.refunded_total || 0), 0),
      pending: orders.filter((o) => o.status === "pending").length,
    }),
    [orders],
  );

  const statusChart = {
    labels: ["Paid", "Pending", "Refunded"],
    datasets: [
      {
        data: [
          orders.filter((o) => o.status === "paid").length,
          orders.filter((o) => o.status === "pending").length,
          orders.filter((o) => o.status === "refunded").length,
        ],
        backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
        borderWidth: 0,
      },
    ],
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const map: any = {
      paid: { icon: CheckCircle, class: styles.statusPaid },
      refunded: { icon: RotateCcw, class: styles.statusRefunded },
      pending: { icon: Clock, class: styles.statusPending },
    };
    const c = map[status?.toLowerCase()] || {
      icon: AlertCircle,
      class: styles.statusDefault,
    };
    const Icon = c.icon;
    return (
      <span className={`${styles.badge} ${c.class}`}>
        <Icon size={12} /> {status}
      </span>
    );
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Orders Overview</h1>
          <p className={styles.subtitle}>
            Manage your store's transactions and customer refunds.
          </p>
        </div>
        <button onClick={() => applyFilters(1)} className={styles.refreshBtn}>
          <RefreshCw size={16} /> Sync Data
        </button>
      </header>

      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.blueIcon}`}>
            <ShoppingCart size={24} />
          </div>
          <div>
            <label>Total Orders</label>
            <h3>{kpis.totalOrders}</h3>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.greenIcon}`}>
            <TrendingUp size={24} />
          </div>
          <div>
            <label>Revenue</label>
            <h3>${kpis.revenue.toLocaleString()}</h3>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.redIcon}`}>
            <RotateCcw size={24} />
          </div>
          <div>
            <label>Refunded</label>
            <h3>${kpis.refunded.toLocaleString()}</h3>
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={`${styles.kpiIcon} ${styles.yellowIcon}`}>
            <Clock size={24} />
          </div>
          <div>
            <label>Pending</label>
            <h3>{kpis.pending}</h3>
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <section>
          <div className={styles.filterBar}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={18} />
              <input
                type="text"
                placeholder="Search by ID or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              className={styles.select}
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div className={styles.tableCard}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => (
                  <tr key={o.id}>
                    <td className={styles.orderId}>#{o.id}</td>
                    <td>{o.user?.name || "Guest"}</td>
                    <td>
                      <div className={styles.amountWrap}>
                        <span className={styles.totalAmount}>${o.total}</span>
                        {isPartiallyRefunded(o) && (
                          <span className={styles.refundInfo}>
                            Partially Refunded
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <StatusBadge status={o.status} />
                    </td>
                    <td>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <div className={styles.actionGroup}>
                        <button
                          className={styles.iconBtn}
                          onClick={() => openDetails(o)}
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          className={styles.iconBtn}
                          onClick={() => downloadInvoice(o.id)}
                          title="Download Invoice"
                        >
                          <FileText size={18} />
                        </button>
                        <button
                          className={`${styles.iconBtn} ${!canRefund(o) ? styles.disabledBtn : ""}`}
                          onClick={() => openRefund(o)}
                          disabled={!canRefund(o)}
                        >
                          <RotateCcw size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside>
          <div className={styles.chartCard}>
            <h3>Distribution</h3>
            <div className={styles.pieWrapper}>
              <Pie
                data={statusChart}
                options={{ plugins: { legend: { position: "bottom" } } }}
              />
            </div>
          </div>
        </aside>
      </div>

      {detailsOpen && selectedOrder && (
        <div
          className={styles.modalOverlay}
          onClick={() => setDetailsOpen(false)}
        >
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <h3>Order Details</h3>
              <button
                className={styles.closeActionBtn}
                onClick={() => setDetailsOpen(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <label>Order ID</label>
                <span>#{selectedOrder.id}</span>
              </div>
              <div className={styles.detailRow}>
                <label>Status</label>
                <StatusBadge status={selectedOrder.status} />
              </div>
              <div className={styles.detailRow}>
                <label>Total Amount</label>
                <strong>${selectedOrder.total}</strong>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.downloadBtn}
                onClick={() => downloadInvoice(selectedOrder.id)}
              >
                <Download size={16} /> Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {refundOpen && selectedOrder && (
        <RefundModal
          isOpen={refundOpen}
          onClose={() => setRefundOpen(false)}
          orderId={selectedOrder.id}
          maxAmount={
            Number(selectedOrder.total) -
            Number(selectedOrder.refunded_total || 0)
          }
          onSuccess={() => {
            applyFilters(1);
            fetchRefunds();
          }}
        />
      )}
    </div>
  );
};

export default OrdersTab;
