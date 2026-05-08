import React, { useState, useCallback, useRef } from "react";
import { useAdminStore } from "../../store/useAdminStore";
import {
  FiUpload,
  FiX,
  FiFile,
  FiImage,
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

  const assetDropRef = useRef<HTMLDivElement>(null);
  const [imageDragActive, setImageDragActive] = useState(false);
  const [assetDragActive, setAssetDragActive] = useState(false);

  const previewImages = productForm.preview_images ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createOrUpdateProduct();
  };

  const handleCancel = () => {
    setEditingProduct(null);
    resetProductForm();
  };

  // ================= MULTIPLE PREVIEW IMAGES =================
  const handleMultipleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setImageDragActive(false);

      const droppedFiles = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (droppedFiles.length > 0) {
        updateProductForm({
          preview_images: [
            ...(productForm.preview_images || []),
            ...droppedFiles,
          ],
        });
      }
    },
    [updateProductForm, productForm.preview_images],
  );

  const handleMultipleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(e.target.files || []).filter((file) =>
        file.type.startsWith("image/"),
      );

      if (selectedFiles.length > 0) {
        updateProductForm({
          preview_images: [
            ...(productForm.preview_images || []),
            ...selectedFiles,
          ],
        });
      }
    },
    [updateProductForm, productForm.preview_images],
  );

  const removeNewImage = (index: number) => {
    const updatedFiles = [...(productForm.preview_images || [])];
    updatedFiles.splice(index, 1);
    updateProductForm({
      preview_images: updatedFiles.length > 0 ? updatedFiles : null,
    });
  };

  // ================= ASSET FILE =================
  const handleAssetFile = useCallback(
    (file: File | undefined) => {
      if (file) updateProductForm({ asset_file: file });
    },
    [updateProductForm],
  );

  const removeAsset = () => updateProductForm({ asset_file: null });

  // ================= DRAG & DROP HELPERS =================
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

        {/* DETAILS */}
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
            {/* Multiple Preview Images - FIXED */}
            <div className={productStyles.uploadBox}>
              <label>
                Preview Images <small>(Multiple)</small>
              </label>
              <div
                className={`${productStyles.dropzone} ${
                  imageDragActive ? productStyles.dropzoneActive : ""
                }`}
                onDragOver={(e) => handleDragOver(e, setImageDragActive)}
                onDragLeave={(e) => handleDragLeave(e, setImageDragActive)}
                onDrop={handleMultipleDrop}
              >
                {/* Existing Images */}
                {editingProduct?.preview_urls && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "12px",
                    }}
                  >
                    {(Array.isArray(editingProduct.preview_urls)
                      ? editingProduct.preview_urls
                      : [editingProduct.preview_urls]
                    ).map((url: string, i: number) => (
                      <img
                        key={i}
                        src={url}
                        alt={`Existing ${i}`}
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                    ))}
                  </div>
                )}

                {/* New Uploaded Images */}
                {previewImages.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                      marginBottom: "12px",
                    }}
                  >
                    {previewImages.map((file, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`New ${i}`}
                          style={{
                            width: "80px",
                            height: "80px",
                            objectFit: "cover",
                            borderRadius: "8px",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(i)}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            background: "red",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "20px",
                            height: "20px",
                            cursor: "pointer",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className={productStyles.uploadPlaceholder}>
                  <FiImage size={32} />
                  <span>Drag & drop or click to upload multiple images</span>
                  <small>PNG, JPG, WEBP, GIF up to 5MB each</small>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleMultipleSelect}
                  className={productStyles.fileInput}
                />
              </div>
            </div>

            {/* Asset File */}
            <div className={productStyles.uploadBox}>
              <label>Asset File</label>
              <div
                ref={assetDropRef}
                className={`${productStyles.dropzone} ${
                  assetDragActive ? productStyles.dropzoneActive : ""
                }`}
                onDragOver={(e) => handleDragOver(e, setAssetDragActive)}
                onDragLeave={(e) => handleDragLeave(e, setAssetDragActive)}
                onDrop={(e) => {
                  const file = e.dataTransfer.files[0];
                  handleAssetFile(file);
                }}
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
                    >
                      <FiX />
                    </button>
                  </div>
                ) : editingProduct?.asset_url ? (
                  <div className={productStyles.fileInfo}>
                    <FiFile size={24} />
                    <div>
                      <strong>Existing File</strong>
                      <small>Attached previously</small>
                    </div>
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
