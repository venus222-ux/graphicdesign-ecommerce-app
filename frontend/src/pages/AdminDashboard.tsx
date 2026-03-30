import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import styles from "./AdminDashboard.module.css";

// Separate Components
import DashboardCharts from "../components/Admin/DashboardCharts";
import ProductForm from "../components/Admin/ProductForm";
import AdminSidebar from "../components/Admin/AdminSidebar";

import {
  Plus,
  Edit3,
  Trash2,
  Search,
  CheckCircle,
  Circle,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const AdminDashboard: React.FC = () => {
  const {
    categories,
    products,
    pagination,
    isLoadingProducts,
    searchTerm,
    currentPage,
    fetchCategories,
    fetchProducts,
    setSearchTerm,
    setCurrentPage,
    setEditingProduct,
    resetProductForm,
    deleteProduct,
    addCategory,
    deleteCategory,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<"products" | "categories">(
    "products",
  );
  const [catName, setCatName] = useState("");

  useEffect(() => {
    fetchCategories();
    fetchProducts(1);
  }, [fetchCategories, fetchProducts]);

  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || (pagination && newPage > pagination.last_page)) return;
    setCurrentPage(newPage);
    fetchProducts(newPage);
  };

  return (
    <div className={styles.appWrapper}>
      {/* --- SIDEBAR COMPONENT --- */}
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className={styles.mainContainer}>
        <header className={styles.topBar}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              placeholder="Search database..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </header>

        <main className={styles.content}>
          <div className={styles.welcome}>
            <h1>
              {activeTab === "products"
                ? "Inventory Overview"
                : "Category Management"}
            </h1>
            <p>Real-time control over your marketplace assets.</p>
          </div>

          {activeTab === "products" && <DashboardCharts products={products} />}

          <div className={styles.dashboardGrid}>
            <div className={styles.inventorySection}>
              <div className={styles.glassCard}>
                <div className={styles.cardHeader}>
                  <h3>
                    {activeTab === "products"
                      ? "Product List"
                      : "All Categories"}
                  </h3>
                  {activeTab === "products" && (
                    <button
                      onClick={() => {
                        setEditingProduct(null);
                        resetProductForm();
                      }}
                      className={styles.addSmallBtn}
                    >
                      <Plus size={16} /> New Product
                    </button>
                  )}
                </div>

                <div className={styles.tableArea}>
                  {activeTab === "products" ? (
                    isLoadingProducts ? (
                      <div className={styles.skeletonLoader}>
                        Loading products...
                      </div>
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
                    )
                  ) : (
                    <div className={styles.categoryGrid}>
                      {categories.map((c) => (
                        <div key={c.id} className={styles.categoryCard}>
                          <span>{c.name}</span>
                          <Trash2
                            size={14}
                            onClick={() => deleteCategory(c.id)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pagination (Simplified) */}
                {activeTab === "products" &&
                  pagination &&
                  pagination.last_page > 1 && (
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

              <div className={styles.glassCard}>
                <h3>Quick Categories</h3>
                <form
                  className={styles.inlineForm}
                  onSubmit={(e) => {
                    e.preventDefault();
                    addCategory(catName);
                    setCatName("");
                  }}
                >
                  <input
                    placeholder="New name..."
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                  />
                  <button type="submit">
                    <Plus size={18} />
                  </button>
                </form>
                <div className={styles.tagList}>
                  {categories.map((c) => (
                    <span key={c.id} className={styles.tag}>
                      {c.name}{" "}
                      <X size={12} onClick={() => deleteCategory(c.id)} />
                    </span>
                  ))}
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
