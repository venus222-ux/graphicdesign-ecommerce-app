import { Link } from "react-router-dom";
import { useWishlistStore } from "../store/useWishlistStore";
import { Trash2, HeartOff } from "lucide-react";
import styles from "../styles/Wishlist.module.css";

export default function Wishlist() {
  const items = useWishlistStore((s) => s.items);
  const removeFromWishlist = useWishlistStore((s) => s.removeFromWishlist);

  if (!items.length) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <HeartOff size={48} className="text-muted mb-3" />
          <h2 className="fw-bold">Your wishlist is empty</h2>
          <p className="text-muted">Save items you love to find them later.</p>
          <Link to="/products" className="btn btn-dark mt-3 px-4">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>My Wishlist</h2>

      <div className={styles.grid}>
        {items.map((product) => (
          <div key={product.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img
                src={product.preview_url}
                className={styles.image}
                alt={product.title}
              />
            </div>

            <div className={styles.content}>
              <h5 className={styles.productTitle}>{product.title}</h5>
              <p className={styles.price}>${product.price}</p>

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
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
