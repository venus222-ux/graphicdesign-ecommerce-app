import { Link } from "react-router-dom";
import styles from "../../styles/ProductCard.module.css";
import { Product } from "../../types";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const previewUrl = product.preview_url;
  const categoryName = product.category?.name || "Asset";

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
          <div className={styles.noPreview}>📷 No Preview</div>
        )}
        {/* Quick view overlay (appears on hover) */}
        <div className={styles.overlay}>
          <Link to={`/products/${product.slug}`} className={styles.quickView}>
            Quick View
          </Link>
        </div>
      </div>

      <span className={styles.badge}>{categoryName}</span>

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
