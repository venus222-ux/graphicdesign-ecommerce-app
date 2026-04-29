import { useEffect, useState } from "react";
import API from "../api";
import styles from "../styles/Success.module.css";

const Success = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  const [order, setOrder] = useState<any>(null);

  const downloadProduct = async (id: number) => {
    try {
      const res = await API.get(`/products/${id}/download`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.download = `product-${id}`;
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

        // 🚀 AUTO DOWNLOAD FIRST PRODUCT (SAFE)
        const firstProductId = res.data.order?.items?.[0]?.product_id;

        if (firstProductId) {
          downloadProduct(firstProductId);
        }
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {status === "loading" && <p>Verifying your payment...</p>}

        {status === "success" && (
          <>
            <div className={styles.iconWrapper}>✅</div>
            <h1 className={styles.title}>Payment Confirmed!</h1>
            <p className={styles.message}>
              Thank you for your purchase. Your download will start
              automatically.
            </p>

            <a href="/" className={styles.button}>
              Return Home
            </a>

            {order?.items?.length > 0 && (
              <button
                className={styles.button}
                onClick={() => downloadProduct(order.items[0].product_id)}
              >
                Download Again
              </button>
            )}
          </>
        )}

        {status === "error" && (
          <>
            <div className={styles.iconWrapper}>⚠️</div>
            <h1 className={styles.title}>Verification Issue</h1>
            <p className={styles.message}>
              We couldn't verify your payment. Please contact support.
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Success;
