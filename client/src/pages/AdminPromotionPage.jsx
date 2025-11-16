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
  ChevronDown, // Thêm icon ChevronDown cho dropdown
} from "lucide-react";
//components
import Pagination from "../components/buttons/Pagination";
//hook
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce.js";
//API
import {
  getPromotions,
  deletePromotion,
} from "../services/promotions/promotionAPI.js";
//model
import { PromotionDetailsModel } from "../components/models/Promotions/PromotionDetailsModel";
import { EditPromotionModel } from "../components/models/Promotions/EditPromotionModel";
import { AddPromotionModel } from "../components/models/Promotions/AddPromotionModel";
import Swal from "sweetalert2";
import { Loader } from "../components/models/Loaders/Loader.jsx";
import { formatDate } from "../utils/formatDate.js";

export const AdminPromotionPage = () => {
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
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // State cho dropdown
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Load promotions with filtering and sorting
  const loadPromotions = useCallback(
    async (page, search) => {
      setIsLoading(true);
      try {
        // Extract sort field and order
        const [sortField, sortOrder] = sortBy.split("-");

        // Get data from API with filters
        const response = await getPromotions(
          page,
          pageSize,
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

        // Update state with API response data
        setPromotions(response.promotions);
        setTotalItems(response.pagination.totalItems);
        setTotalPages(response.pagination.totalPages);
        setPageSize(response.pagination.pageSize);
        setCurrentPage(page);
      } catch (err) {
        console.error("Error loading promotions:", err);
        setMessage("Failed to load promotions");
        setPromotions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [statusFilter, pageSize, sortBy]
  );

  // Hàm chuyên dùng để reload lại trang hiện tại sau khi thêm, sửa, xóa
  const reloadCurrentPage = useCallback(async () => {
    // Đảm bảo reload ở trang 1 nếu kết quả tìm kiếm/lọc thay đổi
    await loadPromotions(currentPage, debounceSearch);
  }, [currentPage, debounceSearch, loadPromotions]);

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
    // Luôn quay về trang 1 khi filter hoặc sort thay đổi
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

  const getPromotionStatus = (promotion) => {
    const now = new Date();
    const start = new Date(promotion.startDate);
    const end = new Date(promotion.endDate);

    if (now < start) {
      return { text: "Upcoming", color: "text-yellow-600 bg-yellow-100" };
    } else if (now > end) {
      return { text: "Expired", color: "text-red-600 bg-red-100" };
    } else if (promotion.usageCount >= promotion.usageLimit) {
      return { text: "Fully Used", color: "text-gray-600 bg-gray-100" };
    } else {
      return { text: "Active", color: "text-green-600 bg-green-100" };
    }
  };

  const handleAdd = () => {
    setOpenAdd(true);
  };

  const handleEdit = (promotionId) => {
    setSelectedId(promotionId);
    setOpenEdit(true);
  };

  const handleSee = (promotionId) => {
    setSelectedId(promotionId);
    setOpenDetails(true);
  };

  const handleDelete = async (promotionId) => {
    const result = await Swal.fire({
      title: "Delete Promotion?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      try {
        const dataRes = await deletePromotion(promotionId);
        if (!dataRes.success) {
          Swal.fire({
            toast: true,
            position: "bottom-right",
            icon: "error",
            title: dataRes.message,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
          });
          return;
        }

        await reloadCurrentPage();
        Swal.fire({
          toast: true,
          position: "bottom-right",
          icon: "success",
          title: "Promotion deleted successfully",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
        });
      } catch (error) {
        Swal.fire({
          toast: true,
          position: "bottom-right",
          icon: "error",
          title: "Failed to delete promotion",
          showConfirmButton: false,
          timer: 5000,
          timerProgressBar: true,
        });
      }
    }
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

  // Dữ liệu cho Status Filter Dropdown
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "expired", label: "Expired" },
    { value: "upcoming", label: "Upcoming" },
  ];

  // Dữ liệu cho Sort By Dropdown
  const sortOptions = [
    { value: "createdAt-desc", label: "Newest First" },
    { value: "createdAt-asc", label: "Oldest First" },
    { value: "startDate-asc", label: "Start Date ↑" },
    { value: "startDate-desc", label: "Start Date ↓" },
    { value: "endDate-asc", label: "End Date ↑" },
    { value: "endDate-desc", label: "End Date ↓" },
  ];

  const currentStatusLabel =
    statusOptions.find((opt) => opt.value === statusFilter)?.label ||
    "All Status";
  const currentSortLabel =
    sortOptions.find((opt) => opt.value === sortBy)?.label || "Newest First";

  return (
    <div className="flex flex-col gap-10">
      {/* Title & Controls */}
      <div className="flex items-center justify-between w-full pt-10">
        <h1 className="text-4xl font-bold text-black flex items-center gap-2">
          <Percent className="text-blue-600" />
          Promotions Management
        </h1>

        <button
          className="bg-black text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition duration-200 flex items-center gap-2 cursor-pointer"
          onClick={handleAdd}
        >
          <PlusCircle size={20} />
          New Promotion
        </button>
      </div>

      <hr className="border-t border-gray-200" />

      {/* Search and Filters - Đã tối ưu hóa giao diện */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
        {/* Search Input - Thiết kế lại cho đẹp mắt hơn */}
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
            // Tăng padding, bo góc, thêm shadow nhẹ và focus border
            className="w-full pl-12 pr-10 py-2.5 border border-gray-300 rounded-xl shadow-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
          {search && (
            <X
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-black"
              onClick={() => setSearch("")}
              size={20}
            />
          )}
        </div>

        {/* Filters and Sorts - Đã chuyển sang dạng nút Dropdown */}
        <div className="flex gap-4 w-full md:w-auto justify-end">
          {/* Status Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsFilterDropdownOpen(!isFilterDropdownOpen);
                setIsSortDropdownOpen(false); // Đóng dropdown kia
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition duration-150 text-gray-700 font-medium"
            >
              <Filter size={18} />
              <span className="hidden sm:inline">Filter: </span>
              <span className="font-semibold text-black">
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
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white z-10 border border-gray-200">
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
                setIsFilterDropdownOpen(false); // Đóng dropdown kia
              }}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-300 rounded-xl shadow-sm hover:bg-gray-50 transition duration-150 text-gray-700 font-medium"
            >
              <Clock size={18} />
              <span className="hidden sm:inline">Sort By: </span>
              <span className="font-semibold text-black">
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
              <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-xl bg-white z-10 border border-gray-200">
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

      <hr className="border-t border-gray-200" />

      {/* Promotion Cards (Giữ nguyên) */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader />
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-red-600 text-lg">{message}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {promotions.map((promotion) => {
            const status = getPromotionStatus(promotion);
            return (
              <div
                key={promotion._id}
                className="bg-white rounded-lg shadow-md border border-neutral-200 overflow-hidden hover:shadow-lg transition-shadow duration-200"
              >
                {/* Status Banner */}
                <div className={`text-center py-2 ${status.color}`}>
                  {status.text}
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg mb-1">
                        {promotion.promotionCode}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {promotion.discountType === "percent"
                          ? `${promotion.discountValue}% OFF`
                          : formatCurrency(promotion.discountValue)}
                      </p>
                    </div>
                    <span className="text-sm bg-neutral-100 px-2 py-1 rounded">
                      {promotion.rank || "All Ranks"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock size={14} />
                      Valid until: {formatDate(promotion.endDate)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Uses: {promotion.usageCount || 0} /{" "}
                      {promotion.usageLimit || "∞"}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t">
                    <button
                      onClick={() => handleSee(promotion._id)}
                      className="text-blue-600 hover:text-blue-800 cursor-pointer"
                      title="View Details"
                    >
                      <Eye size={20} />
                    </button>
                    <button
                      onClick={() => handleEdit(promotion._id)}
                      className="text-green-600 hover:text-green-800 cursor-pointer"
                      title="Edit Promotion"
                    >
                      <SquarePen size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(promotion._id)}
                      className="text-red-600 hover:text-red-800 cursor-pointer"
                      title="Delete Promotion"
                    >
                      <Trash size={20} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={pageSize}
      />

      {/* Modals */}
      {openAdd && (
        <AddPromotionModel
          setOpenAdd={setOpenAdd}
          reloadPromotions={reloadCurrentPage}
        />
      )}
      {openEdit && (
        <EditPromotionModel
          promotionId={selectedId}
          setOpenEdit={setOpenEdit}
          reloadPromotions={reloadCurrentPage}
        />
      )}
      {openDetails && (
        <PromotionDetailsModel
          promotionId={selectedId}
          setOpenDetails={setOpenDetails}
        />
      )}
    </div>
  );
};
