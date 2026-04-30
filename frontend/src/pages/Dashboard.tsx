import { useEffect, useState } from "react";
import API from "../api";
import styles from "../styles/Dashboard.module.css";

const Dashboard = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const downloadInvoice = async (id: number) => {
    try {
      const res = await API.get(`/orders/${id}/invoice`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      // 🔥 Extract filename from headers (if backend sends it)
      const disposition = res.headers["content-disposition"];
      let filename = `invoice-${id}.pdf`;

      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      link.href = url;
      link.download = filename; // ✅ dynamic filename
      document.body.appendChild(link); // safer for some browsers
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Invoice download failed", err);
    }
  };
  const downloadProduct = async (id: number) => {
    try {
      const res = await API.get(`/products/${id}/download`, {
        responseType: "blob",
      });

      // 👉 Extract filename from headers
      const disposition = res.headers["content-disposition"];

      let filename = `product-${id}.zip`;

      if (disposition) {
        const match = disposition.match(/filename="(.+)"/);
        if (match) filename = match[1];
      }

      // 👉 Create download
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.download = filename; // use extracted filename
      link.click();

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Product download failed", err);
    }
  };

  useEffect(() => {
    API.get("/orders")
      .then((res) => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>My Dashboard</h1>
      </header>

      {loading ? (
        <p>Loading orders...</p>
      ) : orders.length === 0 ? (
        <p>No orders found.</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <h3>Order #{order.id}</h3>
              <span className={styles.statusPill}>{order.status}</span>
            </div>

            <p>
              <strong>Total:</strong> ${order.total}
            </p>

            <div className={styles.btnGroup}>
              <button
                className={styles.button}
                onClick={() => downloadInvoice(order.id)}
              >
                View Invoice
              </button>

              {order.items?.map((item: any) => (
                <button
                  key={item.id}
                  className={styles.button}
                  onClick={() => downloadProduct(item.product_id)}
                >
                  Download {item.product?.title || "Product"}
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Dashboard;
