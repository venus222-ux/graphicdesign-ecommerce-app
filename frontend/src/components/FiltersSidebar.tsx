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

      {/* Price Range */}
      <div className={styles.section}>
        <label className={styles.label}>Price Range</label>
        <div className={styles.priceGrid}>
          <input
            type="number"
            className={styles.input}
            placeholder="Min"
            value={minPrice ?? ""}
            onChange={(e) =>
              setFilters({
                minPrice: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
          <input
            type="number"
            className={styles.input}
            placeholder="Max"
            value={maxPrice ?? ""}
            onChange={(e) =>
              setFilters({
                maxPrice: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </div>
      </div>

      {/* Asset Type Selection */}
      <div className={styles.section}>
        <label className={styles.label}>Asset Type</label>
        <div className={styles.pillContainer}>
          {["Premium", "Free"].map((type) => (
            <button
              key={type}
              type="button"
              className={`${styles.pill} ${assetType === type ? styles.pillActive : ""}`}
              onClick={() =>
                setFilters({ assetType: assetType === type ? null : type })
              }
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Sort Footer */}
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
