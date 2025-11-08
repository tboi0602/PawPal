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

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Get promotion status
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

  // Handlers
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

        await loadPromotions(currentPage);
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

  return (
    <div className="flex flex-col gap-10">
      {/* Title & Controls */}
      <div className="flex items-center justify-between w-full pt-10">
        <h1 className="text-4xl font-bold text-black flex items-center gap-2">
          <Percent className="text-blue-600" />
          Promotions Management
        </h1>

        <div className="flex items-center gap-4">
          <button
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-neutral-800 transition duration-200 flex items-center gap-2 cursor-pointer"
            onClick={handleAdd}
          >
            <PlusCircle size={20} />
            New Promotion
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {/* Search */}
        <div className="relative md:col-span-2">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by code or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-0 focus:border-black"
          />
          {search && (
            <X
              className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer text-gray-400 hover:text-black"
              onClick={() => setSearch("")}
              size={20}
            />
          )}
        </div>

        {/* Status Filter */}
        <div className="relative">
          <Filter
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-0 focus:border-black appearance-none"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="upcoming">Upcoming</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-0 focus:border-black appearance-none"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="startDate-asc">Start Date ↑</option>
            <option value="startDate-desc">Start Date ↓</option>
            <option value="endDate-asc">End Date ↑</option>
            <option value="endDate-desc">End Date ↓</option>
          </select>
        </div>
      </div>

      {/* Promotion Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-10">
          <Loader />
        </div>
      ) : promotions.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-red-600 text-lg">
            {message}
          </p>
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
          reloadPromotions={loadPromotions}
        />
      )}
      {openEdit && (
        <EditPromotionModel
          promotionId={selectedId}
          setOpenEdit={setOpenEdit}
          reloadPromotions={loadPromotions}
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
