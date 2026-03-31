import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import styles from "../styles/AdminDashboard.module.css";

import AdminSidebar from "../components/Admin/AdminSidebar";
import ProductsTab from "../components/Admin/ProductsTab";
import CategoriesTab from "../components/Admin/CategoriesTab";
import LogsTab from "../components/Admin/LogsTab";
import { Search, Download } from "lucide-react";

const AdminDashboard: React.FC = () => {
  const {
    fetchCategories,
    fetchProducts,
    fetchLogs,
    searchTerm,
    setSearchTerm,
    exportLogs,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<
    "products" | "categories" | "logs"
  >("products");

  useEffect(() => {
    fetchCategories();
    fetchProducts(1);
  }, [fetchCategories, fetchProducts]);

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs(1, searchTerm);
    }
  }, [activeTab, fetchLogs, searchTerm]);

  return (
    <div className={styles.appWrapper}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className={styles.mainContainer}>
        <header className={styles.topBar}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              placeholder={
                activeTab === "logs"
                  ? "Search by file name..."
                  : "Search database..."
              }
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {activeTab === "logs" && (
            <button onClick={exportLogs} className={styles.exportBtn}>
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          )}
        </header>

        <main className={styles.content}>
          <div className={styles.welcome}>
            <h1>
              {activeTab === "products"
                ? "Inventory Overview"
                : activeTab === "categories"
                  ? "Category Management"
                  : "MongoDB Upload Logs"}
            </h1>
            <p>
              {activeTab === "logs"
                ? "Track all asset uploads."
                : "Real-time control over assets."}
            </p>
          </div>

          {activeTab === "products" && <ProductsTab />}
          {activeTab === "categories" && <CategoriesTab />}
          {activeTab === "logs" && <LogsTab />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
