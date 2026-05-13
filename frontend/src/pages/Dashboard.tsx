import { useEffect, useState } from "react";
import { Download, FileText, Package, CalendarDays } from "lucide-react";
import API from "../api";
import styles from "../styles/Dashboard.module.css";

const Dashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (id: number, type: "invoice" | "product") => {
    const loaderKey = `${type}-${id}`;
    setDownloading(loaderKey);

    try {
      const urlPath =
        type === "invoice"
          ? `/orders/${id}/invoice`
          : `/products/${id}/download`;

      const res = await API.get(urlPath, {
        responseType: "blob",
      });

      const disposition = res.headers["content-disposition"];
      let filename =
        type === "invoice" ? `invoice-${id}.pdf` : `product-${id}.zip`;

      const match = disposition?.match(/filename="(.+)"/);
      if (match) filename = match[1];

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(`${type} download failed`, err);
    } finally {
      setDownloading(null);
    }
  };

  useEffect(() => {
    API.get("/orders")
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p>Loading your account...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Account Dashboard</h1>
          <p>Manage your orders, invoices, and digital downloads</p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={64} strokeWidth={1} />
          <h3>No orders found</h3>
          <p>
            You haven't placed any orders yet. Once you do, they will appear
            here.
          </p>
        </div>
      ) : (
        <div className={styles.orderGrid}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              {/* CARD HEADER */}
              <div className={styles.orderHeader}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>
                    INVOICE #{order.invoice_number || order.id}
                  </span>
                  <span className={styles.orderDate}>
                    <CalendarDays size={14} />
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <span
                  className={`${styles.statusPill} ${styles[order.status?.toLowerCase()]}`}
                >
                  {order.status}
                </span>
              </div>

              {/* CARD BODY */}
              <div className={styles.orderBody}>
                {/* Column 1: Price */}
                <div className={styles.priceSection}>
                  <span className={styles.sectionLabel}>Total Paid</span>
                  <p className={styles.totalPrice}>
                    ${Number(order.total).toFixed(2)}
                  </p>
                </div>

                {/* Column 2: Billing Info */}
                <div className={styles.billingBox}>
                  <span className={styles.sectionLabel}>Billing Details</span>
                  <div className={styles.billingInfo}>
                    {order.billing_company && (
                      <strong>{order.billing_company}</strong>
                    )}
                    <span>{order.billing_name}</span>
                    <span>{order.billing_address_1}</span>
                    <span>
                      {order.billing_city}, {order.billing_postal_code}
                    </span>
                    {order.billing_vat_number && (
                      <span className={styles.vatTag}>
                        VAT: {order.billing_vat_number}
                      </span>
                    )}
                  </div>
                </div>

                {/* Column 3: Items & Downloads */}
                <div className={styles.itemsSection}>
                  <span className={styles.sectionLabel}>Your Products</span>
                  <div className={styles.itemList}>
                    {order.items?.map((item: any) => (
                      <div key={item.id} className={styles.itemRow}>
                        <span className={styles.itemTitle}>
                          {item.product?.title || "Digital Product"}
                        </span>
                        <button
                          className={styles.downloadBtn}
                          disabled={
                            downloading === `product-${item.product_id}`
                          }
                          onClick={() =>
                            handleDownload(item.product_id, "product")
                          }
                        >
                          <Download size={14} />
                          {downloading === `product-${item.product_id}`
                            ? "..."
                            : "Download"}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* CARD FOOTER */}
              <div className={styles.orderFooter}>
                <button
                  className={styles.secondaryBtn}
                  disabled={downloading === `invoice-${order.id}`}
                  onClick={() => handleDownload(order.id, "invoice")}
                >
                  <FileText size={16} />
                  {downloading === `invoice-${order.id}`
                    ? "Generating..."
                    : "Get PDF Invoice"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
