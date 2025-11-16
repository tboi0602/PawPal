import { Search } from "lucide-react";
import { Card } from "../components/models/Products/Card";
import { BackToTop } from "../components/buttons/BackToTop";
import { Filter } from "../components/models/Products/Filter";
import { getProducts } from "../services/shopping/productAPI";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "../components/models/Loaders/Loader";

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
      <div className="p-16 md:p-16 min-h-screen w-full">
        <BackToTop />
        {/* Điều chỉnh khoảng cách và padding tổng thể */}
        <div className="flex flex-col gap-16 md:ml-64 ">
          {/* Search Bar */}
          <div className="w-full flex items-center justify-center">
            <div className=" w-3/4 lg:w-2/3 flex items-center border border-gray-400 rounded-xl overflow-hidden shadow-md">
              <Search className="mx-4 text-gray-500 shrink-0" />
              <input
                type="text"
                className="w-full p-4 outline-none transition duration-150 rounded-r-xl"
                placeholder="Search for the product you want..."
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
                className="px-6 py-4 bg-black text-white hover:bg-gray-800 transition duration-150 shrink-0"
                disabled={isInitialLoading} // Vô hiệu hóa nút tìm kiếm khi đang tải
              >
                Search
              </button>
            </div>
          </div>

          {/* Hiển thị Loader khi tải lần đầu/tìm kiếm */}
          {isInitialLoading && products.length === 0 ? (
            <div className="w-full flex justify-center items-center h-64">
              <Loader />
            </div>
          ) : (
            <>
              {/* Hiển thị danh sách sản phẩm */}
              {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
                  {products.map((product) => (
                    <div key={product._id}>
                      <Card product={product} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xl text-red-600 font-semibold mt-10">
                  {message || "No products available at the moment."}
                </p>
              )}
            </>
          )}

          {/* Load More Button */}
          <div className="pt-4 pb-16">
            {currentPage < totalPages && (
              <div className="flex justify-center">
                <button
                  onClick={() => handleLoadMoreProducts(currentPage + 1)}
                  className={`px-8 py-3 rounded-lg transition-colors font-semibold shadow-md min-w-[150px]
                    ${
                      isLoadMoreLoading
                        ? "bg-gray-500 text-white cursor-not-allowed"
                        : "bg-black text-white hover:bg-gray-800"
                    }
                  `}
                  disabled={isLoadMoreLoading}
                >
                  {isLoadMoreLoading ? <ButtonLoader /> : "Load More"}
                </button>
              </div>
            )}

            {!isInitialLoading &&
              products.length > 0 &&
              currentPage >= totalPages && (
                <p className="text-center text-gray-600 italic">
                  You've reached the end of the product list.
                </p>
              )}
          </div>
        </div>
      </div>
    </>
  );
};
