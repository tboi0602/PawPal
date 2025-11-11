import { Eye, Search, SquarePen, X } from "lucide-react";
//components
import InputForm from "../components/inputs/InputForm.jsx";
import Pagination from "../components/buttons/Pagination.jsx";
import { Loader } from "../components/models/Loaders/Loader.jsx";
//hook
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce.js";
//API
import { getUsers } from "../services/users/userAPI.js";
//model
import { UserDetailsModel } from "../components/models/Users/UserDetailsModel.jsx";
import { EditUserModel } from "../components/models/Users/EditUserModel.jsx";

export const AdminCustomerPage = () => {
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
  const [isLoading, setIsLoading] = useState(false);

  const loadUser = useCallback(async (page, search) => {
    setIsLoading(true);
    const dataRes = await getUsers(page, search);
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

  return (
    <div className="flex flex-col gap-10">
      {/* Title & Search Bar  */}
      <div className="flex items-center justify-between w-full pt-10">
        <h1 className="text-4xl font-bold text-black">Manager Customer</h1>
        <div className="flex w-2/3 gap-4 justify-end items-center">
          {/* Search Input */}
          <div className="w-2/3 relative flex justify-center items-center">
            <InputForm
              Icon={Search}
              placeholder="Search user..."
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
        </div>
      </div>

      {/* Product Table */}
      <div className=" bg-white rounded-xl shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                No.
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                Name
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                Email
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                Phone Number
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                Loyalty Points
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                address
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Operator
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-100 text-gray-700">
            {users &&
              users.length > 0 &&
              users.map((user, index) => (
                <tr
                  key={user?._id}
                  className="hover:bg-gray-50 transition duration-150"
                >
                  <td className="px-4 py-4 whitespace-nowrap font-medium text-left">
                    {((currentPage > 0 ? currentPage : 1) - 1) * pageSize +
                      index +
                      1}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap font-medium text-left">
                    {user?.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-left">
                    {user?.email}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-left">
                    {user?.phone || "___"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    {user?.loyaltyPoints || 0}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right">
                    {user?.address?.[0] || "___"}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center gap-4">
                      <SquarePen
                        className="w-4 cursor-pointer text-gray-500 hover:text-black duration-150"
                        onClick={() => handleEdit(user?._id)}
                      />
                      <Eye
                        className="w-4 cursor-pointer text-gray-500 hover:text-blue-600 duration-150"
                        onClick={() => handleSee(user?._id)}
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
