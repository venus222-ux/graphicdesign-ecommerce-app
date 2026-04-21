import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import API from "../api";
import styles from "../styles/Checkout.module.css";

const Checkout = () => {
  const navigate = useNavigate();

  const { items, clearCart } = useCartStore();
  const [loading, setLoading] = useState(false);

  // SAFE TOTAL CALCULATION (no dependency on store method)
  const totalPrice = items.reduce(
    (acc, i) => acc + i.quantity * Number(i.price || 0),
    0,
  );

  const handleCheckout = async () => {
    if (items.length === 0) return;

    setLoading(true);

    try {
      await API.post("/checkout", {
        items: items.map((i) => ({
          product_id: i.id,
          quantity: i.quantity,
        })),
      });

      clearCart();

      alert("✅ Order placed successfully!");

      // 🔥 redirect to success or home
      navigate("/shop");
    } catch (err) {
      console.error(err);
      alert("❌ Checkout failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container py-5 text-center">
        <h3>Your cart is empty 🥲</h3>
        <button
          onClick={() => navigate("/shop")}
          className="btn btn-primary mt-3"
        >
          Go Shopping
        </button>
      </div>
    );
  }

  return (
    <div className={styles.checkoutContainer}>
      <div className={styles.layout}>
        {/* LEFT SIDE */}
        <section>
          <h2 className={styles.sectionTitle}>💳 Checkout</h2>

          <button
            onClick={handleCheckout}
            className={styles.payBtn}
            disabled={loading}
          >
            {loading ? "Processing..." : `Pay $${totalPrice.toFixed(2)}`}
          </button>
        </section>

        {/* RIGHT SIDE */}
        <aside className={styles.orderPreview}>
          <h4 className="mb-4">Review Order</h4>

          <div className={styles.miniItemList}>
            {items.map((item) => (
              <div key={item.id} className={styles.miniItem}>
                <div className="d-flex align-items-center">
                  <div className={styles.qtyBadge}>{item.quantity}</div>

                  <div className="ms-3">
                    <p className="mb-0 fw-bold">{item.title}</p>
                    <small className="text-muted">
                      {item.category?.name || "General"}
                    </small>
                  </div>
                </div>

                <span className="fw-semibold">
                  ${(item.quantity * Number(item.price || 0)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-top">
            <div className="d-flex justify-content-between mb-2">
              <span>Subtotal</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>

            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
