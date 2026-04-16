import React from "react";
import {
  LayoutDashboard,
  Package,
  Layers,
  Database,
  Users,
} from "lucide-react";
import styles from "../../styles/AdminDashboard.module.css";

interface AdminSidebarProps {
  activeTab: "products" | "categories" | "logs" | "users";
  setActiveTab: (tab: "products" | "categories" | "logs" | "users") => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
}) => {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.logo}>
        <LayoutDashboard size={24} />
        <span>AdminPanel</span>
      </div>

      <ul className={styles.navLinks}>
        <li
          className={activeTab === "products" ? styles.active : ""}
          onClick={() => setActiveTab("products")}
        >
          <Package size={18} /> <span>Products</span>
        </li>

        <li
          className={activeTab === "categories" ? styles.active : ""}
          onClick={() => setActiveTab("categories")}
        >
          <Layers size={18} /> <span>Categories</span>
        </li>

        <li
          className={activeTab === "logs" ? styles.active : ""}
          onClick={() => setActiveTab("logs")}
        >
          <Database size={18} /> <span>Upload Logs</span>
        </li>

        {/* ✅ USERS TAB ADDED */}
        <li
          className={activeTab === "users" ? styles.active : ""}
          onClick={() => setActiveTab("users")}
        >
          <Users size={18} /> <span>Users</span>
        </li>
      </ul>
    </nav>
  );
};

export default AdminSidebar;
