import { useEffect, useState } from "react";
import API from "../api";
import styles from "./Success.module.css";

const Success = () => {
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get(
      "session_id",
    );

    if (!sessionId) {
      setStatus("error");
      return;
    }

    API.get(`/orders/verify?session_id=${sessionId}`)
      .then(() => setStatus("success"))
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
              Thank you for your purchase. Your order is being processed.
            </p>
            <a href="/" className={styles.button}>
              Return Home
            </a>
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
