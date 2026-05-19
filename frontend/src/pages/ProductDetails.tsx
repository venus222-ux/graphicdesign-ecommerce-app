import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "../api";
import { Product } from "../types";
import styles from "../styles/ProductDetails.module.css";
import ProductCard from "../components/Product/ProductCard";
import { useCartStore } from "../store/useCartStore";
import { ShoppingCart, Shield, Download } from "lucide-react";
import { toast } from "react-toastify";

const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🛒 CART STORE
  const addToCart = useCartStore((s) => s.addToCart);

  // 1. Fetch product data
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<Product & { related_products?: Product[] }>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await API.get(`/products/${slug}`);
      return res.data.data;
    },
    enabled: !!slug,
  });

  // 2. Extrapolate active previews safely
  const previews = useMemo((): string[] => {
    if (!product) return [];
    if (
      Array.isArray(product.preview_urls) &&
      product.preview_urls.length > 0
    ) {
      return product.preview_urls;
    }
    if (product.preview_url) {
      return [product.preview_url];
    }
    return [];
  }, [product]);

  // 3. Discount Calculations
  const hasDiscount = !!product?.has_discount;
  const finalPrice = product?.final_price ?? product?.price ?? 0;
  const originalPrice = product?.price ?? 0;

  let discountBadgeLabel = "";
  if (hasDiscount && product) {
    if (product.discount_percentage && product.discount_percentage > 0) {
      discountBadgeLabel = `${product.discount_percentage}% OFF`;
    } else if (product.discount_fixed && product.discount_fixed > 0) {
      discountBadgeLabel = `$${Number(product.discount_fixed).toFixed(0)} OFF`;
    } else if (
      product.effective_discount_percentage &&
      product.effective_discount_percentage > 0
    ) {
      discountBadgeLabel = `${product.effective_discount_percentage}% OFF`;
    } else {
      discountBadgeLabel = "SALE";
    }
  }

  // 4. Carousel Slides
  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % previews.length);

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + previews.length) % previews.length);

  // 🛒 Add to Cart Wrapper Handler
  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product);
    toast.success("Added to cart 🛒");
  };

  if (isLoading) return <LoadingState />;
  if (isError || !product) return <ErrorState />;

  return (
    <div className={styles.pageWrapper}>
      <div className="container py-4">
        {/* Breadcrumb Navigation */}
        <nav className="mb-4 small d-flex align-items-center gap-1">
          <Link
            to="/"
            className="text-decoration-none text-muted transition-all"
          >
            Marketplace
          </Link>
          <span className="text-muted">/</span>
          <span className={`${styles.breadcrumbActive} fw-medium`}>
            {product.category?.name || "Asset Details"}
          </span>
        </nav>

        <div className="row g-lg-5">
          {/* LEFT COLUMN: VISUAL GALLERY MODULE */}
          <div className="col-lg-7">
            <div className={styles.mainImageWrapper}>
              {previews.length > 0 ? (
                <>
                  <div className={styles.featuredImageContainer}>
                    <img
                      src={previews[currentIndex]}
                      alt={product.title}
                      className={styles.mainDisplayImage}
                    />

                    {previews.length > 1 && (
                      <>
                        <button
                          onClick={prevSlide}
                          className={styles.navBtnPrev}
                          aria-label="Previous image"
                        >
                          ‹
                        </button>
                        <button
                          onClick={nextSlide}
                          className={styles.navBtnNext}
                          aria-label="Next image"
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Row Indicator */}
                  <div className="d-flex gap-2 mt-3 overflow-auto pb-2">
                    {previews.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        onClick={() => setCurrentIndex(idx)}
                        className={`${styles.thumb} ${idx === currentIndex ? styles.thumbActive : ""}`}
                        alt={`Preview thumbnail ${idx + 1}`}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.noImagePlaceholder}>
                  <span>📷 No Image Previews Provided</span>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: INTERACTIVE CHECKOUT & INFO CONSOLE */}
          <div className="col-lg-5">
            <div className="sticky-top" style={{ top: "6rem" }}>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
                <span className={`${styles.assetTypeBadge}`}>
                  {product.asset_type || "Digital Asset"}
                </span>
                {hasDiscount && (
                  <span className={`${styles.saleBadge}`}>
                    {discountBadgeLabel}
                  </span>
                )}
              </div>

              <h1 className="fw-bold mb-2 text-dark lh-sm">{product.title}</h1>
              <p className="text-muted fs-5 mb-4 fw-normal">
                {product.short_description}
              </p>

              {/* Conversion Pricing Panel Card */}
              <div className={`${styles.purchaseCard} card border-0 mb-4`}>
                <div className="card-body p-4">
                  <div className="mb-4">
                    <small className="text-uppercase text-muted fw-bold letter-spacing-glance d-block mb-1">
                      Pricing Options
                    </small>
                    <div className="d-flex align-items-baseline gap-2 flex-wrap">
                      <h2
                        className={`mb-0 fw-bold ${hasDiscount ? styles.activeDiscountPrice : styles.defaultPrice}`}
                      >
                        ${Number(finalPrice).toFixed(2)}
                      </h2>
                      {hasDiscount && originalPrice > finalPrice && (
                        <span className={styles.strikeThroughPrice}>
                          ${Number(originalPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Add to Cart Primary Trigger Action */}
                  <button
                    onClick={handleAddToCart}
                    className={`${styles.addToCartBtn} btn w-100 py-3 fw-bold rounded-3 mb-3 d-flex align-items-center justify-content-center gap-2`}
                  >
                    <ShoppingCart size={18} />
                    Add to Cart Collection
                  </button>

                  {/* Guarantee Protection Badges */}
                  <div className="d-flex justify-content-center gap-4 small text-muted pt-2 border-top-dashed">
                    <span className="d-flex align-items-center gap-1">
                      <Shield size={14} className="text-success" /> Secure
                      Checkout
                    </span>
                    <span className="d-flex align-items-center gap-1">
                      <Download size={14} className="text-primary" /> Instant
                      Delivery
                    </span>
                  </div>
                </div>
              </div>

              {/* Metadata Attributes Row */}
              <div className="row g-2 mb-4">
                <div className="col-6">
                  <div className={`${styles.metaBox} p-3 bg-white rounded-3`}>
                    <small className="text-muted d-block mb-1">
                      Format Type
                    </small>
                    <span className="fw-bold text-dark text-capitalize">
                      {product.asset_type || "Standard"}
                    </span>
                  </div>
                </div>

                <div className="col-6">
                  <div className={`${styles.metaBox} p-3 bg-white rounded-3`}>
                    <small className="text-muted d-block mb-1">
                      Asset Category
                    </small>
                    <span className="fw-bold text-dark">
                      {product.category?.name || "General"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* METADATA EXTENDED PROFILE SECTIONS */}
        <div className="row mt-5">
          <div className="col-lg-7">
            <div className={`${styles.descriptionCard} p-4 rounded-4`}>
              <h4 className="fw-bold mb-3 text-dark">Description</h4>
              <div className={`${styles.descriptionBody} text-secondary`}>
                {product.description}
              </div>
            </div>
          </div>
        </div>

        {/* RELATED SYSTEM CROSS-SELL RECOMMENDATIONS */}
        {product?.related_products?.length ? (
          <div className="mt-5 pt-5 border-top border-light-subtle">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <h4 className="fw-bold text-dark m-0">Recommended Assets</h4>
              <Link
                to="/"
                className={`${styles.viewAllLink} small fw-bold text-decoration-none`}
              >
                View All Marketplace →
              </Link>
            </div>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {product.related_products.map((item) => (
                <div className="col" key={item.id}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ProductDetails;

/* ================= LOADING & FAULT ISOLATION COMPONENTS ================= */

const LoadingState = () => (
  <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center min-vh-50">
    <div
      className="spinner-border text-primary"
      role="status"
      style={{ width: "3rem", height: "3rem" }}
    >
      <span className="visually-hidden">Loading...</span>
    </div>
    <p className="mt-3 text-muted fw-medium">Loading asset specifications...</p>
  </div>
);

const ErrorState = () => (
  <div className="container py-5 text-center d-flex flex-column align-items-center justify-content-center min-vh-50">
    <div
      className="p-4 bg-danger-subtle rounded-circle text-danger mb-3"
      style={{ width: "fit-content" }}
    >
      ⚠️
    </div>
    <h3 className="fw-bold text-dark">Product Missing</h3>
    <p className="text-muted">
      This product profile is either inactive or has been reassigned.
    </p>
    <Link
      to="/"
      className="btn btn-primary px-4 py-2 rounded-3 shadow-sm mt-2 fw-semibold"
    >
      Return Marketplace
    </Link>
  </div>
);
