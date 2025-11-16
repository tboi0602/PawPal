import { CirclePlus, Eye, Search, SquarePen, Trash, X } from "lucide-react";
//components
import InputForm from "../components/inputs/InputForm";
import Pagination from "../components/buttons/Pagination";
//hook
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce.js";
//API
import { getUsers, deleteUser } from "../services/users/userAPI";
//model
import { UserDetailsModel } from "../components/models/Users/UserDetailsModel";
import { EditUserModel } from "../components/models/Users/EditUserModel";
import AddStaffModel from "../components/models/Users/AddStaffModel.jsx";
import Swal from "sweetalert2";
import { Loader } from "../components/models/Loaders/Loader.jsx";

export const AdminStaffPage = () => {
  const [message, setMessage] = useState("");

  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 500);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalUser, setTotalUser] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [users, setUsers] = useState([]);

  const [idDetails, setIdDetails] = useState();
  const [idEdit, setIdEdit] = useState();

  const [openDetails, setOpenDetails] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadUser = useCallback(async (page, search) => {
    setIsLoading(true);
    // Dùng isStaff = true để chỉ lấy Staff
    const dataRes = await getUsers(page, search, true);
    if (!dataRes.success) {
      setUsers([]);
      setMessage(dataRes.message);
      setTotalUser(0);
      setTotalPages(0);
      setPageSize(0);
      setCurrentPage(1);
      setIsLoading(false);
      return;
    }
    try {
      setUsers(dataRes.users);
      setTotalUser(dataRes.pagination.totalUsers);
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
    loadUser(1, "");
  }, [loadUser]);
  useEffect(() => {
    if (debounceSearch.length > 1 || debounceSearch.length === 0) {
      loadUser(1, debounceSearch);
    }
  }, [debounceSearch, loadUser]);

  const handlePageChange = async (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      await loadUser(page, debounceSearch);
    }
  };

  const handleEdit = async (userId) => {
    setOpenEdit(!openEdit);
    setIdEdit(userId);
  };
  const handleSee = async (userId) => {
    setOpenDetails(!openDetails);
    setIdDetails(userId);
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const dataRes = await deleteUser(id);
        if (dataRes.success) {
          Swal.fire({
            title: "Deleted!",
            text: "User has been deleted.",
            icon: "success",
          });
          loadUser(currentPage, debounceSearch);
        } else {
          Swal.fire({
            title: "Error!",
            text: dataRes.message,
            icon: "error",
          });
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-10">
      {/* Title & Search Bar  */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full pt-4 md:pt-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-black shrink-0">
          Manager Staff
        </h1>
        {/* Responsive Search Container */}
        <div className="flex w-full md:w-2/3 lg:w-1/2 gap-4 justify-start md:justify-end items-center">
          <div className="w-full relative flex justify-center items-center">
            {/* Search Input */}
            <InputForm
              Icon={Search}
              placeholder="Search staff..."
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
          {/* Add Staff Button */}
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center justify-center p-3 rounded-lg bg-black text-white hover:bg-gray-800 transition duration-150 shrink-0 min-w-[120px]"
          >
            <CirclePlus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Add Staff</span>
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className=" bg-white rounded-xl shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                No.
              </th>
              {/* Tăng min-w cho cột Name, Email, Role */}
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[120px]">
                Name
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[150px]">
                Email
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[100px]">
                Phone Number
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[100px]">
                Role
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-[100px]">
                Operator
              </th>
            </tr>
          </thead>

          {/* Table Body - Dùng text-sm cho nội dung để dễ đọc hơn */}
          <tbody className="bg-white divide-y divide-gray-100 text-gray-700 text-sm">
            {users &&
              users.length > 0 &&
              users.map((user, index) => (
                <tr
                  key={user?._id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-3 py-3 whitespace-nowrap font-medium text-left">
                    {((currentPage > 0 ? currentPage : 1) - 1) * pageSize +
                      index +
                      1}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap font-medium text-left">
                    {user?.name}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-left">
                    {user?.email}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-left">
                    {user?.phone || "___"}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-left">
                    {user?.role}
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-3">
                      <SquarePen
                        className="w-4 cursor-pointer text-gray-500 hover:text-black duration-150"
                        onClick={() => handleEdit(user?._id)}
                      />
                      <Eye
                        className="w-4 cursor-pointer text-gray-500 hover:text-blue-600 duration-150"
                        onClick={() => handleSee(user?._id)}
                      />
                      <Trash
                        className="w-4 cursor-pointer text-gray-500 hover:text-red-600 duration-150"
                        onClick={() => handleDelete(user?._id)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
        {users.length == 0 && (
          <p className="text-center text-red-600 p-2 text-lg">{message}</p>
        )}
        {isLoading && (
          <div className="w-full flex justify-center items-center">
            <Loader />
          </div>
        )}
        {openDetails && (
          <UserDetailsModel
            userId={idDetails}
            setOpenDetails={setOpenDetails}
          />
        )}
        {openEdit && (
          <EditUserModel
            userId={idEdit}
            setOpenEdit={setOpenEdit}
            reloadUser={loadUser}
          />
        )}
        {openAdd && (
          <AddStaffModel setOpenAdd={setOpenAdd} reloadStaffs={loadUser} />
        )}
      </div>

      {/* Footer Phân Trang */}
      <Pagination
        totalItems={totalUser}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={pageSize}
      />
    </div>
  );
};
