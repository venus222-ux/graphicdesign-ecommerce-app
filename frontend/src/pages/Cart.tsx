import { useMemo } from "react";
import { useCartStore } from "../store/useCartStore";
import { Link, useNavigate } from "react-router-dom";
import styles from "../styles/Cart.module.css";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Tag,
  ShieldCheck,
  Percent,
} from "lucide-react";

const VAT_RATE = 0.21;

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, increaseQty, decreaseQty } = useCartStore();

  // 📊 CALCULATE COMPREHENSIVE SUB-TOTALS & ASSET MARKDOWNS
  const {
    totalItems,
    totalOriginalSubtotal,
    totalFinalSubtotal,
    totalDiscountSaved,
  } = useMemo(() => {
    return items.reduce(
      (acc, item) => {
        const qty = item.quantity || 1;
        const originalPrice = Number(item.price || 0);

        // Resolve markdown structures seamlessly
        const unitPrice =
          item.has_discount && item.final_price !== undefined
            ? Number(item.final_price)
            : originalPrice;

        acc.totalItems += qty;
        acc.totalOriginalSubtotal += qty * originalPrice;
        acc.totalFinalSubtotal += qty * unitPrice;
        acc.totalDiscountSaved += qty * (originalPrice - unitPrice);
        return acc;
      },
      {
        totalItems: 0,
        totalOriginalSubtotal: 0,
        totalFinalSubtotal: 0,
        totalDiscountSaved: 0,
      },
    );
  }, [items]);

  const vat = totalFinalSubtotal * VAT_RATE;
  const totalPrice = totalFinalSubtotal + vat;

  if (!items || items.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.emptyContent}>
          <div className={styles.emptyIconWrapper}>
            <ShoppingBag size={36} />
          </div>
          <h3 className="fw-bold mt-4">Your cart is empty</h3>
          <p className="text-secondary mb-4">
            Looks like you haven't assigned any digital assets to this checkout
            session yet.
          </p>
          <button
            onClick={() => navigate("/shop")}
            className={styles.returnShopBtn}
          >
            Explore Digital Shop
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.cartContainer}>
      <h1 className={styles.sectionTitle}>Shopping Cart Workspace</h1>

      <div className={styles.cartGrid}>
        {/* LEFT COLUMN: ITEM MANIFEST */}
        <div className={styles.itemList}>
          {items.map((item) => {
            const image = Array.isArray(item.preview_urls)
              ? item.preview_urls[0]
              : item.preview_url || item.preview_urls;

            const isDiscounted = !!item.has_discount;
            const originalPrice = Number(item.price || 0);
            const unitPrice =
              isDiscounted && item.final_price !== undefined
                ? Number(item.final_price)
                : originalPrice;

            // 💡 Dynamic Calculation: Prevents structural backend logic errors/0% bugs
            const actualDiscountPercentage = useMemo(() => {
              if (originalPrice <= 0 || unitPrice >= originalPrice) return 0;
              return Math.round(
                ((originalPrice - unitPrice) / originalPrice) * 100,
              );
            }, [originalPrice, unitPrice]);

            return (
              <div key={item.id} className={styles.itemCard}>
                <img
                  src={image || "/placeholder.png"}
                  alt={item.title}
                  className={styles.productImg}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />

                <div className={styles.itemDetails}>
                  <div>
                    <h5 className={styles.itemTitle}>{item.title}</h5>
                    <p className={styles.itemCategory}>
                      {item.category?.name || "Digital Asset"}
                    </p>
                  </div>

                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.id)}
                  >
                    <Trash2 size={14} /> <span>Remove</span>
                  </button>
                </div>

                <div className={styles.qtyContainer}>
                  <div className={styles.qtyControls}>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => decreaseQty(item.id)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus size={12} />
                    </button>
                    <span className={styles.qtyValue}>{item.quantity}</span>
                    <button
                      className={styles.qtyBtn}
                      onClick={() => increaseQty(item.id)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                </div>

                <div className={styles.priceTag}>
                  <span className={styles.calculatedPrice}>
                    ${(item.quantity * unitPrice).toFixed(2)}
                  </span>

                  {isDiscounted && originalPrice > unitPrice && (
                    <div className={styles.discountMetadata}>
                      <span className={styles.itemOldPrice}>
                        ${(item.quantity * originalPrice).toFixed(2)}
                      </span>
                      {/* Only render badge if calculation outputs a mathematically real markdown */}
                      {actualDiscountPercentage > 0 && (
                        <span className={styles.discountBadge}>
                          <Percent size={10} /> {actualDiscountPercentage}% Off
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* RIGHT COLUMN: DISCOUNTS-AWARE SUMMARY LEDGER */}
        <aside className={styles.summaryCard}>
          <h4 className={styles.summaryTitle}>Operational Manifest</h4>

          <div className={styles.summaryTotals}>
            <div className={styles.totalLine}>
              <span>Allocated Line Items</span>
              <span className="fw-semibold text-dark">{totalItems}</span>
            </div>

            <div className={styles.totalLine}>
              <span>Gross Base Subtotal</span>
              <span>${totalOriginalSubtotal.toFixed(2)}</span>
            </div>

            {totalDiscountSaved > 0 && (
              <div className={`${styles.totalLine} ${styles.discountLine}`}>
                <span className="d-flex align-items-center gap-1">
                  <Tag size={13} /> Applied Markdowns
                </span>
                <span>-${totalDiscountSaved.toFixed(2)}</span>
              </div>
            )}

            <div className={styles.totalLine}>
              <span>VAT Jurisdiction (21%)</span>
              <span>${vat.toFixed(2)}</span>
            </div>

            <div className={`${styles.totalLine} ${styles.grandTotal}`}>
              <span>Total Price</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            className={styles.checkoutBtn}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={16} />
          </button>

          <Link to="/shop" className={styles.continueShoppingLink}>
            ← Continue Exploration
          </Link>

          <div className={styles.secureNote}>
            <ShieldCheck size={14} className="text-success" />
            <span>Secure Enterprise SSL Transaction Ecosystem</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
