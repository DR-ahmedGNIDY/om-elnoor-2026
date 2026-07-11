// ─────────────────────────────────────────────────────────────
// src/types/index.ts
// Central type definitions for the entire application.
//
// All types are plain serialisable objects (DTOs) — they never
// import from @prisma/client directly so they are safe to use
// in both Server Components and Client Components without
// bundling Prisma into the client bundle.
// ─────────────────────────────────────────────────────────────

// ── Core DTOs ─────────────────────────────────────────────────
// These mirror the Prisma schema but are fully decoupled from it.
// Dates are typed as strings because JSON serialisation turns
// Date objects into ISO strings before they reach the client.

export type AdminDTO = {
  id:        string;
  username:  string;
  createdAt: string;
  updatedAt: string;
};

export type CategoryDTO = {
  id:        string;
  name:      string;
  slug:      string;
  imageUrl:  string;
  createdAt: string;
  updatedAt: string;
};

/** Category with the number of products in it (computed at query time) */
export type CategoryWithCountDTO = CategoryDTO & {
  productCount: number;
};

export type ProductDTO = {
  id:            string;
  name:          string;
  slug:          string;
  description:   string;
  categoryId:    string;
  images:        string[];
  originalPrice: number;
  discountPrice: number | null;
  /** Always derived — never stored. Computed as Math.round((1 - discountPrice/originalPrice) * 100) */
  discountPercent: number;
  available:     boolean;
  isFeatured:    boolean;
  isOffer:       boolean;
  createdAt:     string;
  updatedAt:     string;
};

/** Product with its parent category name and slug included */
export type ProductWithCategoryDTO = ProductDTO & {
  category: {
    id:   string;
    name: string;
    slug: string;
  };
};

export type SettingsDTO = {
  id:             string;
  whatsappNumber: string;
  facebookUrl:    string;
  instagramUrl:   string;
  tiktokUrl:      string;
  telegramUrl:    string;
  updatedAt:      string;
};

// ── Cart ──────────────────────────────────────────────────────

export type CartItem = {
  product:  ProductWithCategoryDTO;
  quantity: number;
};

// ── API response envelope ─────────────────────────────────────

export type ApiSuccess<T> = {
  success: true;
  data:    T;
};

export type ApiError = {
  success:      false;
  error:        string;
  /** Field-level validation errors from Zod */
  fieldErrors?: Record<string, string[]>;
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ── Form input types ──────────────────────────────────────────
// These are used with React Hook Form and Zod resolvers.

export type CategoryFormValues = {
  name:     string;
  imageUrl: string;
};

export type ProductFormValues = {
  name:          string;
  description:   string;
  categoryId:    string;
  /** Already-saved image URLs (persisted in DB) */
  images:        string[];
  originalPrice: number;
  discountPrice: number | null;
  available:     boolean;
  isFeatured:    boolean;
  isOffer:       boolean;
};

export type SettingsFormValues = {
  whatsappNumber: string;
  facebookUrl:    string;
  instagramUrl:   string;
  tiktokUrl:      string;
  telegramUrl:    string;
};

export type LoginFormValues = {
  username: string;
  password: string;
};

// ── Dashboard ─────────────────────────────────────────────────

export type DashboardStats = {
  totalProducts:    number;
  totalCategories:  number;
  featuredProducts: number;
  activeOffers:     number;
};

// ── Upload ────────────────────────────────────────────────────

export type UploadResponse = {
  url:      string;
  filename: string;
};

// ── Pagination ────────────────────────────────────────────────

export type PaginatedResult<T> = {
  items:      T[];
  total:      number;
  page:       number;
  pageSize:   number;
  totalPages: number;
};

export type ProductFilters = {
  categoryId?:   string;
  categorySlug?: string;
  available?:    boolean;
  isFeatured?:   boolean;
  isOffer?:      boolean;
  search?:       string;
  page?:         number;
  pageSize?:     number;
};
