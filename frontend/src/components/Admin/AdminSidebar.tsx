import React from "react";
import { LayoutDashboard, Package, Layers } from "lucide-react";
import styles from "../../pages/AdminDashboard.module.css";

interface AdminSidebarProps {
  activeTab: "products" | "categories";
  setActiveTab: (tab: "products" | "categories") => void;
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
      </ul>
    </nav>
  );
};

export default AdminSidebar;
