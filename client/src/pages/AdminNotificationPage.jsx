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
      setMessage(dataRes.message || "Failed to fetch notifications.");
      setTotalNotifications(0);
      setTotalPages(0);
      setPageSize(0);
      setCurrentPage(1);
      setIsLoading(false);
      return;
    }

    try {
      setNotifications(dataRes.notifications || []);
      setTotalNotifications(dataRes.pagination?.totalNotifications || 0);
      setTotalPages(dataRes.pagination?.totalPages || 0);
      setPageSize(dataRes.pagination?.pageSize || 0);
      setCurrentPage(dataRes.pagination?.currentPage || page);
    } catch (error) {
      setMessage(error.message);
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
      await loadNotifications(page, debounceSearch);
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Deleted this notification?",
      text: "You will not be able to recover this notification data!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      const dataRes = await deleteNotifications(id);
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
      }
      loadNotifications();
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: dataRes.message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    }
  };

  const calculateSTT = (index) => {
    return (currentPage - 1) * pageSize + index + 1;
  };

  return (
    <div className="flex flex-col gap-10">
      {/* --- 1. Header & Search Box --- */}
      <div className="flex items-center justify-between w-full pt-10">
        <h1 className="text-4xl font-bold text-black">Manager Notification</h1>
        <div className="flex w-1/3 gap-4 justify-end items-center">
          {/* Search Input */}
          <div className="w-full relative flex justify-center items-center">
            <InputForm
              Icon={Search}
              placeholder="Search notifications..."
              name="search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <X
                className="absolute right-2 cursor-pointer text-gray-400 hover:text-black"
                onClick={() => setSearch("")}
              />
            )}
          </div>
        </div>
        <button
          className="flex  gap-1 bg-gray-800 text-white p-2 px-4 rounded-lg hover:bg-black transition duration-200 cursor-pointer"
          onClick={() => {
            setOpenAdd(true);
          }}
        >
          <CirclePlus className="w-5" />
          New Notification
        </button>
      </div>

      {/* --- 2. Notification Table --- */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                No.
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                Title
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                Content (Summary)
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Sent Time
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Type
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Operator
              </th>
            </tr>
          </thead>
          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-100 text-gray-700">
            {isLoading ? (
              <tr>
                <td colSpan="6" className="py-10 text-center">
                  <div className="w-full flex justify-center items-center">
                    <Loader />
                  </div>
                </td>
              </tr>
            ) : notifications.length > 0 ? (
              notifications.map((notification, index) => {
                return (
                  <tr
                    key={notification._id || notification.group_id || index}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-left">
                      {calculateSTT(index)}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-left">
                      {notification.title}
                    </td>
                    <td className="px-4 py-4 text-left max-w-xs wrap-break-words">
                      {notification.content}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center  text-gray-500">
                      {formatDate(notification.createdAt, "dd/mm/yyyy HH:MM")}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      {notification.type}
                    </td>
                    <td className="px-4 py-4 ">
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
