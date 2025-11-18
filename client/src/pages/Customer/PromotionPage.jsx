import {
  Eye,
  Search,
  SquarePen,
  Trash,
  X,
  PlusCircle,
  Percent,
  Filter,
  Clock,
  ChevronDown,
} from "lucide-react";
//components
import Pagination from "../../components/buttons/Pagination";
//hook
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce.js";
//API
import { getPromotions } from "../../services/promotions/promotionAPI.js";
//model
import { PromotionDetailsModel } from "../../components/models/Promotions/PromotionDetailsModel";
import { Loader } from "../../components/models/Loaders/Loader.jsx";
import { formatDate } from "../../utils/formatDate.js";

export const PromotionPage = () => {
  const [message, setMessage] = useState("");

  // Search states
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 500);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [promotions, setPromotions] = useState([]);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt-desc");

  // Modal states
  const [selectedId, setSelectedId] = useState(null);
  const [openDetails, setOpenDetails] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State cho dropdown
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Load promotions with filtering and sorting
  const loadPromotions = useCallback(
    async (page, search) => {
      setIsLoading(true);
      try {
        const [sortField, sortOrder] = sortBy.split("-");

        // Đảm bảo pageSize hợp lệ trước khi gọi API
        const itemsPerPage = pageSize > 0 ? pageSize : 10;

        const response = await getPromotions(
          page,
          itemsPerPage,
          search,
          statusFilter,
          sortField,
          sortOrder
        );

        if (!response.success) {
          setPromotions([]);
          setMessage(response.message);
          setTotalItems(0);
          setTotalPages(0);
          setPageSize(0);
          setCurrentPage(1);
          setIsLoading(false);
          return;
        }

        setPromotions(response.promotions);
        setTotalItems(response.pagination.totalItems);
        setTotalPages(response.pagination.totalPages);
        setPageSize(response.pagination.pageSize);
        setCurrentPage(page);
        setMessage(""); // Clear message on success
      } catch (err) {
        console.error("Error loading promotions:", err);
        setMessage("Failed to load promotions or server error.");
        setPromotions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter, pageSize, sortBy]
  );

  // Load initial data
  useEffect(() => {
    loadPromotions(1, "");
  }, [loadPromotions]);

  // Handle search changes
  useEffect(() => {
    if (debounceSearch.length > 1 || debounceSearch.length === 0) {
      loadPromotions(1, debounceSearch);
    }
  }, [debounceSearch, loadPromotions]);

  // Handle filter changes
  useEffect(() => {
    loadPromotions(1, debounceSearch);
  }, [statusFilter, sortBy, loadPromotions, debounceSearch]);

  // Handle page change
  const handlePageChange = async (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      await loadPromotions(page, debounceSearch);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Logic kiểm tra trạng thái khuyến mãi
  const getPromotionStatus = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (now < start) {
      return {
        text: "Upcoming",
        color: "text-yellow-700 bg-yellow-100 border-yellow-300",
      };
    }
    if (now > end) {
      return {
        text: "Expired",
        color: "text-red-700 bg-red-100 border-red-300",
      };
    }
    if (promotion.usageLimit && promotion.usageCount >= promotion.usageLimit) {
      return {
        text: "Fully Used",
        color: "text-gray-700 bg-gray-100 border-gray-300",
      };
    }
    return {
      text: "Active",
      color: "text-green-700 bg-green-100 border-green-300",
    };
  };

  const handleSee = (promotionId) => {
    setSelectedId(promotionId);
    setOpenDetails(true);
  };
  // Hàm chọn Filter
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    setIsFilterDropdownOpen(false);
  };

  // Hàm chọn Sort By
  const handleSortByChange = (sortOption) => {
    setSortBy(sortOption);
    setIsSortDropdownOpen(false);
  };

  // --- Render Component ---

  // Dữ liệu cho Status Filter Dropdown (Thêm "Fully Used")
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "upcoming", label: "Upcoming" },
    { value: "fully-used", label: "Fully Used" },
  ];

  // Dữ liệu cho Sort By Dropdown
  const sortOptions = [
    { value: "createdAt-desc", label: "Newest First" },
    { value: "createdAt-asc", label: "Oldest First" },
    { value: "startDate-asc", label: "Start Date (Asc)" },
    { value: "startDate-desc", label: "Start Date (Desc)" },
    { value: "endDate-asc", label: "End Date (Asc)" },
    { value: "endDate-desc", label: "End Date (Desc)" },
  ];

  const currentStatusLabel =
    statusOptions.find((opt) => opt.value === statusFilter)?.label ||
    "All Status";
  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || "Newest First";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Title & Controls */}
        <div className="flex items-center justify-between w-full pt-4 md:pt-8">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center gap-2">
            <Percent className="text-blue-600 w-8 h-8" />
            Promotions
          </h1>
        </div>

        <hr className="my-6 border-t border-gray-200" />

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-2/5 max-w-lg">
            <Search
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by code or description..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-10 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            />
            {search && (
              <X
                className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-black"
                onClick={() => setSearch("")}
                size={20}
              />
            )}
          </div>

          {/* Filters and Sorts Dropdowns */}
          <div className="flex gap-3 w-full md:w-auto justify-end">
            {/* Status Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsFilterDropdownOpen(!isFilterDropdownOpen);
                  setIsSortDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 transition duration-150 text-gray-700 font-medium text-sm"
              >
                <Filter size={18} />
                <span className="font-semibold text-gray-900">
                  {currentStatusLabel}
                </span>
                <ChevronDown
                  size={16}
                  className={`ml-1 transition-transform ${
                    isFilterDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {isFilterDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white z-20 border border-gray-200">
                  {statusOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleStatusFilterChange(option.value)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        statusFilter === option.value
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsSortDropdownOpen(!isSortDropdownOpen);
                  setIsFilterDropdownOpen(false);
                }}
                className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-100 transition duration-150 text-gray-700 font-medium text-sm"
              >
                <Clock size={18} />
                <span className="font-semibold text-gray-900">
                  {currentSortLabel}
                </span>
                <ChevronDown
                  size={16}
                  className={`ml-1 transition-transform ${
                    isSortDropdownOpen ? "rotate-180" : "rotate-0"
                  }`}
                />
              </button>

              {isSortDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white z-20 border border-gray-200">
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleSortByChange(option.value)}
                      className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                        sortBy === option.value
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <hr className="my-6 border-t border-gray-200" />

        {/* Promotion Cards / Loader / Message */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader />
          </div>
        ) : promotions.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg border border-gray-200">
            <p className="text-xl text-red-600 font-semibold">
              {message || "No promotions found matching your criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {promotions.map((promotion) => {
              const status = getPromotionStatus(promotion);
              const maxDiscount = promotion.maxDiscountAmount
                ? formatCurrency(promotion.maxDiscountAmount)
                : "No Limit";

              return (
                <div
                  key={promotion._id}
                  className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300"
                >
                  {/* Status Banner */}
                  <div
                    className={`text-center py-2 text-sm font-bold border-b ${status.color}`}
                  >
                    {status.text}
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-extrabold text-xl text-gray-900 mb-1 line-clamp-1">
                          {promotion.promotionCode}
                        </h3>
                        <p className="text-sm text-blue-600 font-semibold">
                          {promotion.discountType === "percent"
                            ? `${promotion.discountValue}% OFF`
                            : `Reduce ${formatCurrency(
                                promotion.discountValue
                              )}`}
                        </p>
                      </div>
                      <span className="text-xs font-medium bg-neutral-100 px-2 py-1 rounded-full border border-neutral-300 shrink-0">
                        {promotion.rank || "All Ranks"}
                      </span>
                    </div>

                    <div className="space-y-2 mb-4 text-sm text-gray-700 border-t pt-3">
                      <p className="flex justify-between items-center">
                        <span className="font-medium">Max Discount:</span>
                        <span className="font-bold text-gray-800">
                          {maxDiscount}
                        </span>
                      </p>
                      <p className="flex justify-between items-center">
                        <span className="font-medium">Valid Until:</span>
                        <span className="text-gray-600">
                          {formatDate(promotion.endDate, "dd/mm/yyyy HH:MM")}
                        </span>
                      </p>
                      <p className="flex justify-between items-center">
                        <span className="font-medium">Usage:</span>
                        <span className="font-bold text-gray-800">
                          {promotion.usageCount || 0} /{" "}
                          {promotion.usageLimit || "∞"}
                        </span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end items-center pt-3 border-t">
                      <button
                        onClick={() => handleSee(promotion._id)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition duration-150"
                        title="View Details"
                      >
                        <Eye size={20} />
                      </button>
                      {/* Thêm nút Edit/Delete (Giả định) */}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              totalItems={totalItems}
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              itemsPerPage={pageSize}
            />
          </div>
        )}

        {openDetails && (
          <PromotionDetailsModel
            promotionId={selectedId}
            setOpenDetails={setOpenDetails}
          />
        )}
      </div>
    </div>
  );
};
