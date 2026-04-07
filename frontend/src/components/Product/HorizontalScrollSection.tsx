import { useEffect, useRef, useState } from "react";
import ProductCard from "./ProductCard";
import SkeletonProductCard from "./SkeletonProductCard";
import { Product } from "../../types";
import styles from "../../styles/HorizontalScrollSection.module.css";

interface HorizontalScrollSectionProps {
  title: string;
  fetchUrl: string;
}

const HorizontalScrollSection = ({
  title,
  fetchUrl,
}: HorizontalScrollSectionProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetch(fetchUrl)
      .then((res) => res.json())
      .then((data) => setProducts(data.data || data))
      .finally(() => setLoading(false));
  }, [fetchUrl]);

  const checkScrollButtons = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 5);
  };

  useEffect(() => {
    checkScrollButtons();
    window.addEventListener("resize", checkScrollButtons);
    return () => window.removeEventListener("resize", checkScrollButtons);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = scrollRef.current.clientWidth * 0.8;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>
        <div className={styles.arrows}>
          <button
            className={`${styles.arrow} ${!canScrollLeft ? styles.disabled : ""}`}
            onClick={() => scroll("left")}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            className={`${styles.arrow} ${!canScrollRight ? styles.disabled : ""}`}
            onClick={() => scroll("right")}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>

      <div
        className={styles.scrollContainer}
        ref={scrollRef}
        onScroll={checkScrollButtons}
      >
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={styles.skeletonWrapper}>
                <SkeletonProductCard />
              </div>
            ))
          : products.map((product) => (
              <div key={product.id} className={styles.cardWrapper}>
                <ProductCard product={product} />
              </div>
            ))}
      </div>
    </section>
  );
};

export default HorizontalScrollSection;
