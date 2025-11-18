import { CirclePlus, Eye, Search, SquarePen, Trash, X } from "lucide-react";
//components
import InputForm from "../../components/inputs/InputForm.jsx";
import Pagination from "../../components/buttons/Pagination.jsx";
import { Loader } from "../../components/models/Loaders/Loader.jsx";
//hook
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "../../hooks/useDebounce.js";
//API
import {
  getProducts,
  deleteProduct,
} from "../../services/shopping/productAPI.js";

import { ProductDetailsModel } from "../../components/models/Products/ProductDetailsModel.jsx";
import { EditProductModel } from "../../components/models/Products/EditProductModel.jsx";
import { AddProductModel } from "../../components/models/Products/AddProductModel.jsx";
import Swal from "sweetalert2";

export const AdminProductPage = () => {
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const debounceSearch = useDebounce(search, 500);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(0);
  const [products, setProducts] = useState([]);

  const [idDetails, setIdDetails] = useState();
  const [idEdit, setIdEdit] = useState();

  const [openDetails, setOpenDetails] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadProducts = useCallback(async (page, search) => {
    setIsLoading(true);
    const dataRes = await getProducts(page, 10, search);
    if (!dataRes.success) {
      setProducts([]);
      setMessage(dataRes.message);
      setTotalProducts(0);
      setTotalPages(0);
      setPageSize(0);
      setCurrentPage(1);
      setIsLoading(false);
      return;
    }
    try {
      setProducts(dataRes.products);
      setTotalProducts(dataRes.pagination.totalProducts);
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
    loadProducts(1, "");
  }, [loadProducts]);

  useEffect(() => {
    if (debounceSearch.length > 1 || debounceSearch.length === 0) {
      loadProducts(1, debounceSearch);
    }
  }, [debounceSearch, loadProducts]);

  const handlePageChange = async (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      await loadProducts(page, debounceSearch);
    }
  };

  const handleEdit = async (productId) => {
    setOpenEdit(!openEdit);
    setIdEdit(productId);
  };
  const handleSee = async (productId) => {
    setOpenDetails(!openDetails);
    setIdDetails(productId);
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
        const dataRes = await deleteProduct(id);
        if (dataRes.success) {
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success",
          });
          loadProducts(currentPage, debounceSearch);
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
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full pt-4 md:pt-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-black shrink-0">
          Manager Product
        </h1>
        {/*  Search Container */}
        <div className="flex w-full md:w-2/3 lg:w-1/2 gap-4 justify-start md:justify-end items-center">
          <div className="w-full relative flex justify-center items-center">
            {/* Search Input */}
            <InputForm
              Icon={Search}
              placeholder="Search product..."
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
          {/* Add Product Button */}
          <button
            onClick={() => setOpenAdd(true)}
            className="flex items-center justify-center p-3 rounded-lg bg-black text-white hover:bg-gray-800 transition duration-150 shrink-0 min-w-[120px]"
          >
            <CirclePlus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Add Product</span>
          </button>
        </div>
      </div>

      {/* Product Table  */}
      <div className=" bg-white rounded-xl shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          {/* Table Header */}
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                No.
              </th>
              {/* Tăng min-w cho cột Image, Name, Price */}

              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[150px]">
                Name
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[100px]">
                Price
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right min-w-20">
                Stock
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right min-w-[100px]">
                Status
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right min-w-[100px]">
                Category
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-[100px]">
                Operator
              </th>
            </tr>
          </thead>

          {/* Table Body - Dùng text-sm cho nội dung để dễ đọc hơn */}
          <tbody className="bg-white divide-y divide-gray-100 text-gray-700 text-sm">
            {products &&
              products.length > 0 &&
              products.map((product, index) => {
                return (
                  <tr
                    key={product?._id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-3 py-3 whitespace-nowrap font-medium text-left">
                      {((currentPage > 0 ? currentPage : 1) - 1) * pageSize +
                        index +
                        1}
                    </td>

                    <td className="px-3 py-3 whitespace-nowrap text-left font-medium">
                      {product?.name}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-left font-medium  ">
                      {product?.price.toLocaleString("vi-VN")} VND
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-right">
                      {product?.stock}
                    </td>
                    {product?.stock > 0 ? (
                      <td className="px-3 py-3 whitespace-nowrap text-right text-green-600 font-bold">
                        In Stock
                      </td>
                    ) : (
                      <td className="px-3 py-3 whitespace-nowrap text-right text-red-600 font-bold">
                        Out of Stock
                      </td>
                    )}

                    <td className="px-3 py-3 whitespace-nowrap text-right uppercase">
                      {product?.category}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <SquarePen
                          className="w-4 cursor-pointer text-gray-500 hover:text-black duration-150"
                          onClick={() => handleEdit(product?._id)}
                        />
                        <Eye
                          className="w-4 cursor-pointer text-gray-500 hover:text-blue-600 duration-150"
                          onClick={() => handleSee(product?._id)}
                        />
                        <Trash
                          className="w-4 cursor-pointer text-gray-500 hover:text-red-600 duration-150"
                          onClick={() => handleDelete(product?._id)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
        {products?.length == 0 && (
          <p className="text-center text-red-600 p-2 text-lg">{message}</p>
        )}
        {isLoading && (
          <div className="w-full flex justify-center items-center">
            <Loader />
          </div>
        )}

        {openDetails && (
          <ProductDetailsModel
            productId={idDetails}
            setOpenDetails={setOpenDetails}
          />
        )}
        {openEdit && (
          <EditProductModel
            productId={idEdit}
            setOpenEdit={setOpenEdit}
            reloadProducts={loadProducts}
          />
        )}
        {openAdd && (
          <AddProductModel
            setOpenAdd={setOpenAdd}
            reloadProducts={loadProducts}
          />
        )}
      </div>
      <Pagination
        totalItems={totalProducts}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        itemsPerPage={pageSize}
      />
    </div>
  );
};
