import { create } from "zustand";
import API from "../api";
import { toast } from "react-toastify";
import type { OrderFilters } from "../types";
import type {
  Category,
  Product,
  PaginationMeta,
  ProductFormData,
  MongoLog,
} from "../types";

interface AdminState {
  /* ================= DATA ================= */
  categories: Category[];
  products: Product[];
  logs: MongoLog[];
  users: any[];
  orders: any[];
  refunds: any[];

  /* ================= PAGINATION ================= */
  pagination: PaginationMeta | null;
  paginationLogs: PaginationMeta | null;

  /* ================= UI STATE ================= */
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  isLoadingLogs: boolean;

  searchTerm: string;

  currentPage: number;
  currentPageLogs: number;

  perPage: number;

  activeTab: "products" | "logs";

  /* ================= PRODUCT FORM ================= */
  productForm: ProductFormData;
  editingProduct: Product | null;

  /* ================= USERS ================= */
  setUsers: (users: any[]) => void;
  fetchUsers: () => Promise<void>;
  deleteUser: (id: number) => Promise<void>;

  /* ================= CATEGORIES ================= */
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  /* ================= PRODUCTS ================= */
  fetchProducts: (page?: number, search?: string) => Promise<void>;
  createOrUpdateProduct: () => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;

  /* ================= LOGS ================= */
  fetchLogs: (page?: number, search?: string) => Promise<void>;
  deleteLog: (id: string) => Promise<void>;
  exportLogs: () => Promise<void>;

  /* ================= ORDERS ================= */
  fetchOrders: (page?: number, filters?: OrderFilters) => Promise<void>;
  fetchOrderById: (id: number) => Promise<void>;
  selectedOrder: any | null;
  setSelectedOrder: (o: any | null) => void;
  downloadInvoice: (orderId: number) => Promise<void>;

  /* ================= REFUNDS ================= */
  fetchRefunds: () => Promise<void>;
  refundOrder: (
    orderId: number,
    amount: number,
    reason: string,
  ) => Promise<any>;

  /* ================= SEARCH ================= */
  setSearchTerm: (term: string) => void;

  /* ================= PAGINATION ================= */
  setCurrentPage: (page: number) => void;
  setCurrentPageLogs: (page: number) => void;

  /* ================= TAB ================= */
  setActiveTab: (tab: "products" | "logs") => void;

  /* ================= FORM ================= */
  setEditingProduct: (product: Product | null) => void;
  updateProductForm: (updates: Partial<ProductFormData>) => void;
  resetProductForm: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  /* ================= STATE ================= */
  categories: [],
  products: [],
  logs: [],
  users: [],
  orders: [],
  refunds: [],

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

  /* ================= ORDERS ================= */
  selectedOrder: null,

  setSelectedOrder: (o) => set({ selectedOrder: o }),

  /* ================= USER ORDERS ================= */
  fetchOrders: async (page = 1, filters = {}) => {
    try {
      const res = await API.get("/admin/orders", {
        params: {
          page,
          ...filters,
        },
      });
      set({
        orders: res.data.data ?? res.data.orders ?? res.data ?? [],
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    }
  },

  /* ================= ORDER BY ID ================= */
  fetchOrderById: async (id: number) => {
    try {
      const res = await API.get(`/admin/orders/${id}`);
      set({ selectedOrder: res.data });
      return res.data;
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to fetch order details",
      );
      throw err;
    }
  },

  /* ================= INVOICE DOWNLOAD (ADMIN + USER SAFE) ================= */
  downloadInvoice: async (orderId: number) => {
    try {
      const res = await API.get(`/admin/orders/${orderId}/invoice`, {
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Invoice downloaded");
    } catch (err) {
      console.error(err);
      toast.error("Invoice download failed");
    }
  },

  /* ================= USERS ================= */
  setUsers: (users) => set({ users }),

  fetchUsers: async () => {
    try {
      const res = await API.get("/admin/users");
      set({ users: res.data || [] });
    } catch {
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
    } catch {
      toast.error("Delete failed");
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
    } catch {
      toast.error("Failed to fetch products");
      set({ products: [], pagination: null });
    } finally {
      set({ isLoadingProducts: false });
    }
  },

  createOrUpdateProduct: async () => {
    const { productForm, editingProduct, currentPage, searchTerm } = get();

    try {
      const formData = new FormData();

      // Text fields
      formData.append("title", productForm.title ?? "");
      formData.append("short_description", productForm.short_description ?? "");
      formData.append("description", productForm.description ?? "");
      formData.append("price", String(productForm.price ?? 0));
      formData.append("asset_type", productForm.asset_type ?? "");
      formData.append("category_id", String(productForm.category_id ?? ""));
      formData.append("is_published", productForm.is_published ? "1" : "0");

      // === MULTIPLE PREVIEW IMAGES ===
      if (Array.isArray(productForm.preview_images)) {
        productForm.preview_images.forEach((file) => {
          formData.append("preview_images[]", file); // ← Fixed
        });
      }

      // Asset file
      if (productForm.asset_file instanceof File) {
        formData.append("asset_file", productForm.asset_file);
      }

      const url = editingProduct
        ? `/admin/products/${editingProduct.id}`
        : "/admin/products";

      const method = editingProduct ? "put" : "post";

      await API[method](url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success(editingProduct ? "Product updated" : "Product created");

      await get().fetchProducts(currentPage, searchTerm);
      get().resetProductForm();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Error saving product");
    }
  },

  deleteProduct: async (id: number) => {
    if (!window.confirm("Delete this product?")) return;

    try {
      await API.delete(`/admin/products/${id}`);
      toast.success("Product deleted");
      await get().fetchProducts(get().currentPage, get().searchTerm);
    } catch {
      toast.error("Delete failed");
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
    } catch {
      toast.error("Failed to fetch logs");
    } finally {
      set({ isLoadingLogs: false });
    }
  },

  deleteLog: async (id: string) => {
    if (!window.confirm("Delete log?")) return;

    try {
      await API.delete(`/admin/logs/${id}`);
      toast.success("Log deleted");
      get().fetchLogs(get().currentPageLogs, get().searchTerm);
    } catch {
      toast.error("Delete failed");
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
      link.download = `logs_${new Date().toISOString().slice(0, 10)}.csv`;

      document.body.appendChild(link);
      link.click();
      link.remove();

      toast.success("Exported");
    } catch {
      toast.error("Export failed");
    }
  },

  /* ================= REFUNDS ================= */
  fetchRefunds: async () => {
    try {
      const res = await API.get("/admin/refunds");
      set({ refunds: res.data?.data || res.data || [] });
    } catch {
      console.warn("Refunds not ready yet");
    }
  },

  refundOrder: async (orderId, amount, reason) => {
    try {
      const res = await API.post(`/admin/orders/${orderId}/refund`, {
        amount,
        reason,
      });

      toast.success("Refund processed");

      await get().fetchOrders();
      await get().fetchRefunds();

      return res.data;
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Refund failed");
      throw err;
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

  /* ================= TAB ================= */
  setActiveTab: (tab) => {
    set({ activeTab: tab, searchTerm: "" });

    if (tab === "logs") {
      get().fetchLogs(1);
    } else {
      get().fetchProducts(1);
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
        : { is_published: false, preview_images: null },
    });
  },

  updateProductForm: (updates) =>
    set((state) => ({
      productForm: { ...state.productForm, ...updates },
    })),

  resetProductForm: () =>
    set({
      productForm: { is_published: false, preview_images: null },
      editingProduct: null,
    }),
}));
