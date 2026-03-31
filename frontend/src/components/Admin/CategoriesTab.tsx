import React, { useState } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import dashStyles from "../../styles/AdminDashboard.module.css";
import catStyles from "../../styles/CategoriesTab.module.css"; // The new module
import { Plus, Trash2, X, Folder } from "lucide-react";

const CategoriesTab: React.FC = () => {
  const { categories, addCategory, deleteCategory } = useAdminStore();
  const [catName, setCatName] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;
    addCategory(catName);
    setCatName("");
  };

  return (
    <div className={dashStyles.dashboardGrid}>
      <div className={dashStyles.inventorySection}>
        <div className={dashStyles.glassCard}>
          <div className={dashStyles.cardHeader}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Folder className={dashStyles.statusOn} size={20} />
              <h3>Managed Categories</h3>
            </div>
            <span className={dashStyles.catBadge}>
              {categories.length} Total
            </span>
          </div>

          <div className={dashStyles.tableArea}>
            <div className={catStyles.categoryGrid}>
              {categories.map((c) => (
                <div key={c.id} className={catStyles.categoryCard}>
                  <span className={catStyles.categoryName}>{c.name}</span>
                  <span className={dashStyles.secondaryText}>Assets: --</span>
                  <button
                    onClick={() => deleteCategory(c.id)}
                    title="Delete Category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}

              {categories.length === 0 && (
                <div
                  className={dashStyles.emptyState}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <Folder size={40} opacity={0.3} />
                  <p>No categories found. Create one to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <aside className={dashStyles.sideControls}>
        <div className={dashStyles.glassCard}>
          <h3>Quick Create</h3>
          <p
            className={dashStyles.secondaryText}
            style={{ marginBottom: "1rem" }}
          >
            Add a new category label to organize your assets.
          </p>

          <form className={catStyles.inputGroup} onSubmit={handleSubmit}>
            <input
              className={dashStyles.formInput} // Using global form input style
              placeholder="E.g. Vector Art"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              style={{
                padding: "10px",
                borderRadius: "8px",
                border: "1px solid var(--border)",
                flex: 1,
              }}
            />
            <button type="submit" className={catStyles.addBtn}>
              <Plus size={20} />
            </button>
          </form>

          <div className={catStyles.tagCloud}>
            {categories.map((c) => (
              <span key={c.id} className={catStyles.tagItem}>
                {c.name}
                <X size={12} onClick={() => deleteCategory(c.id)} />
              </span>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
};

export default CategoriesTab;
