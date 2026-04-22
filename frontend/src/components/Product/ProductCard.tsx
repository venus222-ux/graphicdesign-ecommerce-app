import { Link } from "react-router-dom";
import styles from "../../styles/ProductCard.module.css";
import { Product } from "../../types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  // ✅ stable access (NO transformation, NO memo needed)
  const previewUrl = product?.preview_urls?.[0] || product?.preview_url || null;

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {previewUrl ? (
          <img
            src={previewUrl}
            alt={product.title}
            className={styles.productImg}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className={styles.noPreview}>📷 No Preview</div>
        )}

        <div className={styles.overlay}>
          <Link to={`/products/${product.slug}`} className={styles.quickView}>
            Quick View
          </Link>
        </div>
      </div>

      <h5 className={styles.productTitle}>{product.title}</h5>

      <div className={styles.cardFooter}>
        <span className={styles.price}>
          ${Number(product.price).toFixed(2)}
        </span>

        <Link to={`/products/${product.slug}`} className={styles.detailsLink}>
          Details →
        </Link>
      </div>
    </div>
  );
};

export default ProductCard;
