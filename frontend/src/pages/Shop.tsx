import { useRef, useEffect } from "react";
import { useStore } from "../store/useStore";
import { useProducts } from "../hooks/useProducts";
import FiltersSidebar from "../components/FiltersSidebar";
import ProductCard from "../components/Product/ProductCard";
import styles from "../styles/Shop.module.css";

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
              ? Array.from({ length: 6 }).map((_, i) => (
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
                  page.data.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  )),
                )}
          </div>

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
