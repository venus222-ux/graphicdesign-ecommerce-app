import { Link } from "react-router-dom";
import styles from "../../styles/ProductCard.module.css";
import { Product } from "../../types";
import WishlistButton from "./WishlistButton";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const previewUrl = product?.preview_urls?.[0] || product?.preview_url || null;

  // COMPREHENSIVE DISCOUNT CALCULATION
  const hasDiscount = !!product.has_discount;
  const finalPrice = product.final_price ?? product.price ?? 0;
  const originalPrice = product.price ?? 0;

  // Determine label details based on discount mechanism type
  let discountLabel = "";
  if (hasDiscount) {
    if (product.discount_percentage && product.discount_percentage > 0) {
      discountLabel = `-${product.discount_percentage}%`;
    } else if (product.discount_fixed && product.discount_fixed > 0) {
      discountLabel = `-$${Number(product.discount_fixed).toFixed(0)}`;
    } else if (
      product.effective_discount_percentage &&
      product.effective_discount_percentage > 0
    ) {
      discountLabel = `-${product.effective_discount_percentage}%`;
    } else {
      discountLabel = "SALE";
    }
  }

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={product.title}
            className={styles.productImg}
            loading="lazy"
          />
        ) : (
          <div className={styles.noPreview}>
            <span>📷 No Preview Provided</span>
          </div>
        )}

        {/* FLOATING ACTION BADGES */}
        <div className={styles.badgeCluster}>
          {hasDiscount && (
            <div className={`${styles.badge} ${styles.discountBadge}`}>
              {discountLabel}
            </div>
          )}
          {product.is_new && (
            <div className={`${styles.badge} ${styles.newBadge}`}>NEW</div>
          )}
        </div>

        {/* INTERACTIVE ACTIONS HOVER OVERLAY */}
        <div className={styles.overlay}>
          <Link to={`/products/${product.slug}`} className={styles.quickView}>
            Quick View
          </Link>
        </div>
      </div>

      {/* METADATA CONTENT PROFILE CONTAINER */}
      <div className={styles.cardBody}>
        {product.category?.name && (
          <span className={styles.categoryTag}>{product.category.name}</span>
        )}
        <h5 className={styles.productTitle} title={product.title}>
          {product.title}
        </h5>
      </div>

      {/* FOOTER METRICS GRID */}
      <div className={styles.cardFooter}>
        <div className={styles.priceContainer}>
          <span
            className={`${styles.price} ${hasDiscount ? styles.finalPrice : styles.standardPrice}`}
          >
            ${Number(finalPrice).toFixed(2)}
          </span>

          {hasDiscount && originalPrice > finalPrice && (
            <span className={styles.oldPrice}>
              ${Number(originalPrice).toFixed(2)}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          <Link to={`/products/${product.slug}`} className={styles.detailsLink}>
            Details →
          </Link>
          <div className={styles.wishlistWrapper}>
            <WishlistButton product={product} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
