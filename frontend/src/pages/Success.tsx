import { useEffect, useState } from "react";
import API from "../api";
import styles from "../styles/Success.module.css";
import { useCartStore } from "../store/useCartStore";
import {
  CheckCircle,
  Download,
  Home,
  AlertCircle,
  Loader2,
} from "lucide-react"; // install lucide-react

const Success = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [order, setOrder] = useState<any>(null);
  const clearCart = useCartStore((state) => state.clearCart);

  const downloadProduct = async (id: number, fileName: string) => {
    try {
      const res = await API.get(`/products/${id}/download`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName || `product-${id}.zip`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed", err);
    }
  };

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );
    if (!sessionId) {
      setStatus("error");
      return;
    }

    API.get(`/orders/verify?session_id=${sessionId}`)
      .then((res) => {
        setOrder(res.data.order);
        setStatus("success");
        clearCart();

        // Auto-download first item
        if (res.data.order?.items?.[0]) {
          downloadProduct(
            res.data.order.items[0].product_id,
            res.data.order.items[0].name,
          );
        }
      })
      .catch((err) => {
        if (err.response?.status === 202) {
          setTimeout(() => window.location.reload(), 3000);
          return;
        }
        setStatus("error");
      });
  }, [clearCart]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === "loading" && (
          <div className={styles.stateWrapper}>
            <Loader2 className={styles.spinner} size={48} />
            <h2>Verifying Payment</h2>
            <p>Just a moment while we confirm your transaction...</p>
          </div>
        )}

        {status === "success" && (
          <>
            <div className={styles.iconSuccess}>
              <CheckCircle size={64} strokeWidth={1.5} />
            </div>
            <h1 className={styles.title}>Order Confirmed!</h1>
            <p className={styles.message}>
              Your files are ready. The download should start automatically.
            </p>

            <div className={styles.orderSummary}>
              <p className={styles.orderId}>Order ID: #{order?.id}</p>
              {order?.items?.map((item: any) => (
                <div key={item.product_id} className={styles.itemRow}>
                  <span>{item.name || "Digital Product"}</span>
                  <button
                    onClick={() => downloadProduct(item.product_id, item.name)}
                    className={styles.miniDownload}
                  >
                    <Download size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className={styles.actions}>
              <a href="/" className={styles.primaryBtn}>
                <Home size={18} /> Back to Store
              </a>
            </div>
          </>
        )}

        {status === "error" && (
          <div className={styles.stateWrapper}>
            <AlertCircle className={styles.errorIcon} size={64} />
            <h1 className={styles.title}>Something went wrong</h1>
            <p className={styles.message}>
              We couldn't verify your session. If you were charged, please check
              your email for a receipt or contact support.
            </p>
            <a href="/" className={styles.secondaryBtn}>
              Return Home
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Success;
