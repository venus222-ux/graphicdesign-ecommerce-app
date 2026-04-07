import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "../api";
import { Product } from "../types";
import styles from "../styles/Shop.module.css";

const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();

  // ✅ Accesăm corect res.data.data
  const {
    data: product,
    isLoading,
    isError,
  } = useQuery<Product>({
    queryKey: ["product", slug],
    queryFn: async () => {
      const res = await API.get(`/products/${slug}`);
      return res.data.data; // ← corect
    },
    enabled: !!slug,
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const previews: string[] = (() => {
    if (!product) return [];

    // 1️⃣ Dacă e array
    if (Array.isArray(product.preview_urls)) {
      return product.preview_urls.map(String);
    }

    // 2️⃣ Dacă e string JSON
    if (typeof product.preview_urls === "string") {
      const trimmed = product.preview_urls.trim();
      if (trimmed !== "") {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.map(String);
          return [];
        } catch {
          return [];
        }
      }
    }

    // 3️⃣ fallback la preview_url simplu
    return product.preview_url ? [product.preview_url] : [];
  })();
  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % previews.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + previews.length) % previews.length);

  if (isLoading) {
    return (
      <div className={styles.pageWrapper}>
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-3 text-muted">Loading premium asset...</p>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className={styles.pageWrapper}>
        <div className="container py-5 text-center">
          <h1 className="display-1">404</h1>
          <h2 className="mb-4">Asset Not Found</h2>
          <p className="text-muted mb-5">
            The product you're looking for might have been removed or doesn't
            exist.
          </p>
          <Link to="/" className={styles.primaryBtn}>
            Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <div className="container py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <Link to="/">Marketplace</Link>
            </li>
            <li className="breadcrumb-item active">
              {product.category?.name || "Digital Asset"}
            </li>
          </ol>
        </nav>

        <div className="row g-5">
          {/* Left Column: Image Slider */}
          <div className="col-lg-7">
            <div
              className={styles.imageContainer}
              style={{
                position: "relative",
                borderRadius: "24px",
                overflow: "hidden",
                minHeight: "450px",
              }}
            >
              {previews.length > 0 ? (
                <>
                  <img
                    src={previews[currentIndex]}
                    alt={`${product.title} - ${currentIndex + 1}`}
                    className="img-fluid"
                    style={{
                      width: "100%",
                      height: "auto",
                      maxHeight: "520px",
                      objectFit: "cover",
                      borderRadius: "24px",
                    }}
                  />

                  {/* Navigation Arrows */}
                  {previews.length > 1 && (
                    <>
                      <button
                        onClick={prevSlide}
                        style={{
                          position: "absolute",
                          left: "15px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          border: "none",
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 10,
                        }}
                      >
                        ←
                      </button>
                      <button
                        onClick={nextSlide}
                        style={{
                          position: "absolute",
                          right: "15px",
                          top: "50%",
                          transform: "translateY(-50%)",
                          background: "rgba(0,0,0,0.5)",
                          color: "white",
                          border: "none",
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          zIndex: 10,
                        }}
                      >
                        →
                      </button>
                    </>
                  )}

                  {/* Dots */}
                  {previews.length > 1 && (
                    <div
                      style={{
                        position: "absolute",
                        bottom: "15px",
                        left: "50%",
                        transform: "translateX(-50%)",
                        display: "flex",
                        gap: "8px",
                      }}
                    >
                      {previews.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentIndex(idx)}
                          style={{
                            width: "10px",
                            height: "10px",
                            borderRadius: "50%",
                            background:
                              idx === currentIndex
                                ? "#fff"
                                : "rgba(255,255,255,0.6)",
                            border: "none",
                          }}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div
                  className="text-muted d-flex flex-column align-items-center"
                  style={{ justifyContent: "center", minHeight: "450px" }}
                >
                  <span style={{ fontSize: "3rem" }}>🖼️</span>
                  <span>No Preview Available</span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Details & Actions */}
          <div className="col-lg-5">
            <div className="ps-lg-4">
              <span
                className="badge bg-soft-primary text-primary mb-2"
                style={{ backgroundColor: "#e0e7ff", padding: "8px 12px" }}
              >
                {product.asset_type || "Premium"}
              </span>

              <h1 className="display-5 fw-bold mb-3">{product.title}</h1>

              <p className="lead text-secondary mb-4">
                {product.short_description}
              </p>

              {/* Pricing */}
              <div
                className="p-4 rounded-4 mb-4"
                style={{
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <span className="text-muted fw-medium">Price</span>
                  <h2
                    className={styles.priceTag}
                    style={{ margin: 0, fontSize: "2.5rem" }}
                  >
                    ${product.price}
                  </h2>
                </div>

                <button
                  className={`${styles.primaryBtn} w-100 py-3 mb-2 border-0`}
                  style={{ fontSize: "1.1rem" }}
                >
                  Buy Now
                </button>
                <p className="text-center text-muted x-small mt-2 mb-0">
                  <small>Secure checkout • Instant digital delivery</small>
                </p>
              </div>

              {/* Full Description */}
              <div className="mt-5">
                <h5 className="fw-bold border-bottom pb-2 mb-3">
                  About this asset
                </h5>
                <p
                  className="text-secondary"
                  style={{ lineHeight: "1.8", whiteSpace: "pre-line" }}
                >
                  {product.description}
                </p>
              </div>

              {/* Technical Specs */}
              <div className="row g-3 mt-4">
                <div className="col-6">
                  <div className="p-3 border rounded-3 bg-white">
                    <small className="d-block text-muted">Category</small>
                    <span className="fw-semibold">
                      {product.category?.name || "Uncategorized"}
                    </span>
                  </div>
                </div>
                <div className="col-6">
                  <div className="p-3 border rounded-3 bg-white">
                    <small className="d-block text-muted">Format</small>
                    <span className="fw-semibold">
                      {product.asset_type?.toUpperCase() || "ZIP"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
