import { useEffect, useState } from "react";
import { Download, FileText, Package } from "lucide-react";
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
      const res = await API.get(urlPath, { responseType: "blob" });

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

  if (loading)
    return <div className={styles.loader}>Loading your account...</div>;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div>
          <h1>Account Dashboard</h1>
          <p>Manage your orders and digital downloads</p>
        </div>
      </header>

      {orders.length === 0 ? (
        <div className={styles.emptyState}>
          <Package size={48} />
          <p>You haven't placed any orders yet.</p>
        </div>
      ) : (
        <div className={styles.orderGrid}>
          {orders.map((order) => (
            <div key={order.id} className={styles.orderCard}>
              <div className={styles.orderHeader}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>Order #{order.id}</span>
                  <span className={styles.orderDate}>
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <span
                  className={`${styles.statusPill} ${styles[order.status.toLowerCase()]}`}
                >
                  {order.status}
                </span>
              </div>

              <div className={styles.orderBody}>
                <div className={styles.priceSection}>
                  <label>Total Amount</label>
                  <p className={styles.totalPrice}>${order.total}</p>
                </div>

                <div className={styles.itemsSection}>
                  <label>Purchased Items</label>
                  <div className={styles.itemList}>
                    {order.items?.map((item: any) => (
                      <div key={item.id} className={styles.itemRow}>
                        <span>{item.product?.title || "Digital Product"}</span>
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

              <div className={styles.orderFooter}>
                <button
                  className={styles.secondaryBtn}
                  disabled={downloading === `invoice-${order.id}`}
                  onClick={() => handleDownload(order.id, "invoice")}
                >
                  <FileText size={16} />
                  {downloading === `invoice-${order.id}`
                    ? "Processing..."
                    : "View Invoice"}
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
