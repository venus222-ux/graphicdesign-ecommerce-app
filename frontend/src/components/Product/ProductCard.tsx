// ProductCard.tsx

import { Link } from "react-router-dom";
import styles from "../../styles/ProductCard.module.css";
import { Product } from "../../types";
import WishlistButton from "./WishlistButton";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // Safe preview resolver
  const previewUrl = product?.preview_urls?.[0] || product?.preview_url || null;

  // Safe numeric conversions
  const rating = Number(product.rating ?? 4.8);

  const finalPrice = Number(product.final_price ?? product.price ?? 0);

  const originalPrice = Number(product.price ?? 0);

  // Validate real discount existence
  const hasDiscount =
    !!product.has_discount && originalPrice > 0 && finalPrice < originalPrice;

  // Prevent NaN / broken calculations
  const discountPercent =
    hasDiscount && originalPrice > 0
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0;

  return (
    <div className={styles.card}>
      {/* MEDIA */}
      <div className={styles.media}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={product.title}
            loading="lazy"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
          />
        ) : (
          <div className={styles.noPreview}>No Preview</div>
        )}

        {/* Wishlist */}
        <div className={styles.wishlist}>
          <WishlistButton product={product} />
        </div>

        {/* Discount Badge */}
        {hasDiscount && discountPercent > 0 && (
          <span className={styles.discountBadge}>{discountPercent}% OFF</span>
        )}
      </div>

      {/* CONTENT */}
      <div className={styles.content}>
        {/* Meta */}
        <div className={styles.meta}>
          <span>{product.category?.name || "Digital"}</span>

          <span>★ {rating.toFixed(1)}</span>
        </div>

        {/* Title */}
        <h3>{product.title}</h3>

        {/* Description */}
        <p>
          {product.description ||
            "Premium digital product crafted for modern creators."}
        </p>

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.priceGroup}>
            {hasDiscount && (
              <span className={styles.oldPrice}>
                ${originalPrice.toFixed(2)}
              </span>
            )}

            <span className={styles.price}>${finalPrice.toFixed(2)}</span>
          </div>

          <Link to={`/products/${product.slug}`} className={styles.button}>
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
