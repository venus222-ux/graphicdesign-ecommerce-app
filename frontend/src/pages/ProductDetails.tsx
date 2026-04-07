import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "../api";
import { Product } from "../types";
import styles from "../styles/ProductDetails.module.css";
import ProductCard from "../components/Product/ProductCard";

const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);

  // 1. Data Fetching
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

  // 2. Memoized Image Logic (Cleans up the render block)
  const previews = useMemo((): string[] => {
    if (!product) return [];
    const raw = product.preview_urls;

    if (Array.isArray(raw)) return raw.map(String);

    if (typeof raw === "string" && raw.trim() !== "") {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed.map(String);
      } catch (e) {
        return [raw]; // Fallback if string is just a single URL
      }
    }
    return product.preview_url ? [product.preview_url] : [];
  }, [product]);

  // 3. Handlers
  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % previews.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + previews.length) % previews.length);

  // 4. Guard Clauses (Loading/Error States)
  if (isLoading) return <LoadingState />;
  if (isError || !product) return <ErrorState />;

  return (
    <div className={styles.pageWrapper}>
      <div className="container py-4">
        {/* Breadcrumb - Subtle & Clean */}
        <nav className="mb-4 small">
          <Link to="/" className="text-decoration-none text-muted">
            Marketplace
          </Link>
          <span className="mx-2 text-muted">/</span>
          <span className="text-primary fw-medium">
            {product.category?.name || "Asset"}
          </span>
        </nav>

        <div className="row g-lg-5">
          {/* Left: Gallery Section */}
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
                        >
                          ‹
                        </button>
                        <button
                          onClick={nextSlide}
                          className={styles.navBtnNext}
                        >
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="d-flex gap-2 mt-3 overflow-auto pb-2">
                    {previews.map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        onClick={() => setCurrentIndex(idx)}
                        className={`${styles.thumb} ${idx === currentIndex ? styles.thumbActive : ""}`}
                        alt="thumbnail"
                      />
                    ))}
                  </div>
                </>
              ) : (
                <div className={styles.noImagePlaceholder}>
                  No Image Provided
                </div>
              )}
            </div>
          </div>

          {/* Right: Purchase & Info Section */}
          <div className="col-lg-5">
            <div className="sticky-top" style={{ top: "2rem" }}>
              <span
                className="badge rounded-pill px-3 py-2 mb-3"
                style={{
                  backgroundColor: "rgba(13, 110, 253, 0.1)",
                  color: "#0d6efd",
                }}
              >
                {product.asset_type || "Digital Asset"}
              </span>

              <h1 className="fw-bold mb-2">{product.title}</h1>
              <p className="text-muted fs-5 mb-4">
                {product.short_description}
              </p>

              <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4">
                <div className="card-body p-4">
                  <div className="d-flex justify-content-between align-items-end mb-4">
                    <div>
                      <small className="text-uppercase text-muted fw-bold ls-1">
                        Price
                      </small>
                      <h2 className="mb-0 fw-bold text-dark">
                        ${product.price}
                      </h2>
                    </div>
                    <div className="text-end">
                      <span className="text-success small fw-medium">
                        ● Instant Access
                      </span>
                    </div>
                  </div>

                  <button className="btn btn-primary w-100 py-3 fw-bold rounded-3 shadow-sm mb-3">
                    Download Now
                  </button>

                  <div className="d-flex justify-content-center gap-3 small text-muted">
                    <span>✓ Secure Payment</span>
                    <span>✓ Verified Asset</span>
                  </div>
                </div>
              </div>

              {/* Quick Specs Grid */}
              <div className="row g-2 mb-4">
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <small className="text-muted d-block">Format</small>
                    <span className="fw-bold text-uppercase">
                      {product.asset_type || "N/A"}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <small className="text-muted d-block">Category</small>
                    <span className="fw-bold">
                      {product.category?.name || "General"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Description */}
        <div className="row mt-5">
          <div className="col-lg-7">
            <h4 className="fw-bold mb-4">Description</h4>
            <div className={`${styles.descriptionBody} text-secondary`}>
              {product.description}
            </div>
          </div>
        </div>

        {/* Related Products Section */}
        {product?.related_products?.length && (
          <div className="mt-5 pt-5 border-top">
            <h4 className="fw-bold mb-4">Recommended for you</h4>
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
              {product.related_products.map((item) => (
                <div className="col" key={item.id}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sub-components for cleaner code
const LoadingState = () => (
  <div className="container py-5 text-center">
    <div className="spinner-border text-primary" role="status" />
    <p className="mt-3">Loading product details...</p>
  </div>
);

const ErrorState = () => (
  <div className="container py-5 text-center">
    <h3>Oops! Asset not found.</h3>
    <Link to="/" className="btn btn-outline-primary mt-3">
      Return to Store
    </Link>
  </div>
);

export default ProductDetails;
