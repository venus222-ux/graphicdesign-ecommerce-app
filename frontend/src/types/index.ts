// src/types/index.ts

export type Role = "user" | "moderator" | "admin";

/* ================= USER ================= */
export const isValidRole = (role: string): role is Role => {
  return ["user", "moderator", "admin"].includes(role);
};
export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  roles?: { name: string }[];
}

export type Props = {
  users: User[];
  onDelete: (id: number) => void;
};

/* ================= AUTH ================= */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface LoginResponse {
  token: string;
  role: Role;
}

export interface ProfileData {
  id?: number;
  name?: string;
  email: string;
  created_at?: string;

  company_name?: string;
  vat_number?: string;

  address_line_1?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface BillingAddress {
  company_name?: string;
  vat_number?: string;
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface CheckoutRequest {
  items: any[];
  billing?: BillingAddress;
}

export interface FormData {
  email: string;
  password: string;
  password_confirmation: string;
  name?: string;

  company_name?: string;
  vat_number?: string;

  address_line_1?: string;
  address_line_2?: string;

  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export interface ProfileUpdateRequest {
  email: string;
  password?: string;
  password_confirmation?: string;
}

/* ================= GENERIC ================= */

export interface APIMessageResponse {
  message: string;
}

/* ================= CATEGORY ================= */

export interface Category {
  id: number;
  name: string;
  slug: string;
}

/* ================= PRODUCT ================= */
export interface Product {
  id: number;
  title: string;
  short_description: string;
  description: string;
  price?: number;
  asset_type: string;
  category_id: number;
  category?: { name: string } | null;
  is_published: boolean;
  slug: string;
  is_wishlisted?: boolean;

  // Preview Images
  preview_url?: string;
  preview_urls?: string[];
  previews?: Array<{
    id: number;
    url: string;
    name: string;
    size?: number;
  }>;

  // Asset File (ZIP, etc.)
  asset_url?: string; // keep for backward compatibility
  asset?: {
    url: string;
    file_name: string;
    size: number;
    mime_type: string;
  } | null;
}
/* ================= PRODUCT FORM ================= */
export interface ProductFormData {
  title?: string;
  short_description?: string;
  description?: string;
  price?: number;
  asset_type?: string;
  category_id?: number;
  is_published: boolean; // ✅ required and always boolean
  // Single image (optional)
  preview_image?: File | string | null;

  // 🔹 Multiple images support
  preview_images?: File[] | null;

  // Asset file
  asset_file?: File | string | null;
}
/* ================= PAGINATION ================= */

export interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

/* ================= MONGODB UPLOAD LOGS ================= */

export interface MongoLog {
  _id?: string;
  product_id: number | string;
  file_name: string;
  size: number;
  mime: string;
  uploaded_by: number | string;
  ip: string;
  user_agent: string;
  created_at: string;
}

export interface LogsResponse {
  data: MongoLog[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export interface Order {
  id: number;
  total: number;
  status: string;
  refunded_total?: number;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface OrdersResponse {
  data: Order[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface OrderFilters {
  search?: string;
  status?: string;
  start_date?: string;
  end_date?: string;
  per_page?: number;
}
