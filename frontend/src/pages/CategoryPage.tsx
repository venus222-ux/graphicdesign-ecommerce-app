import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import ProductCard from "../components/Product/ProductCard";
import { Product } from "../types";

const CategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  useEffect(() => {
    if (!slug) return;

    setLoading(true);

    fetch(`/api/categories/${slug}/products?page=${page}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data.data || []);
        setCategoryName(data.category || "");
        setLastPage(data.meta?.last_page || 1);
      })
      .catch((err) => console.error("Failed to load products", err))
      .finally(() => setLoading(false));
  }, [slug, page]);

  const handleNext = () => {
    if (page < lastPage) setPage((p) => p + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((p) => p - 1);
  };

  if (loading) return <p>Loading products...</p>;
  if (!products.length) return <p>No products found in this category.</p>;

  return (
    <div className="container py-4">
      <h2 className="mb-4">{categoryName}</h2>

      <div className="row g-3">
        {products.map((product) => (
          <div key={product.id} className="col-6 col-md-4 col-lg-3">
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="d-flex justify-content-center gap-2 mt-4">
        <button
          className="btn btn-outline-primary"
          onClick={handlePrev}
          disabled={page === 1}
        >
          Previous
        </button>
        <span className="align-self-center">
          Page {page} of {lastPage}
        </span>
        <button
          className="btn btn-outline-primary"
          onClick={handleNext}
          disabled={page === lastPage}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CategoryPage;
