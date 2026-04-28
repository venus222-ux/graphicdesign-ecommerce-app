import { create } from "zustand";
import API from "../api";
import { toast } from "react-toastify";
import type {
  Category,
  Product,
  PaginationMeta,
  ProductFormData,
  MongoLog,
} from "../types";

interface AdminState {
  categories: Category[];
  products: Product[];
  logs: MongoLog[];
  users: any[]; // 👈 ADDED (or replace with User type if you have it)

  pagination: PaginationMeta | null;
  paginationLogs: PaginationMeta | null;

  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  isLoadingLogs: boolean;

  searchTerm: string;

  currentPage: number;
  currentPageLogs: number;

  perPage: number;

  activeTab: "products" | "logs";

  productForm: ProductFormData;
  editingProduct: Product | null;

  fetchCategories: () => Promise<void>;
  fetchProducts: (page?: number, search?: string) => Promise<void>;
  fetchLogs: (page?: number, search?: string) => Promise<void>;

  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;
  setCurrentPageLogs: (page: number) => void;

  setActiveTab: (tab: "products" | "logs") => void;

  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  createOrUpdateProduct: () => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;

  deleteLog: (id: string) => Promise<void>;
  exportLogs: () => Promise<void>;

  setEditingProduct: (product: Product | null) => void;
  updateProductForm: (updates: Partial<ProductFormData>) => void;
  resetProductForm: () => void;

  // 👇 USERS (ADDED)
  setUsers: (users: any[]) => void;
  fetchUsers: () => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  categories: [],
  products: [],
  logs: [],
  users: [], // 👈 ADDED

  pagination: null,
  paginationLogs: null,

  isLoadingProducts: false,
  isLoadingCategories: false,
  isLoadingLogs: false,

  searchTerm: "",

  currentPage: 1,
  currentPageLogs: 1,

  perPage: 10,

  activeTab: "products",

  productForm: { is_published: false },
  editingProduct: null,

  /* ================= USERS ================= */

  setUsers: (users) => set({ users }),

  fetchUsers: async () => {
    try {
      const res = await API.get("/admin/users");
      set({ users: res.data || [] });
    } catch (err) {
      console.error("Failed to fetch users", err);
      toast.error("Failed to fetch users");
    }
  },

  deleteUser: async (id: number) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await API.delete(`/admin/users/${id}`);

      set((state) => ({
        users: state.users.filter((u) => u.id !== id),
      }));

