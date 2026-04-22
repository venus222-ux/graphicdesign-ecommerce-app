import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import API from "../api";
import { Product } from "../types";
import styles from "../styles/ProductDetails.module.css";
import ProductCard from "../components/Product/ProductCard";
import { useCartStore } from "../store/useCartStore";
import { ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";

const ProductDetails = () => {
  const { slug } = useParams<{ slug: string }>();
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🛒 CART STORE
  const addToCart = useCartStore((s) => s.addToCart);

  // 1. Fetch product
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

  // 2. Images
  const previews = useMemo((): string[] => {
    if (!product) return [];

    // Prefer the array we send from backend
    if (
      Array.isArray(product.preview_urls) &&
      product.preview_urls.length > 0
    ) {
      return product.preview_urls;
    }

    // Fallback
    if (product.preview_url) {
      return [product.preview_url];
    }

    return [];
  }, [product]);

  // 3. Carousel
  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % previews.length);

  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + previews.length) % previews.length);

  // 🛒 ADD TO CART
  const handleAddToCart = () => {
    if (!product) return;

    addToCart(product);

    toast.success("Added to cart 🛒");
  };

  // 4. States
  if (isLoading) return <LoadingState />;
  if (isError || !product) return <ErrorState />;

  return (
    <div className={styles.pageWrapper}>
      <div className="container py-4">
        {/* Breadcrumb */}
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
          {/* LEFT: IMAGES */}
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

          {/* RIGHT: INFO */}
          <div className="col-lg-5">
            <div className="sticky-top" style={{ top: "2rem" }}>
              <span className="badge rounded-pill px-3 py-2 mb-3 bg-primary-subtle text-primary">
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
                      <small className="text-uppercase text-muted fw-bold">
                        Price
                      </small>
                      <h2 className="mb-0 fw-bold">${product.price}</h2>
                    </div>
                  </div>

                  {/* 🛒 ADD TO CART BUTTON */}
                  <button
                    onClick={handleAddToCart}
                    className="btn btn-dark w-100 py-3 fw-bold rounded-3 shadow-sm mb-3 d-flex align-items-center justify-content-center gap-2"
                  >
                    <ShoppingCart size={18} />
                    Add to Cart
                  </button>

                  <div className="d-flex justify-content-center gap-3 small text-muted">
                    <span>✓ Secure</span>
                    <span>✓ Instant Access</span>
                  </div>
                </div>
              </div>

              {/* SPECS */}
              <div className="row g-2 mb-4">
                <div className="col-6">
                  <div className="p-3 bg-light rounded-3 border">
                    <small className="text-muted d-block">Format</small>
                    <span className="fw-bold">
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

        {/* DESCRIPTION */}
        <div className="row mt-5">
          <div className="col-lg-7">
            <h4 className="fw-bold mb-4">Description</h4>
            <div className="text-secondary">{product.description}</div>
          </div>
        </div>

        {/* RELATED */}
        {product?.related_products?.length ? (
          <div className="mt-5 pt-5 border-top">
            <h4 className="fw-bold mb-4">Recommended</h4>
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

/* ================= STATES ================= */

const LoadingState = () => (
  <div className="container py-5 text-center">
    <div className="spinner-border text-primary" />
    <p className="mt-3">Loading product...</p>
  </div>
);

const ErrorState = () => (
  <div className="container py-5 text-center">
    <h3>Product not found</h3>
    <Link to="/" className="btn btn-outline-primary mt-3">
      Go Home
    </Link>
  </div>
);
