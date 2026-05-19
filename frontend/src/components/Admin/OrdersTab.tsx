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
  Tag,
  X,
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

// Declaring typing interface inline for strict tracking verification
export interface Product {
  id: number;
  title: string;
  short_description: string;
  description: string;
  price?: number;
  old_price?: number;
  final_price?: number;
  discount_percentage?: number | null;
  discount_fixed?: number | null;
  effective_discount_percentage?: number;
  discount_type?: "percent" | "fixed" | null;
  discount_value?: number | null;
  has_discount?: boolean;
  is_new?: boolean;
  asset_type: string;
  category_id: number;
  category?: { name: string } | null;
  is_published: boolean;
  slug: string;
  is_wishlisted?: boolean;
  preview_url?: string;
  preview_urls?: string[];
  previews?: Array<{ id: number; url: string; name: string; size?: number }>;
  asset_url?: string;
  asset?: {
    id: number;
    url: string;
    file_name: string;
    size: number;
    mime_type: string;
  } | null;
}

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

  // Re-computed analytics metrics to monitor cross-platform product discounts given
  const kpis = useMemo(() => {
    return orders.reduce(
      (acc, o) => {
        const total = Number(o.total || 0);
        const discount = Number(o.discount_total || 0);

        acc.totalOrders += 1;
        acc.revenue += total;
        acc.discounted += discount;
        acc.refunded += Number(o.refunded_total || 0);
        if (o.status === "pending") acc.pending += 1;

        return acc;
      },
      { totalOrders: 0, revenue: 0, discounted: 0, refunded: 0, pending: 0 },
    );
  }, [orders]);

  const statusChart = {
    labels: ["Paid", "Pending", "Refunded"],
    datasets: [
      {
        data: [
          orders.filter((o) => o.status === "paid").length,
          orders.filter((o) => o.status === "pending").length,
          orders.filter((o) => o.status === "refunded").length,
        ],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        hoverBackgroundColor: ["#059669", "#d97706", "#dc2626"],
        borderWidth: 0,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          boxWidth: 12,
          font: { family: "Inter", size: 12 },
          color: "#475569",
        },
      },
    },
    maintainAspectRatio: false,
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
            Manage your store's transactions, tracking analytics, and customer
            refunds.
          </p>
        </div>
        <button onClick={() => applyFilters(1)} className={styles.refreshBtn}>
          <RefreshCw size={15} /> Sync Data
        </button>
      </header>

      {/* Analytics Matrix Grid Metrics */}
      <div className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <label>Total Orders</label>
            <h3>{kpis.totalOrders}</h3>
          </div>
          <div className={`${styles.kpiIcon} ${styles.blueIcon}`}>
            <ShoppingCart size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <label>Net Revenue</label>
            <h3>
              $
              {kpis.revenue.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className={`${styles.kpiIcon} ${styles.greenIcon}`}>
            <TrendingUp size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <label>Discounts Given</label>
            <h3>
              $
              {kpis.discounted.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className={`${styles.kpiIcon} ${styles.purpleIcon}`}>
            <Tag size={20} />
          </div>
        </div>
        <div className={styles.kpiCard}>
          <div className={styles.kpiContent}>
            <label>Total Refunded</label>
            <h3>
              $
              {kpis.refunded.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className={`${styles.kpiIcon} ${styles.redIcon}`}>
            <RotateCcw size={20} />
          </div>
        </div>
      </div>

      <div className={styles.mainGrid}>
        <section className={styles.tableSection}>
          <div className={styles.filterBar}>
            <div className={styles.searchWrapper}>
              <Search className={styles.searchIcon} size={16} />
              <input
                type="text"
                placeholder="Search order ID, customers..."
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
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Pricing Breakdown</th>
                  <th>Status</th>
                  <th>Date Placed</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o: any) => {
                  const itemTotal = Number(o.total || 0);
                  const itemDiscount = Number(o.discount_total || 0);
                  const originalSubtotal = itemTotal + itemDiscount;

                  return (
                    <tr key={o.id}>
                      <td className={styles.orderId}>#{o.id}</td>
                      <td className={styles.customerName}>
                        {o.user?.name || "Guest User"}
                      </td>
                      <td>
                        <div className={styles.amountWrap}>
                          <div className={styles.priceRow}>
                            <span className={styles.totalAmount}>
                              ${itemTotal.toFixed(2)}
                            </span>
                            {itemDiscount > 0 && (
                              <span className={styles.slashedPrice}>
                                ${originalSubtotal.toFixed(2)}
                              </span>
                            )}
                          </div>
                          {itemDiscount > 0 && (
                            <span className={styles.discountBadge}>
                              <Tag size={10} /> Saved ${itemDiscount.toFixed(2)}
                            </span>
                          )}
                          {isPartiallyRefunded(o) && (
                            <span className={styles.refundInfo}>
                              Partial Refund (-$
                              {Number(o.refunded_total).toFixed(2)})
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={o.status} />
                      </td>
                      <td className={styles.dateCol}>
                        {new Date(o.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td>
                        <div className={styles.actionGroup}>
                          <button
                            className={styles.iconBtn}
                            onClick={() => openDetails(o)}
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            className={styles.iconBtn}
                            onClick={() => downloadInvoice(o.id)}
                            title="Download Invoice"
                          >
                            <FileText size={16} />
                          </button>
                          <button
                            className={`${styles.iconBtn} ${styles.refundActionBtn} ${!canRefund(o) ? styles.disabledBtn : ""}`}
                            onClick={() => openRefund(o)}
                            disabled={!canRefund(o)}
                            title="Issue Refund"
                          >
                            <RotateCcw size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <aside className={styles.sidebarSection}>
          <div className={styles.chartCard}>
            <h3>Order Distribution</h3>
            <div className={styles.pieWrapper}>
              <Pie data={statusChart} options={chartOptions} />
            </div>
          </div>
        </aside>
      </div>

      {/* MODAL WORKFLOW DETAIL VIEW */}
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
              <h3>Order Details Reference</h3>
              <button
                className={styles.closeActionBtn}
                onClick={() => setDetailsOpen(false)}
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailRow}>
                <label>Order Link ID</label>
                <span>#{selectedOrder.id}</span>
              </div>
              <div className={styles.detailRow}>
                <label>Fulfillment Status</label>
                <StatusBadge status={selectedOrder.status} />
              </div>

              <div className={styles.modalDivider} />

              <div className={styles.detailRow}>
                <label>Subtotal (Original Price)</label>
                <span>
                  $
                  {(
                    Number(selectedOrder.total || 0) +
                    Number(selectedOrder.discount_total || 0)
                  ).toFixed(2)}
                </span>
              </div>
              {Number(selectedOrder.discount_total || 0) > 0 && (
                <div
                  className={`${styles.detailRow} ${styles.modalDiscountText}`}
                >
                  <label>Campaign Deductions</label>
                  <span>
                    -${Number(selectedOrder.discount_total).toFixed(2)}
                  </span>
                </div>
              )}
              <div className={styles.detailRow}>
                <label>Final Paid Revenue</label>
                <strong className={styles.modalFinalPrice}>
                  ${Number(selectedOrder.total || 0).toFixed(2)}
                </strong>
              </div>
            </div>
            <div className={styles.modalFooter}>
              <button
                className={styles.downloadBtn}
                onClick={() => downloadInvoice(selectedOrder.id)}
              >
                <Download size={14} /> Export Document Invoice
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
