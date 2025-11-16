import { CirclePlus, Search, Trash, X } from "lucide-react";
// COMPONENTS
import InputForm from "../components/inputs/InputForm";
import Pagination from "../components/buttons/Pagination";
import { Loader } from "../components/models/Loaders/Loader.jsx";
import { formatDate } from "../utils/formatDate.js";
// HOOKS & API
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce.js";
import {
  getNotificationsAll,
  deleteNotifications,
} from "../services/notifications/notificationAPI";
import Swal from "sweetalert2";
import { AddNotificationModel } from "../components/models/Notifications/AddNotificationModel.jsx";

export const AdminNotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 500);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);

  const loadNotifications = useCallback(async (page, search) => {
    setIsLoading(true);
    const dataRes = await getNotificationsAll(page, search);
    if (!dataRes.success) {
      setNotifications([]);
      setMessage(dataRes.message);
      setTotalNotifications(0);
      setTotalPages(0);
      setPageSize(0);
      setCurrentPage(1);
      setIsLoading(false);
      return;
    }
    try {
      setNotifications(dataRes.notifications);
      setTotalNotifications(dataRes.pagination.totalNotifications);
      setTotalPages(dataRes.pagination.totalPages);
      setPageSize(dataRes.pagination.pageSize);
      setCurrentPage(dataRes.pagination.currentPage);
    } catch (error) {
      setMessage(error.message);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadNotifications(1, "");
  }, [loadNotifications]);

  useEffect(() => {
    if (debounceSearch.length > 1 || debounceSearch.length === 0) {
      loadNotifications(1, debounceSearch);
    }
  }, [debounceSearch, loadNotifications]);

  const handlePageChange = async (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      await loadNotifications(page, debounceSearch);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "red",
      cancelButtonColor: "gray",
      confirmButtonText: "Yes",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const dataRes = await deleteNotifications(id);
        if (dataRes.success) {
          Swal.fire({
            toast: true,
            position: "bottom-right",
            icon: "success",
            title: dataRes.message,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
          });
          loadNotifications(currentPage, debounceSearch);
        } else {
          Swal.fire({
            toast: true,
            position: "bottom-right",
            icon: "error",
            title: dataRes.message,
            showConfirmButton: false,
            timer: 5000,
            timerProgressBar: true,
          });
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-10">
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full pt-4 md:pt-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-black shrink-0">
          Manager Notification
        </h1>
        {/* Search Container */}
        <div className="flex w-full md:w-2/3 lg:w-1/2 gap-4 justify-start md:justify-end items-center">
          <div className="w-full relative flex justify-center items-center">
            {/* Search Input */}
            <InputForm
              Icon={Search}
              placeholder="Search notification content..."
              name="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <X
                className="absolute right-2 cursor-pointer text-gray-400 hover:text-black"
                onClick={() => {
                  setSearch("");
                }}
              />
            )}
          </div>
          {/* Add Notification Button */}
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center justify-center p-3 rounded-lg bg-black text-white hover:bg-gray-800 transition duration-150 shrink-0 min-w-[120px]"
          >
            <CirclePlus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Add Notification</span>
          </button>
        </div>
      </div>

      {/* Notification Table - Responsive Overflow */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                No.
              </th>
              {/* Tăng min-w cho cột Title và Content */}
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[150px]">
                Title
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[250px]">
                Content
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-[120px]">
                Created At
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-20">
                Type
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-20">
                Delete
              </th>
            </tr>
          </thead>

          {/* Table Body - Dùng text-sm cho nội dung */}
          <tbody className="bg-white divide-y divide-gray-100 text-gray-700 text-sm">
            {!isLoading && notifications.length > 0 ? (
              notifications.map((notification, index) => {
                const isRead = notification.isRead;
                return (
                  <tr
                    key={notification._id}
                    className={`hover:bg-gray-50 transition duration-150 ${
                      !isRead ? "font-semibold bg-blue-50/50" : ""
                    }`}
                  >
                    <td className="px-3 py-4 whitespace-nowrap font-medium text-left">
                      {((currentPage > 0 ? currentPage : 1) - 1) * pageSize +
                        index +
                        1}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-left max-w-xs overflow-hidden text-ellipsis">
                      {notification.title}
                    </td>
                    <td className="px-3 py-4 text-left max-w-lg overflow-hidden text-ellipsis">
                      {notification.content}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center text-gray-500">
                      {formatDate(notification.createdAt, "dd/mm/yyyy HH:MM")}
                    </td>
                    <td className="px-3 py-4 whitespace-nowrap text-center">
                      {notification.type}
                    </td>
                    <td className="px-3 py-4 text-center">
                      <Trash
                        className="w-5 text-red-500 hover:text-red-700 cursor-pointer duration-150 m-auto"
                        onClick={() => handleDelete(notification._id)}
                      />
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="py-8">
                  <p className="text-center text-red-600 text-lg">
                    {message || "No notifications found."}
                  </p>
                </td>
              </tr>
            )}
            {isLoading && (
              <tr>
                <td colSpan="8" className="py-8">
                  <div className="w-full flex justify-center items-center">
                    <Loader />
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {openAdd && (
        <AddNotificationModel
          setOpenAdd={setOpenAdd}
          reloadNotifications={loadNotifications}
        />
      )}

      {totalPages > 1 && (
        <Pagination
          totalItems={totalNotifications}
          totalPages={totalPages}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          itemsPerPage={pageSize}
        />
      )}
    </div>
  );
};
