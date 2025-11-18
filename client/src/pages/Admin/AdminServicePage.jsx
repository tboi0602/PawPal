import { CirclePlus, Eye, Search, SquarePen, Trash, X } from "lucide-react";
import InputForm from "../../components/inputs/InputForm.jsx";
import Pagination from "../../components/buttons/Pagination.jsx";
import { Loader } from "../../components/models/Loaders/Loader.jsx";
import { useCallback, useEffect, useState } from "react";
import {
  getSolutions,
  deleteSolution,
} from "../../services/solutions/solutionAPI.js";
import { AddServiceModel } from "../../components/models/Services/AddServiceModel.jsx";
import { EditServiceModel } from "../../components/models/Services/EditServiceModel.jsx";
import { ServiceDetailsModel } from "../../components/models/Services/ServiceDetailsModel.jsx";
import Swal from "sweetalert2";

export const AdminServicePage = () => {
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(0);
  const [totalSolutions, setTotalSolutions] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [solutions, setSolutions] = useState([]);

  const [isLoading, setIsLoading] = useState(false);

  const [openDetails, setOpenDetails] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [idDetails, setIdDetails] = useState();
  const [idEdit, setIdEdit] = useState();

  const loadSolutions = useCallback(async () => {
    setIsLoading(true);
    try {
      const dataRes = await getSolutions();
      if (!dataRes.success) {
        setSolutions([]);
        setMessage(dataRes.message || "Failed to load solutions");
        setTotalSolutions(0);
        setTotalPages(0);
        setPageSize(0);
        setCurrentPage(1);
        return;
      }

      let filtered = dataRes.solutions || [];
      if (search) {
        filtered = filtered.filter(
          (sol) =>
            sol?.name?.toLowerCase().includes(search.toLowerCase()) ||
            sol?.description?.toLowerCase().includes(search.toLowerCase())
        );
      }

      const itemsPerPage = 10;
      const total = filtered.length;
      const pages = Math.ceil(total / itemsPerPage);
      const start = Math.max(0, (currentPage - 1) * itemsPerPage);
      const paginated = filtered.slice(start, start + itemsPerPage);

      setSolutions(paginated);
      setTotalSolutions(total);
      setTotalPages(pages);
      setPageSize(itemsPerPage);
    } catch (error) {
      setMessage(error.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [search, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    loadSolutions();
  }, [loadSolutions]);

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleEdit = (solutionId) => {
    setIdEdit(solutionId);
    setOpenEdit(true);
  };

  const handleSee = (solutionId) => {
    setIdDetails(solutionId);
    setOpenDetails(true);
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
        const dataRes = await deleteSolution(id);
        if (dataRes.success) {
          Swal.fire({
            title: "Deleted!",
            text: "Service has been deleted.",
            icon: "success",
          });
          loadSolutions();
        } else {
          Swal.fire({
            title: "Error!",
            text: dataRes.message || "Failed to delete service",
            icon: "error",
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
          Manager Services
        </h1>
        {/*  Search Container */}
        <div className="flex w-full md:w-2/3 lg:w-1/2 gap-4 justify-start md:justify-end items-center">
          <div className="w-full relative flex justify-center items-center">
            {/* Search Input */}
            <InputForm
              Icon={Search}
              placeholder="Search service..."
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
          {/* Add Service Button */}
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center justify-center p-3 rounded-lg bg-black text-white hover:bg-gray-800 transition duration-150 shrink-0 min-w-[120px]"
          >
            <CirclePlus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Add Service</span>
          </button>
        </div>
      </div>

      {/* Services Table  */}
      <div className="bg-white rounded-xl shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                No.
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[120px]">
                Name
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[150px]">
                Description
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right min-w-[100px]">
                Price
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-[100px]">
                Type
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right min-w-20">
                Status
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-100 text-gray-700 text-sm">
            {solutions &&
              solutions.length > 0 &&
              solutions.map((solution, index) => {
                const rowNumber =
                  ((currentPage > 0 ? currentPage : 1) - 1) * pageSize +
                  index +
                  1;
                return (
                  <tr
                    key={solution?._id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-3 py-3 whitespace-nowrap font-medium text-left">
                      {rowNumber}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-left font-medium">
                      {solution?.name}
                    </td>
                    <td
                      className="px-3 py-3 text-left line-clamp-2"
                      dangerouslySetInnerHTML={{
                        __html: solution?.description,
                      }}
                    ></td>
                    <td className="px-3 py-3 whitespace-nowrap text-right font-medium">
                      {solution?.price?.toLocaleString("vi-VN")} VND
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-semibold capitalize">
                        {solution?.type}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <SquarePen
                          className="w-4 cursor-pointer text-gray-500 hover:text-black duration-150"
                          onClick={() => handleEdit(solution?._id)}
                        />
                        <Eye
                          className="w-4 cursor-pointer text-gray-500 hover:text-blue-600 duration-150"
                          onClick={() => handleSee(solution?._id)}
                        />
                        <Trash
                          className="w-4 cursor-pointer text-gray-500 hover:text-red-600 duration-150"
                          onClick={() => handleDelete(solution?._id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {solutions?.length === 0 && !isLoading && (
          <p className="text-center text-red-600 p-4 text-lg">
            {message || "No services found"}
          </p>
        )}
        {isLoading && (
          <div className="w-full flex justify-center items-center py-10">
            <Loader />
          </div>
        )}
      </div>

      <Pagination
        totalItems={totalSolutions}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={pageSize}
      />

      {openDetails && (
        <ServiceDetailsModel
          serviceId={idDetails}
          setOpenDetails={setOpenDetails}
        />
      )}
      {openEdit && (
        <EditServiceModel
          serviceId={idEdit}
          setOpenEdit={setOpenEdit}
          reloadServices={loadSolutions}
        />
      )}
      {openAdd && (
        <AddServiceModel
          setOpenAdd={setOpenAdd}
          reloadServices={loadSolutions}
        />
      )}
    </div>
  );
};
