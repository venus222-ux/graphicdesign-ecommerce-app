import { useEffect, useState } from "react";
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
  X,
  Info,
} from "lucide-react";
import styles from "../../styles/OrdersTab.module.css";

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

  // Filter States
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [perPage, setPerPage] = useState(20);

  const applyFilters = (page = 1) => {
    fetchOrders(page, {
      search,
      status: status === "all" ? "" : status,
      start_date: startDate,
      end_date: endDate,
      per_page: perPage,
    });
  };

  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setStartDate("");
    setEndDate("");
    setPerPage(20);
    fetchOrders(1, { per_page: 20 });
  };

  // Initial load + Refunds
  useEffect(() => {
    applyFilters(1);
    fetchRefunds();
  }, []);

  // Auto-apply filters with debounce for search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters(1);
    }, 600);

    return () => clearTimeout(timeoutId);
  }, [search, status, startDate, endDate, perPage]);

  const openDetails = async (order: any) => {
    setSelectedOrder(order);
    setDetailsOpen(true);

    try {
      await fetchOrderById(order.id);
    } catch (err) {
      console.error("Error fetching order details:", err);
    }
  };

  const openRefund = (order: any) => {
    setSelectedOrder(order);
    setRefundOpen(true);
  };

  const StatusBadge = ({ status }: { status: string }) => {
    const config: any = {
      paid: { icon: CheckCircle, class: styles.statusPaid },
      refunded: { icon: RotateCcw, class: styles.statusRefunded },
      pending: { icon: Clock, class: styles.statusPending },
    };

    const current = config[status?.toLowerCase()] || {
      icon: AlertCircle,
      class: styles.statusDefault,
    };

    const Icon = current.icon;

    return (
      <span className={`${styles.badge} ${current.class}`}>
        <Icon size={14} strokeWidth={2.5} /> {status}
      </span>
    );
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>Orders Management</h2>
          <p className={styles.subtitle}>
            Track transactions and manage customer refunds.
          </p>
        </div>

        <button onClick={() => applyFilters(1)} className={styles.refreshBtn}>
          <RefreshCw size={16} /> Refresh
        </button>
      </header>

      {/* FILTERS BAR */}
      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          {/* Search */}
          <div className={styles.searchBox}>
            <input
              type="text"
              placeholder="Search by order # or customer name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="refunded">Refunded</option>
          </select>

          {/* Date Range */}
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.dateInput}
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={styles.dateInput}
          />

          {/* Per Page */}
          <select
            value={perPage}
            onChange={(e) => setPerPage(Number(e.target.value))}
            className={styles.select}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
            <option value={100}>100 per page</option>
          </select>
        </div>

        <button onClick={resetFilters} className={styles.resetBtn}>
          <X size={16} /> Reset Filters
        </button>
      </div>

      {/* TABLE */}
      <div className={styles.tableCard}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th className={styles.textRight}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o: any) => {
              const refundedTotal = Number(o.refunded_total || 0);
              const total = Number(o.total || 0);

              const isFullyRefunded = refundedTotal >= total;
              const isRefunded =
                refundedTotal > 0 || o.status?.toLowerCase() === "refunded";

              const isRefundDisabled = isRefunded || isFullyRefunded;

              return (
                <tr key={o.id} className={styles.tableRow}>
                  <td>
                    <span className={styles.orderId}>#{o.id}</span>
                  </td>

                  <td>
                    <div className={styles.customerInfo}>
                      <span className={styles.name}>
                        {o.user?.name || "Guest"}
                      </span>
                      <span className={styles.email}>
                        {o.user?.email || "No email"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <div className={styles.amountGroup}>
                      <span
                        className={
                          isFullyRefunded ? styles.strikethrough : styles.total
                        }
                      >
                        ${total.toFixed(2)}
                      </span>

                      {refundedTotal > 0 && (
                        <span className={styles.refundedAmount}>
                          Refunded: ${refundedTotal.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </td>

                  <td>
                    <StatusBadge status={o.status} />
                  </td>

                  <td className={styles.dateCell}>
                    {new Date(o.created_at).toLocaleDateString()}
                  </td>

                  <td>
                    <div className={styles.actionGroup}>
                      <button
                        onClick={() => openDetails(o)}
                        className={styles.iconBtn}
                        title="View Details"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() => downloadInvoice(o.id)}
                        className={styles.iconBtn}
                        title="Download Invoice"
                      >
                        <FileText size={18} />
                      </button>

                      <button
                        onClick={() => openRefund(o)}
                        disabled={isRefundDisabled}
                        className={`${styles.iconBtn} ${
                          isRefundDisabled
                            ? styles.disabledBtn
                            : styles.refundAction
                        }`}
                        title={
                          isRefundDisabled
                            ? "Refund already processed"
                            : "Process Refund"
                        }
                      >
                        <RotateCcw size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* DETAILS MODAL */}
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
              <h3>Order Details #{selectedOrder.id}</h3>
              <button
                className={styles.closeBtn}
                onClick={() => setDetailsOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.statsGrid}>
                <div className={styles.statBox}>
                  <label>Status</label>
                  <StatusBadge status={selectedOrder.status} />
                </div>

                <div className={styles.statBox}>
                  <label>Net Total</label>
                  <p className={styles.statPrice}>
                    $
                    {(
                      Number(selectedOrder.total) -
                      Number(selectedOrder.refunded_total || 0)
                    ).toFixed(2)}
                  </p>
                </div>

                <div className={styles.statBox}>
                  <label>Original Total</label>
                  <p className={styles.statSubText}>
                    ${Number(selectedOrder.total).toFixed(2)}
                  </p>
                </div>
              </div>

              {Number(selectedOrder.refunded_total) > 0 && (
                <div className={styles.refundAlert}>
                  <Info size={16} />
                  <span>
                    This order has been refunded{" "}
                    <strong>
                      ${Number(selectedOrder.refunded_total).toFixed(2)}
                    </strong>
                  </span>
                </div>
              )}
            </div>

            <div className={styles.modalFooter}>
              <button
                className={styles.downloadBtn}
                onClick={() => downloadInvoice(selectedOrder.id)}
              >
                <Download size={16} /> Export PDF
              </button>

              <button
                className={styles.closeActionBtn}
                onClick={() => setDetailsOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {refundOpen && selectedOrder && (
        <RefundModal
          isOpen={refundOpen}
          onClose={() => setRefundOpen(false)}
          orderId={selectedOrder.id}
          maxAmount={
            Number(selectedOrder.total || 0) -
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
