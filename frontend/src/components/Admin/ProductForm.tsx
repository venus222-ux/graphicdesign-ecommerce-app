import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import {
  FiUpload,
  FiX,
  FiFile,
  FiImage,
  FiTrash2,
  FiFileText,
  FiAlignLeft,
  FiChevronDown,
} from "react-icons/fi";
import dashStyles from "../../styles/AdminDashboard.module.css";
import productStyles from "../../styles/ProductForm.module.css";

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

  // Local preview URL for image to avoid memory leaks
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Refs for drag & drop areas
  const imageDropRef = useRef<HTMLDivElement>(null);
  const assetDropRef = useRef<HTMLDivElement>(null);
  const [imageDragActive, setImageDragActive] = useState(false);
  const [assetDragActive, setAssetDragActive] = useState(false);

  // Update preview URL when preview_image or editingProduct changes
  useEffect(() => {
    if (productForm.preview_image instanceof File) {
      const url = URL.createObjectURL(productForm.preview_image);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (editingProduct?.preview_url) {
      setPreviewUrl(editingProduct.preview_url);
    } else {
      setPreviewUrl(null);
    }
  }, [productForm.preview_image, editingProduct?.preview_url]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateProduct();
  };

  const handleCancel = () => {
    setEditingProduct(null);
    resetProductForm();
  };

  const handleImageFile = useCallback(
    (file: File | undefined) => {
      if (file && file.type.startsWith("image/")) {
        updateProductForm({ preview_image: file });
      } else if (file) {
        alert("Please upload an image file.");
      }
    },
    [updateProductForm],
  );

  const handleAssetFile = useCallback(
    (file: File | undefined) => {
      if (file) {
        updateProductForm({ asset_file: file });
      }
    },
    [updateProductForm],
  );

  // Drag & drop handlers
  const handleDragOver = (
    e: React.DragEvent,
    setActive: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(true);
  };

  const handleDragLeave = (
    e: React.DragEvent,
    setActive: React.Dispatch<React.SetStateAction<boolean>>,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);
  };

  const handleDrop = (
    e: React.DragEvent,
    setActive: React.Dispatch<React.SetStateAction<boolean>>,
    onFile: (file: File) => void,
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setActive(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      onFile(files[0]);
    }
  };

  const removeImage = () => {
    updateProductForm({ preview_image: null });
  };

  const removeAsset = () => {
    updateProductForm({ asset_file: null });
  };

  return (
    <div className={dashStyles.glassCard}>
      <header className={productStyles.formHeader}>
        <div className={productStyles.formTitleGroup}>
          <span className={productStyles.formIcon}>
            {editingProduct ? "📝" : "✨"}
          </span>
          <h3>{editingProduct ? "Edit Product" : "New Product"}</h3>
        </div>
        {editingProduct && (
          <button
            type="button"
            onClick={handleCancel}
            className={productStyles.textBtn}
          >
            Discard Changes
          </button>
        )}
      </header>

      <form className={productStyles.form} onSubmit={handleSubmit}>
        {/* BASIC INFO */}
        <div className={productStyles.formSection}>
          <label className={productStyles.fieldLabel}>Product Identity</label>
          <input
            className={productStyles.mainInput}
            placeholder="e.g. Professional UI Kit 2026"
            value={productForm.title || ""}
            onChange={(e) => updateProductForm({ title: e.target.value })}
            required
          />

          <div className={productStyles.row}>
            <div className={productStyles.inputGroup}>
              <label>Price (USD)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={productForm.price || ""}
                onChange={(e) =>
                  updateProductForm({ price: Number(e.target.value) })
                }
                required
              />
            </div>
            <div className={productStyles.inputGroup}>
              <label>Category</label>
              <select
                value={productForm.category_id || ""}
                onChange={(e) =>
                  updateProductForm({ category_id: Number(e.target.value) })
                }
                required
              >
                <option value="">Select...</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DETAILS (Improved Section) */}
        <div className={productStyles.formSection}>
          <label className={productStyles.fieldLabel}>Details</label>
          <div className={productStyles.detailsCard}>
            <div className={productStyles.detailRow}>
              <div className={productStyles.iconWrapper}>
                <FiFileText size={18} />
              </div>
              <input
                className={productStyles.shortDescInput}
                placeholder="Brief tagline for search results"
                value={productForm.short_description || ""}
                onChange={(e) =>
                  updateProductForm({ short_description: e.target.value })
                }
                required
              />
            </div>
            <div className={productStyles.detailRow}>
              <div className={productStyles.iconWrapper}>
                <FiAlignLeft size={18} />
              </div>
              <textarea
                className={productStyles.descriptionArea}
                placeholder="Tell your customers more about this product..."
                rows={4}
                value={productForm.description || ""}
                onChange={(e) =>
                  updateProductForm({ description: e.target.value })
                }
                required
              />
            </div>
          </div>
        </div>

        {/* MEDIA & DELIVERY */}
        <div className={productStyles.formSection}>
          <label className={productStyles.fieldLabel}>Media & Delivery</label>

          <div className={productStyles.row}>
            <div className={productStyles.selectWrapper}>
              <select
                value={productForm.asset_type || ""}
                onChange={(e) =>
                  updateProductForm({ asset_type: e.target.value })
                }
                className={productStyles.styledSelect}
                required
              >
                <option value="">Asset Type</option>
                <option value="digital">📦 Digital Download</option>
                <option value="physical">📬 Physical Good</option>
                <option value="service">⚙️ Service/License</option>
              </select>
              <FiChevronDown className={productStyles.selectIcon} />
            </div>

            <label className={productStyles.checkboxCard}>
              <input
                type="checkbox"
                checked={productForm.is_published || false}
                onChange={(e) =>
                  updateProductForm({ is_published: e.target.checked })
                }
              />
              <span>Live on Store</span>
            </label>
          </div>

          <div className={productStyles.fileGrid}>
            {/* Preview Image Upload */}
            <div className={productStyles.uploadBox}>
              <label>Preview Image</label>
              <div
                ref={imageDropRef}
                className={`${productStyles.dropzone} ${
                  imageDragActive ? productStyles.dropzoneActive : ""
                }`}
                onDragOver={(e) => handleDragOver(e, setImageDragActive)}
                onDragLeave={(e) => handleDragLeave(e, setImageDragActive)}
                onDrop={(e) =>
                  handleDrop(e, setImageDragActive, handleImageFile)
                }
              >
                {previewUrl ? (
                  <div className={productStyles.previewWithActions}>
                    <img src={previewUrl} alt="Preview" />
                    <button
                      type="button"
                      className={productStyles.removeBtn}
                      onClick={removeImage}
                      aria-label="Remove image"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ) : (
                  <div className={productStyles.uploadPlaceholder}>
                    <FiImage size={32} />
                    <span>Drag & drop or click to upload</span>
                    <small>PNG, JPG, GIF up to 5MB</small>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageFile(e.target.files?.[0])}
                  className={productStyles.fileInput}
                />
              </div>
            </div>

            {/* Asset File Upload */}
            <div className={productStyles.uploadBox}>
              <label>Asset File</label>
              <div
                ref={assetDropRef}
                className={`${productStyles.dropzone} ${
                  assetDragActive ? productStyles.dropzoneActive : ""
                }`}
                onDragOver={(e) => handleDragOver(e, setAssetDragActive)}
                onDragLeave={(e) => handleDragLeave(e, setAssetDragActive)}
                onDrop={(e) =>
                  handleDrop(e, setAssetDragActive, handleAssetFile)
                }
              >
                {productForm.asset_file instanceof File ? (
                  <div className={productStyles.fileInfo}>
                    <FiFile size={24} />
                    <div>
                      <strong>{productForm.asset_file.name}</strong>
                      <small>
                        {(productForm.asset_file.size / 1024).toFixed(0)} KB
                      </small>
                    </div>
                    <button
                      type="button"
                      className={productStyles.removeBtn}
                      onClick={removeAsset}
                      aria-label="Remove file"
                    >
                      <FiX />
                    </button>
                  </div>
                ) : editingProduct?.asset_url ? (
                  <div className={productStyles.fileInfo}>
                    <FiFile size={24} />
                    <div>
                      <strong>Current file attached</strong>
                      <small>from existing product</small>
                    </div>
                    <span className={productStyles.fileStatusTag}>
                      Existing
                    </span>
                  </div>
                ) : (
                  <div className={productStyles.uploadPlaceholder}>
                    <FiUpload size={32} />
                    <span>Drag & drop file here</span>
                    <small>ZIP, PDF, EXE, etc. (max 100MB)</small>
                  </div>
                )}
                <input
                  type="file"
                  onChange={(e) => handleAssetFile(e.target.files?.[0])}
                  className={productStyles.fileInput}
                />
              </div>
            </div>
          </div>
        </div>

        <button type="submit" className={productStyles.submitBtn}>
          {editingProduct ? "Update Product" : "Create Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
