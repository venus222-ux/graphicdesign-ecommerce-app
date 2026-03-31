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
              <h3>Product List</h3>
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
                <div className={styles.skeletonLoader}>Loading products...</div>
              ) : (
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.title}</strong>
                        </td>
                        <td>
                          <span className={styles.catBadge}>
                            {p.category?.name || "None"}
                          </span>
                        </td>
                        <td>${p.price}</td>
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
                        <td className={styles.actions}>
                          <button
                            onClick={() => setEditingProduct(p)}
                            className={styles.editBtn}
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => deleteProduct(p.id)}
                            className={styles.deleteBtn}
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {pagination && pagination.last_page > 1 && (
              <div className={styles.paginationWrapper}>
                <div className={styles.pagination}>
                  <button
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                    className={styles.pArrow}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className={styles.pNum}>
                    {currentPage} / {pagination.last_page}
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
            )}
          </div>
        </div>
        <aside className={styles.sideControls}>
          <ProductForm />
        </aside>
      </div>
    </>
  );
};

export default ProductsTab;
