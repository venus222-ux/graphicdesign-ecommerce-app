import { Link } from "react-router-dom";
import { useWishlistStore } from "../store/useWishlistStore";
import { Trash2, HeartOff, Tag } from "lucide-react";
import styles from "../styles/Wishlist.module.css";

export default function Wishlist() {
  const items = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);

  if (!items.length) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <HeartOff size={64} className="text-muted mb-4" />
          <h2 className="fw-bold">Your wishlist is empty</h2>
          <p className="text-muted mb-4">Save your favorite products here</p>
          <Link to="/products" className={styles.browseBtn}>
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          My Wishlist <span className={styles.count}>({items.length})</span>
        </h2>
        <p className="text-muted">Saved products you love</p>
      </div>

      <div className={styles.grid}>
        {items.map((product) => {
          const finalPrice = Number(product.final_price ?? product.price ?? 0);
          const oldPrice = Number(product.old_price || product.price || 0);

          // 💡 Dynamic Calculation: Prevents structural backend logic errors / 0% bugs
          const actualDiscountPercentage = (() => {
            if (oldPrice <= 0 || finalPrice >= oldPrice) return 0;
            return Math.round(((oldPrice - finalPrice) / oldPrice) * 100);
          })();

          // Confirm a real layout discount sequence is structurally valid
          const hasDiscount =
            product.has_discount && actualDiscountPercentage > 0;

          return (
            <div key={product.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                {hasDiscount && (
                  <div className={styles.discountBadge}>
                    <Tag size={16} />-{actualDiscountPercentage}%
                  </div>
                )}

                <img
                  src={
                    product.preview_url ||
                    product.preview_urls?.[0] ||
                    "/placeholder.png"
                  }
                  className={styles.image}
                  alt={product.title}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
              </div>

              <div className={styles.content}>
                <h5 className={styles.productTitle}>{product.title}</h5>
                <p className={styles.category}>
                  {product.category?.name || "Digital Asset"}
                </p>

                {/* Price Section */}
                <div className={styles.priceContainer}>
                  <span className={styles.finalPrice}>
                    ${finalPrice.toFixed(2)}
                  </span>
                  {hasDiscount && (
                    <span className={styles.oldPrice}>
                      ${oldPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <div className={styles.actions}>
                  <Link
                    to={`/products/${product.slug}`}
                    className={styles.viewBtn}
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() => removeFromWishlist(product.id)}
                    className={styles.removeBtn}
                    title="Remove from wishlist"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
