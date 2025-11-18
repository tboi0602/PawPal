import { Search } from "lucide-react";
import { Card } from "../../components/models/Products/Card";
import { BackToTop } from "../../components/buttons/BackToTop";
import { Filter } from "../../components/models/Products/Filter";
import { getProducts } from "../../services/shopping/productAPI";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "../../components/models/Loaders/Loader";

// Component Loader nhỏ gọn cho button
const ButtonLoader = () => (
  <div className="flex items-center space-x-2">
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      ></path>
    </svg>
    <span>Loading...</span>
  </div>
);

export const ProductPage = () => {
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [products, setProducts] = useState([]);

  // Tách biệt trạng thái loading cho lần tải ban đầu/tìm kiếm (full loading)
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  // Trạng thái loading riêng cho nút "Load More"
  const [isLoadMoreLoading, setIsLoadMoreLoading] = useState(false);

  // Hàm tải thêm sản phẩm (cho Load More)
  const loadMoreProducts = useCallback(async (page, search) => {
    setIsLoadMoreLoading(true);
    setMessage("");

    try {
      const dataRes = await getProducts(page, 20, search);
      if (dataRes.success) {
        setProducts((prev) => [...prev, ...dataRes.products]);
        setTotalPages(dataRes.pagination.totalPages);
        setCurrentPage(dataRes.pagination.currentPage);
      } else {
        setMessage(dataRes.message || "Failed to load more products.");
      }
    } catch (error) {
      console.error("Load More failed:", error);
      setMessage("An unexpected error occurred while loading more products.");
    } finally {
      setIsLoadMoreLoading(false);
    }
  }, []);

  const loadProducts = useCallback(
    async (page, search, categories, minPrice, maxPrice) => {
      setIsInitialLoading(true);
      setMessage("");
      setProducts([]);

      try {
        const dataRes = await getProducts(
          page,
          20,
          search,
          categories,
          minPrice,
          maxPrice
        );
        if (!dataRes.success || dataRes.products.length === 0) {
          setProducts([]);
          setMessage(
            dataRes.message || "No products found matching your criteria."
          );
          setTotalPages(0);
          setCurrentPage(1);
          return;
        }

        setProducts(dataRes.products);
        setTotalPages(dataRes.pagination.totalPages);
        setCurrentPage(dataRes.pagination.currentPage);
      } catch (error) {
        console.error("Initial load failed:", error);
        setMessage("An unexpected error occurred while fetching products.");
      } finally {
        setIsInitialLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    loadProducts(1, search);
  }, [loadProducts]);

  // Xử lý tìm kiếm khi Enter
  const handleSearchSubmit = () => {
    loadProducts(1, search);
  };

  const handleLoadMoreProducts = (page) => {
    if (page >= 1 && page <= totalPages && !isLoadMoreLoading) {
      loadMoreProducts(page, search);
    }
  };

  const handleFilters = (categories, minPrice, maxPrice) => {
    loadProducts(1, search, categories, minPrice, maxPrice);
  };

  return (
    <>
      <Filter filterProduct={handleFilters} />
      <div className="min-h-screen w-full bg-white">
        <BackToTop />
        <div className="flex flex-col gap-8 px-4 md:px-6 py-8 md:ml-64">
          {/* Header */}
          <div className="max-w-7xl">
            <h1 className="text-4xl font-bold text-black mb-2">Products</h1>
            <p className="text-gray-600">
              Browse our collection of premium pet products
            </p>
          </div>

          {/* Search Bar */}
          <div className="w-full flex items-center justify-center mb-4">
            <div className="w-full md:w-2/3 lg:w-1/2 flex items-center border border-gray-300 rounded-lg overflow-hidden bg-white">
              <Search className="mx-4 text-gray-400 shrink-0" size={20} />
              <input
                type="text"
                className="w-full p-3 outline-none text-black placeholder-gray-400"
                placeholder="Search products..."
                value={search}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearchSubmit();
                  }
                }}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button
                onClick={handleSearchSubmit}
                className="px-4 py-3 bg-black text-white hover:bg-gray-900 transition duration-200 shrink-0 font-semibold"
                disabled={isInitialLoading}
              >
                Search
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isInitialLoading && products.length === 0 ? (
            <div className="w-full flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <>
              {/* Products Grid */}
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <div key={product._id}>
                      <Card product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <p className="text-lg text-gray-600 font-medium">
                    {message || "No products found."}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Load More Button */}
          {currentPage < totalPages && (
            <div className="flex justify-center py-8">
              <button
                onClick={() => handleLoadMoreProducts(currentPage + 1)}
                className={`px-8 py-3 rounded-lg transition-colors font-semibold ${
                  isLoadMoreLoading
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-900"
                }`}
                disabled={isLoadMoreLoading}
              >
                {isLoadMoreLoading ? "Loading..." : "Load More Products"}
              </button>
            </div>
          )}

          {!isInitialLoading &&
            products.length > 0 &&
            currentPage >= totalPages && (
              <p className="text-center text-gray-600 py-8 italic">
                All products loaded
              </p>
            )}
        </div>
      </div>
    </>
  );
};
