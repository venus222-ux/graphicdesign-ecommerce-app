import { useEffect, useState } from "react";
import { useMarketplaceStore } from "../store/useMarketplaceStore";
import styles from "../styles/FiltersSidebar.module.css";

const FiltersSidebar = () => {
  const {
    search,
    category,
    minPrice,
    maxPrice,
    assetType,
    sort,
    setSearch,
    setFilters,
    resetFilters,
  } = useMarketplaceStore();

  // ⭐ Local state (prevents instant API calls)
  const [localMin, setLocalMin] = useState(minPrice ?? "");
  const [localMax, setLocalMax] = useState(maxPrice ?? "");

  // Sync store → local state when filters change externally
  useEffect(() => {
    setLocalMin(minPrice ?? "");
    setLocalMax(maxPrice ?? "");
  }, [minPrice, maxPrice]);

  // ⭐ Debounce update to global store
  useEffect(() => {
    const handler = setTimeout(() => {
      setFilters({
        minPrice: localMin === "" ? null : Number(localMin),
        maxPrice: localMax === "" ? null : Number(localMax),
      });
    }, 500);

    return () => clearTimeout(handler);
  }, [localMin, localMax, setFilters]);

  return (
    <aside className={styles.sidebar}>
      <div className={styles.header}>
        <h3>Filters</h3>
        <button
          className={styles.resetBtn}
          onClick={resetFilters}
          title="Clear all"
        >
          Reset
        </button>
      </div>

      {/* Search */}
      <div className={styles.section}>
        <label className={styles.label}>Search</label>
        <input
          type="text"
          className={styles.input}
          placeholder="Keywords..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Category */}
      <div className={styles.section}>
        <label className={styles.label}>Category</label>
        <select
          className={styles.input}
          value={category ?? ""}
          onChange={(e) =>
            setFilters({
              category: e.target.value ? Number(e.target.value) : null,
            })
          }
        >
          <option value="">All Categories</option>
          <option value="1">Design</option>
          <option value="2">Code</option>
        </select>
      </div>

      {/* Price Range (debounced) */}
      <div className={styles.section}>
        <label className={styles.label}>Price Range</label>
        <div className={styles.priceGrid}>
          <input
            type="number"
            className={styles.input}
            placeholder="Min"
            value={localMin}
            onChange={(e) => setLocalMin(e.target.value)}
          />
          <input
            type="number"
            className={styles.input}
            placeholder="Max"
            value={localMax}
            onChange={(e) => setLocalMax(e.target.value)}
          />
        </div>
      </div>

      {/* Asset Type */}
      <div className={styles.section}>
        <label className={styles.label}>Asset Type</label>
        <div className={styles.pillContainer}>
          {["Premium", "Free"].map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.pill} ${
                assetType === type ? styles.pillActive : ""
              }`}
              onClick={() =>
                setFilters({
                  assetType: assetType === type ? null : type,
                })
              }
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div className={styles.footer}>
        <label className={styles.label}>Sort By</label>
        <select
          className={styles.input}
          value={sort}
          onChange={(e) => setFilters({ sort: e.target.value })}
        >
          <option value="newest">Newest First</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
        </select>
      </div>
    </aside>
  );
};

export default FiltersSidebar;
