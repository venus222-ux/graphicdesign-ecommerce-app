import React from "react";
import { useAdminStore } from "../../store/useAdminStore";
import styles from "../../pages/AdminDashboard.module.css";

const ProductForm: React.FC = () => {
  const {
    categories,
    productForm,
    editingProduct,
    updateProductForm,
    setEditingProduct,
    resetProductForm,
    createOrUpdateProduct,
  } = useAdminStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateProduct();
  };

  const handleCancel = () => {
    setEditingProduct(null);
    resetProductForm();
  };

  return (
    <div className={styles.glassCard}>
      <h3>{editingProduct ? "Edit Product" : "Quick Add Product"}</h3>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          placeholder="Product Title"
          value={productForm.title || ""}
          onChange={(e) => updateProductForm({ title: e.target.value })}
          required
        />
        <div className={styles.row}>
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={productForm.price || ""}
            onChange={(e) =>
              updateProductForm({ price: Number(e.target.value) })
            }
            required
          />
          <select
            value={productForm.category_id || ""}
            onChange={(e) =>
              updateProductForm({ category_id: Number(e.target.value) })
            }
            required
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <input
          placeholder="Short Description"
          value={productForm.short_description || ""}
          onChange={(e) =>
            updateProductForm({ short_description: e.target.value })
          }
          required
        />
        <textarea
          placeholder="Full Description"
          rows={4}
          value={productForm.description || ""}
          onChange={(e) => updateProductForm({ description: e.target.value })}
          required
        />
        <select
          value={productForm.asset_type || ""}
          onChange={(e) => updateProductForm({ asset_type: e.target.value })}
          required
        >
          <option value="">Asset Type</option>
          <option value="digital">Digital</option>
          <option value="physical">Physical</option>
          <option value="service">Service</option>
        </select>
        <label className={styles.checkbox}>
          <input
            type="checkbox"
            checked={productForm.is_published || false}
            onChange={(e) =>
              updateProductForm({ is_published: e.target.checked })
            }
          />{" "}
          Is Published
        </label>
        <button type="submit" className={styles.submitBtn}>
          {editingProduct ? "Save Changes" : "Create Product"}
        </button>
        {editingProduct && (
          <button
            type="button"
            onClick={handleCancel}
            className={styles.cancelBtn}
          >
            Cancel
          </button>
        )}
      </form>
    </div>
  );
};

export default ProductForm;
