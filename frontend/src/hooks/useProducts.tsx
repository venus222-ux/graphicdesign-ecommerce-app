import { useInfiniteQuery } from "@tanstack/react-query";
import API from "../api";
import { useMarketplaceStore } from "../store/useMarketplaceStore";
import { useDebounce } from "./useDebounce";

// 👉 tip pentru Laravel pagination (RECOMANDAT)
type LaravelPagination<T> = {
  data: T[];
  current_page: number;
  next_page_url: string | null;
  total: number;
};

export const useProducts = () => {
  const filters = useMarketplaceStore();

  const debouncedSearch = useDebounce(filters.search, 400);

  return useInfiniteQuery({
    queryKey: [
      "products",
      debouncedSearch,
      filters.category,
      filters.minPrice,
      filters.maxPrice,
      filters.assetType,
      filters.sort,
    ],

    // ✅ OBLIGATORIU în v5
    initialPageParam: 1,

    queryFn: async ({ pageParam }) => {
      const res = await API.get("/search", {
        params: {
          page: pageParam,
          q: debouncedSearch,
          category: filters.category,
          min_price: filters.minPrice,
          max_price: filters.maxPrice,
          asset_type: filters.assetType,
          sort: filters.sort,
        },
      });

      return res.data as LaravelPagination<any>;
    },

    getNextPageParam: (lastPage) => {
      return lastPage.next_page_url ? lastPage.current_page + 1 : undefined;
    },

    // 🧠 CACHE STRATEGY (PRO LEVEL)
    staleTime: 1000 * 60 * 2, // 2 min → nu refetch
    gcTime: 1000 * 60 * 10, // 10 min → cache ținut în memorie

    refetchOnWindowFocus: false,
  });
};

/***
 * 👉 fetch de produse din API
👉 cu filtre + search
👉 cu infinite scroll (pagination automată)
👉 cu cache inteligent (React Query)

🧠 Ce face, pe scurt
👉 Îți aduce produse din backend în pagini (page 1, 2, 3…)
👉 Le combină automat pentru infinite scroll
👉 Reface request-ul când schimbi filtrele
👉 Evită spam-ul de request-uri (debounce + cache)
 */