      toast.success("User deleted");
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Delete failed");
    }
  },

  /* ================= CATEGORIES ================= */

  fetchCategories: async () => {
    set({ isLoadingCategories: true });
    try {
      const res = await API.get("/admin/categories");
      set({ categories: res.data || [] });
    } catch {
      toast.error("Failed to fetch categories");
    } finally {
      set({ isLoadingCategories: false });
    }
  },

  /* ================= PRODUCTS ================= */

  fetchProducts: async (page = 1, search = "") => {
    set({ isLoadingProducts: true });
    try {
      const res = await API.get("/admin/products", {
        params: {
          page,
          per_page: get().perPage,
          search: search || undefined,
        },
      });

      set({
        products: res.data.data || [],
        pagination: res.data.current_page
          ? {
              current_page: res.data.current_page,
              last_page: res.data.last_page,
              per_page: res.data.per_page,
              total: res.data.total,
              from: res.data.from,
              to: res.data.to,
            }
          : null,
        currentPage: res.data.current_page || 1,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch products");
      set({ products: [], pagination: null });
    } finally {
      set({ isLoadingProducts: false });
    }
  },

  /* ================= LOGS ================= */

  fetchLogs: async (page = 1, search = "") => {
    set({ isLoadingLogs: true });
    try {
      const res = await API.get("/admin/logs", {
        params: {
          page,
          per_page: get().perPage,
          search: search || undefined,
        },
      });

      set({
        logs: res.data.data || [],
        paginationLogs: res.data.current_page
          ? {
              current_page: res.data.current_page,
              last_page: res.data.last_page,
              per_page: res.data.per_page,
              total: res.data.total,
              from: res.data.from,
              to: res.data.to,
            }
          : null,
        currentPageLogs: res.data.current_page || 1,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch upload logs");
      set({ logs: [], paginationLogs: null });
    } finally {
      set({ isLoadingLogs: false });
    }
  },

  /* ================= LOG ACTIONS ================= */

  deleteLog: async (id: string) => {
    if (!window.confirm("Delete this upload log?")) return;

    try {
      await API.delete(`/admin/logs/${id}`);
      toast.success("Log deleted successfully");

      if (get().logs.length === 1 && get().currentPageLogs > 1) {
        get().fetchLogs(get().currentPageLogs - 1, get().searchTerm);
      } else {
        get().fetchLogs(get().currentPageLogs, get().searchTerm);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete log");
    }
  },

  exportLogs: async () => {
    try {
      const res = await API.get("/admin/logs/export", {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");

      link.href = url;
      link.setAttribute(
        "download",
        `upload_logs_${new Date().toISOString().slice(0, 10)}.csv`,
      );

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Logs exported successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export logs");
    }
  },

  /* ================= SEARCH ================= */

  setSearchTerm: (term) => {
    set({ searchTerm: term });

    if (get().activeTab === "logs") {
      get().fetchLogs(1, term);
    } else {
      get().fetchProducts(1, term);
    }
  },

  /* ================= PAGINATION ================= */

  setCurrentPage: (page) => {
    set({ currentPage: page });
    get().fetchProducts(page, get().searchTerm);
  },

  setCurrentPageLogs: (page) => {
    set({ currentPageLogs: page });
    get().fetchLogs(page, get().searchTerm);
  },

  /* ================= TAB SWITCH ================= */

  setActiveTab: (tab) => {
    set({ activeTab: tab, searchTerm: "" });

    if (tab === "logs") {
      get().fetchLogs(1);
    } else {
      get().fetchProducts(1);
    }
  },

  /* ================= CATEGORY ================= */

  addCategory: async (name: string) => {
    try {
      const res = await API.post("/admin/categories", { name });
      set((state) => ({
        categories: [...state.categories, res.data],
      }));
      toast.success("Category created");
    } catch {
      toast.error("Error creating category");
    }
  },

  deleteCategory: async (id: number) => {
    if (!window.confirm("Delete this category?")) return;

    try {
      await API.delete(`/admin/categories/${id}`);
      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
      }));
      toast.success("Category deleted");
    } catch {
      toast.error("Error deleting category");
    }
  },

  /* ================= PRODUCTS ACTIONS ================= */
  createOrUpdateProduct: async () => {
    const { productForm, editingProduct, currentPage, searchTerm } = get();

    try {
      const formData = new FormData();

      // ================= BASIC FIELDS =================
      formData.append("title", productForm.title ?? "");
      formData.append("short_description", productForm.short_description ?? "");
      formData.append("description", productForm.description ?? "");
      formData.append("price", String(productForm.price ?? 0));
      formData.append("asset_type", productForm.asset_type ?? "");
      formData.append("category_id", String(productForm.category_id ?? ""));

      formData.append("is_published", productForm.is_published ? "1" : "0");

      // ================= MULTIPLE PREVIEW IMAGES =================
      // ================= MULTIPLE PREVIEW IMAGES - MOST RELIABLE WAY =================
      if (
        Array.isArray(productForm.preview_images) &&
        productForm.preview_images.length > 0
      ) {
        productForm.preview_images.forEach((file) => {
          formData.append("preview_images", file);
        });
      }
      // ================= ASSET FILE (SINGLE) =================
      if (productForm.asset_file && productForm.asset_file instanceof File) {
        formData.append("asset_file", productForm.asset_file);
      }

      // ================= API CALL =================
      if (editingProduct) {
        await API.post(
          `/admin/products/${editingProduct.id}?_method=PUT`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );

        toast.success("Product updated successfully");
      } else {
        await API.post("/admin/products", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        toast.success("Product created successfully");
      }

      // ================= REFRESH =================
      await get().fetchProducts(currentPage, searchTerm);
      get().resetProductForm();
    } catch (err: any) {
      console.error(err.response?.data || err);

      const message =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(", ")
          : "Error saving product");

      toast.error(message);
    }
  },

  deleteProduct: async (id: number) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await API.delete(`/admin/products/${id}`);

      toast.success("Product deleted");

      await get().fetchProducts(get().currentPage, get().searchTerm);
    } catch (err: any) {
      console.error("DELETE PRODUCT ERROR:", err?.response?.data || err);

      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Error deleting product",
      );
    }
  },

  /* ================= FORM ================= */

  setEditingProduct: (product) => {
    set({
      editingProduct: product,
      productForm: product
        ? {
            title: product.title,
            short_description: product.short_description,
            description: product.description,
            price: product.price,
            asset_type: product.asset_type,
            category_id: product.category_id,
            is_published: product.is_published,
            preview_images: null,
            asset_file: product.asset_url || undefined,
          }
        : {
            is_published: false,
            preview_images: null,
          },
    });
  },

  updateProductForm: (updates) => {
    set((state) => ({
      productForm: { ...state.productForm, ...updates },
    }));
  },

  resetProductForm: () => {
    set({
      productForm: { is_published: false, preview_images: null },
      editingProduct: null,
    });
  },
}));
