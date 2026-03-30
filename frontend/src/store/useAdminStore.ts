// src/store/useAdminStore.ts
import { create } from "zustand";
import API from "../api";
import { toast } from "react-toastify";

interface Category {
  id: number;
  name: string;
  slug: string;
}

interface Product {
  id: number;
  title: string;
  short_description: string;
  description: string;
  price: number;
  asset_type: string;
  category_id: number;
  category: Category | null;
  is_published: boolean;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface AdminState {
  categories: Category[];
  products: Product[];
  pagination: PaginationMeta | null;
  isLoadingProducts: boolean;
  isLoadingCategories: boolean;
  searchTerm: string;
  currentPage: number;
  perPage: number;

  productForm: Partial<Product>;
  editingProduct: Product | null;

  fetchCategories: () => Promise<void>;
  fetchProducts: (page?: number, search?: string) => Promise<void>;

  setSearchTerm: (term: string) => void;
  setCurrentPage: (page: number) => void;

  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;

  createOrUpdateProduct: () => Promise<void>;
  deleteProduct: (id: number) => Promise<void>;

  setEditingProduct: (product: Product | null) => void;
  updateProductForm: (updates: Partial<Product>) => void;
  resetProductForm: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  categories: [],
  products: [], // ← Must start as empty array
  pagination: null,
  isLoadingProducts: false,
  isLoadingCategories: false,
  searchTerm: "",
  currentPage: 1,
  perPage: 10,

  productForm: { is_published: false },
  editingProduct: null,

  fetchCategories: async () => {
    set({ isLoadingCategories: true });
    try {
      const res = await API.get("/admin/categories");
      set({ categories: res.data || [] });
    } catch (err) {
      toast.error("Failed to fetch categories");
    } finally {
      set({ isLoadingCategories: false });
    }
  },

  fetchProducts: async (page = 1, search = "") => {
    set({ isLoadingProducts: true });
    try {
      const res = await API.get("/admin/products", {
        params: {
          page,
          per_page: get().perPage,
          search: search || undefined, // don't send empty string
        },
      });

      set({
        products: res.data.data || [], // ← Safe fallback
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
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to fetch products");
      set({ products: [], pagination: null }); // ← Reset on error
    } finally {
      set({ isLoadingProducts: false });
    }
  },

  setSearchTerm: (term) => {
    set({ searchTerm: term, currentPage: 1 });
    get().fetchProducts(1, term);
  },

  setCurrentPage: (page) => {
    set({ currentPage: page });
    get().fetchProducts(page);
  },

  addCategory: async (name: string) => {
    try {
      const res = await API.post("/admin/categories", { name });
      set((state) => ({ categories: [...state.categories, res.data] }));
      toast.success("Category created");
    } catch (err) {
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
      toast.success("Category removed");
    } catch (err) {
      toast.error("Category in use or error occurred");
    }
  },

  createOrUpdateProduct: async () => {
    const { productForm, editingProduct, fetchProducts } = get();
    try {
      if (editingProduct) {
        await API.put(`/admin/products/${editingProduct.id}`, productForm);
        toast.success("Product updated successfully");
      } else {
        await API.post("/admin/products", productForm);
        toast.success("Product created successfully");
      }
      await fetchProducts();
      get().resetProductForm();
    } catch (err: any) {
      console.error("Product save error:", err.response?.data);

      // Show better error message from Laravel
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors ||
        "Failed to save product. Check all required fields.";

      toast.error(errorMessage);
    }
  },

  deleteProduct: async (id: number) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await API.delete(`/admin/products/${id}`);
      await get().fetchProducts();
      toast.success("Product deleted");
    } catch (err) {
      toast.error("Delete failed");
    }
  },

  setEditingProduct: (product) => {
    set({
      editingProduct: product,
      productForm: product
        ? { ...product, category_id: product.category?.id }
        : { is_published: false },
    });
  },

  updateProductForm: (updates) =>
    set((state) => ({
      productForm: { ...state.productForm, ...updates },
    })),

  resetProductForm: () =>
    set({
      editingProduct: null,
      productForm: { is_published: false },
    }),
}));
