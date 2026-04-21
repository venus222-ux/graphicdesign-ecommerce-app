import { useCartStore } from "../store/useCartStore";
import { Link } from "react-router-dom";
import styles from "../styles/Cart.module.css";

const Cart = () => {
  const { items, removeFromCart, increaseQty, decreaseQty } = useCartStore();

  // SAFE CALCULATIONS (no store dependency bugs)
  const totalItems = items.reduce((acc, i) => acc + i.quantity, 0);

  const totalPrice = items.reduce(
    (acc, i) => acc + i.quantity * Number(i.price || 0),
    0,
  );

  if (!items || items.length === 0) {
    return (
      <div className={styles.emptyCart}>
        <div className="text-center py-5">
          <span style={{ fontSize: "4rem" }}>🛒</span>
          <h3 className="mt-3">Your cart is empty</h3>
          <p className="text-muted">
            Looks like you haven't added anything yet.
          </p>
          <Link to="/shop" className="btn btn-primary px-4 mt-2">
            Go Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h2 className="mb-4 fw-bold">Shopping Cart</h2>

      <div className={styles.cartGrid}>
        {/* LEFT SIDE */}
        <div className={styles.itemList}>
          {items.map((item) => {
            const image = Array.isArray(item.preview_urls)
              ? item.preview_urls[0]
              : item.preview_urls;

            const subtotal = item.quantity * Number(item.price || 0);

            return (
              <div key={item.id} className={styles.itemCard}>
                <img
                  src={image || "/placeholder.png"}
                  alt={item.title}
                  className={styles.productImg}
                />

                <div className={styles.itemDetails}>
                  <h5 className={styles.itemTitle}>{item.title}</h5>
                  <p className={styles.itemCategory}>
                    {item.category?.name || "General"}
                  </p>

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remove
                  </button>
                </div>

                <div className={styles.qtyControls}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => decreaseQty(item.id)}
                  >
                    -
                  </button>

                  <span className={styles.qtyValue}>{item.quantity}</span>

                  <button
                    className={styles.qtyBtn}
                    onClick={() => increaseQty(item.id)}
                  >
                    +
                  </button>
                </div>

                <div className={styles.priceTag}>
                  <strong>${subtotal.toFixed(2)}</strong>
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT SIDE */}
        <aside className={styles.summaryCard}>
          <h4 className="mb-4">Order Summary</h4>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span className="text-muted">Shipping</span>
            <span className="text-success">Free</span>
          </div>

          <hr />

          <div className="d-flex justify-content-between mb-4">
            <span className="fw-bold">Total</span>
            <span className="fw-bold">${totalPrice.toFixed(2)}</span>
          </div>

          <Link to="/checkout" className={styles.checkoutBtn}>
            Checkout Now
          </Link>

          <Link to="/shop" className="btn btn-link w-100 mt-2 text-muted">
            ← Continue Shopping
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
