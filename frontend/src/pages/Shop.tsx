import { Link } from "react-router-dom";
import { useStore } from "../store/useStore";
import { useProducts } from "../hooks/useProducts";
import FiltersSidebar from "../components/FiltersSidebar";
import { useRef, useEffect } from "react";
import styles from "../styles/Shop.module.css";
import { Product } from "../types";

const Shop = () => {
  const { isAuth } = useStore();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useProducts();
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage) fetchNextPage();
      },
      { threshold: 0.5 },
    );
    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextPage, fetchNextPage]);

  return (
    <div className={styles.pageWrapper}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1>Digital Marketplace</h1>
        <p className={styles.heroSubtext}>
          {isAuth
            ? "Welcome back! Discover your next masterpiece."
            : "Premium assets for modern creators. High-quality kits, source code, and assets."}
        </p>
        <div className="mt-8 d-flex justify-content-center gap-4">
          {!isAuth ? (
            <>
              <Link to="/login" className={styles.primaryBtn}>
                Get Started
              </Link>
              <Link to="/register" className={styles.secondaryBtn}>
                Browse All
              </Link>
            </>
          ) : (
            <Link to="/dashboard" className={styles.primaryBtn}>
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>

      <div className={styles.mainLayout}>
        <aside>
          <FiltersSidebar />
        </aside>

        <main>
          <h2 className={styles.sectionTitle}>
            {data?.pages[0]?.total
              ? `${data.pages[0].total} results found`
              : "Latest Drops"}
          </h2>

          <div className={styles.productGrid}>
            {isLoading
              ? // Enhanced Skeleton Loader
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className={`${styles.card} ${styles.skeleton}`}>
                    <div className={styles.imageContainer} />
                    <div
                      style={{
                        height: "14px",
                        width: "40%",
                        background: "#eee",
                        borderRadius: "4px",
                      }}
                    />
                    <div
                      className="mt-3"
                      style={{
                        height: "20px",
                        width: "80%",
                        background: "#eee",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                ))
              : data?.pages.map((page) =>
                  page.data.map((product: Product) => (
                    <div key={product.id} className={styles.card}>
                      <div className={styles.imageContainer}>
                        {product.preview_url ? (
                          <img
                            src={product.preview_url}
                            alt={product.title}
                            className={styles.productImg}
                          />
                        ) : (
                          <div className="w-100 h-100 d-flex align-items-center justify-content-center text-muted">
                            📷 No Preview
                          </div>
                        )}
                      </div>

                      <span className={styles.badge}>
                        {product.category?.name || "Asset"}
                      </span>

                      <h5 className={styles.productTitle}>{product.title}</h5>

                      <div className={styles.cardFooter}>
                        <span className={styles.price}>${product.price}</span>
                        <Link
                          to={`/products/${product.slug}`} // ← Make sure slug exists
                          className={styles.detailsLink}
                        >
                          View Details →
                        </Link>
                      </div>
                    </div>
                  )),
                )}
          </div>

          {/* Infinite Scroll Trigger */}
          <div ref={observerRef} className="text-center py-5">
            {isFetchingNextPage && (
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shop;
