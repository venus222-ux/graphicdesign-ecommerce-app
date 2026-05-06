import React, { useEffect, useState } from "react";
import { useAdminStore } from "../store/useAdminStore";
import styles from "../styles/AdminDashboard.module.css";

import AdminSidebar from "../components/Admin/AdminSidebar";
import ProductsTab from "../components/Admin/ProductsTab";
import CategoriesTab from "../components/Admin/CategoriesTab";
import LogsTab from "../components/Admin/LogsTab";
import UsersTab from "../components/Admin/UsersTab";
import OrdersTab from "../components/Admin/OrdersTab";
import RefundModal from "../components/Admin/RefundModal";

import { Search, Download } from "lucide-react";

type TabType = "products" | "categories" | "logs" | "users" | "orders";

const AdminDashboard: React.FC = () => {
  const {
    fetchCategories,
    fetchProducts,
    fetchLogs,
    fetchUsers,
    searchTerm,
    setSearchTerm,
    exportLogs,
    users,
    deleteUser,
  } = useAdminStore();

  const [activeTab, setActiveTab] = useState<TabType>("products");

  // REFUND STATE
  const [refundOpen, setRefundOpen] = useState(false);
  const [selectedOrder] = useState<any>(null);

  // INIT
  useEffect(() => {
    fetchCategories();
    fetchProducts(1);
  }, []);

  useEffect(() => {
    if (activeTab === "users") fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === "logs") {
      fetchLogs(1, searchTerm);
    }
  }, [activeTab, searchTerm]);

  return (
    <div className={styles.appWrapper}>
      <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className={styles.mainContainer}>
        {/* TOP BAR */}
        <header className={styles.topBar}>
          <div className={styles.searchBox}>
            <Search size={18} />
            <input
              placeholder={
                activeTab === "logs"
                  ? "Search logs..."
                  : activeTab === "users"
                    ? "Search users..."
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

        {/* CONTENT */}
        {/* CONTENT */}
        <main className={styles.content}>
          <div className={styles.welcome}>
            <h1>
              {activeTab === "products" && "Inventory Overview"}
              {activeTab === "categories" && "Category Management"}
              {activeTab === "logs" && "System Logs"}
              {activeTab === "users" && "User Management"}
              {activeTab === "orders" && "Orders Management"}
            </h1>
          </div>

          {activeTab === "products" && <ProductsTab />}

          {activeTab === "categories" && <CategoriesTab />}

          {activeTab === "logs" && <LogsTab />}

          {activeTab === "users" && (
            <UsersTab users={users} onDelete={deleteUser} />
          )}

          {activeTab === "orders" && <OrdersTab />}
        </main>
      </div>

      {/* 🔥 REFUND MODAL GLOBAL */}
      <RefundModal
        isOpen={refundOpen}
        onClose={() => setRefundOpen(false)}
        orderId={selectedOrder?.id}
        maxAmount={selectedOrder?.total}
        onSuccess={() => {
          setRefundOpen(false);
          // refresh data
          fetchProducts(1);
        }}
      />
    </div>
  );
};

export default AdminDashboard;
