import { create } from "zustand";

interface MarketplaceState {
  search: string;
  category: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  assetType: string | null;
  sort: string;

  setSearch: (v: string) => void;
  setFilters: (filters: Partial<MarketplaceState>) => void;
  resetFilters: () => void;
}

export const useMarketplaceStore = create<MarketplaceState>((set) => ({
  search: "",
  category: null,
  minPrice: null,
  maxPrice: null,
  assetType: null,
  sort: "newest",

  setSearch: (search) => set({ search }),

  setFilters: (filters) =>
    set((state) => ({
      ...state,
      ...filters,
    })),

  resetFilters: () =>
    set({
      search: "",
      category: null,
      minPrice: null,
      maxPrice: null,
      assetType: null,
      sort: "newest",
    }),
}));

/**
 * → Zustand store se actualizează
→ useProducts Hook detectează schimbarea (queryKey)
→ React Query face refetch automat
→ UI se actualizează

🔥 ZERO manual fetch logic în componente
 */
