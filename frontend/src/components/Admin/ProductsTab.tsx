import React from "react";
import { useAdminStore } from "../../store/useAdminStore";
import styles from "../../styles/AdminDashboard.module.css";
import DashboardCharts from "./DashboardCharts";
import ProductForm from "./ProductForm";
import {
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const ProductsTab: React.FC = () => {
  const {
    products,
    pagination,
    isLoadingProducts,
    currentPage,
    setCurrentPage,
    fetchProducts,
    setEditingProduct,
    resetProductForm,
    deleteProduct,
  } = useAdminStore();

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.last_page)) return;

    setCurrentPage(newPage);
    fetchProducts(newPage);
  };

  return (
    <>
      <DashboardCharts products={products} />

      <div className={styles.dashboardGrid}>
        <div className={styles.inventorySection}>
          <div className={styles.glassCard}>
            <div className={styles.cardHeader}>
              <div className={styles.headerInfo}>
                <h3>Product List</h3>
                {products.length > 0 && (
                  <span className={styles.countBadge}>
                    {products.length} Items
                  </span>
                )}
              </div>

              <button
                onClick={() => {
                  setEditingProduct(null);
                  resetProductForm();
                }}
                className={styles.addSmallBtn}
              >
                <Plus size={16} /> New Product
              </button>
            </div>

            <div className={styles.tableArea}>
              {isLoadingProducts ? (
                <div className={styles.skeletonLoader}>
                  <div className={styles.spinner}></div>
                  <span>Loading products...</span>
                </div>
              ) : products.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No products available. Create a new one to get started!</p>
                </div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Discount</th>
                      <th>Status</th>
                      <th className={styles.actionsCell}>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        {/* 1. TITLE */}
                        <td>
                          <span className={styles.primaryText}>{p.title}</span>
                        </td>

                        {/* 2. CATEGORY */}
                        <td>
                          <span className={styles.catBadge}>
                            {p.category?.name || "None"}
                          </span>
                        </td>

                        {/* 3. PRICE COLUMN */}
                        <td>
                          <div className={styles.priceContainer}>
                            {p.has_discount ? (
                              <>
                                <span className={styles.finalPrice}>
                                  ${Number(p.final_price).toFixed(2)}
                                </span>
                                <span className={styles.originalPrice}>
                                  ${Number(p.price).toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className={styles.standardPrice}>
                                ${Number(p.price).toFixed(2)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* 4. DISCOUNT COLUMN */}
                        <td>
                          {p.discount_percentage ? (
                            <div
                              className={`${styles.discountBadge} ${styles.pctBadge}`}
                            >
                              <span className={styles.badgePulse}></span>
                              {p.discount_percentage}% OFF
                            </div>
                          ) : p.discount_fixed ? (
                            <div
                              className={`${styles.discountBadge} ${styles.fixedBadge}`}
                            >
                              ${Number(p.discount_fixed).toFixed(2)} DROP
                            </div>
                          ) : (
                            <span className={styles.noDiscount}>—</span>
                          )}
                        </td>

                        {/* 5. STATUS */}
                        <td>
                          {p.is_published ? (
                            <span className={styles.statusOn}>
                              <CheckCircle size={14} /> Active
                            </span>
                          ) : (
                            <span className={styles.statusOff}>
                              <Circle size={14} /> Draft
                            </span>
                          )}
                        </td>

                        {/* 6. ACTIONS */}
                        <td className={styles.actionsCell}>
                          <div className={styles.actions}>
                            <button
                              onClick={() => setEditingProduct(p)}
                              className={styles.editBtn}
                              title="Edit Product"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              onClick={() => deleteProduct(p.id)}
                              className={styles.deleteBtn}
                              title="Delete Product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* PAGINATION */}
            {pagination && pagination.last_page > 1 && (
              <div className={styles.paginationWrapper}>
                <div className={styles.pagination}>
                  <span className={styles.paginationInfo}>
                    Page {currentPage} of {pagination.last_page}
                  </span>
                  <div className={styles.paginationControls}>
                    <button
                      disabled={currentPage === 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className={styles.pArrow}
                    >
                      <ChevronLeft size={18} />
                    </button>

                    <span className={`${styles.pNum} ${styles.pActive}`}>
                      {currentPage}
                    </span>

                    <button
                      disabled={currentPage === pagination.last_page}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className={styles.pArrow}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <aside className={styles.sideControls}>
          <ProductForm />
        </aside>
      </div>
    </>
  );
};

export default ProductsTab;
