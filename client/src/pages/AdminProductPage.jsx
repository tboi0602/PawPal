import { CirclePlus, Eye, Search, SquarePen, Trash, X } from "lucide-react";
//components
import InputForm from "../components/inputs/InputForm";
import Pagination from "../components/buttons/Pagination";
import { Loader } from "../components/models/Loaders/Loader.jsx";
//hook
import { useCallback, useEffect, useState } from "react";
import { useDebounce } from "../hooks/useDebounce.js";
//API
import { getProducts, deleteProduct } from "../services/shopping/productAPI";

import { ProductDetailsModel } from "../components/models/Products/ProductDetailsModel";
import { EditProductModel } from "../components/models/Products/EditProductModel";
import { AddProductModel } from "../components/models/Products/AddProductModel";
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
    const dataRes = await getProducts(page, search);
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

  const handleAdd = async () => {
    setOpenAdd(!openAdd);
  };
  const handleEdit = async (productId) => {
    setOpenEdit(!openEdit);
    setIdEdit(productId);
  };
  const handleSee = async (productId) => {
    setOpenDetails(!openDetails);
    setIdDetails(productId);
  };
  const handleDelete = async (productId) => {
    const result = await Swal.fire({
      title: "Deleted this product?",
      text: "You will not be able to recover this product data!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc3545",
      reverseButtons: true,
    });
    if (result.isConfirmed) {
      const dataRes = await deleteProduct(productId);
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
      loadProducts();
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

  return (
    <div className="flex flex-col gap-10">
      {/* Search Box */}
      <div className="flex items-center justify-between w-full pt-10">
        <h1 className="text-4xl font-bold text-black">Manager Products</h1>
        <div className="flex w-2/3 gap-4 justify-end items-center">
          <div className="w-2/3 relative flex justify-center items-center">
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
          <button
            className="flex  gap-1 bg-gray-800 text-white p-2 px-4 rounded-lg hover:bg-black transition duration-200 cursor-pointer"
            onClick={handleAdd}
          >
            <CirclePlus className="w-5" />
            New Product
          </button>
        </div>
      </div>

      {/* table */}
      <div className=" bg-white rounded-xl shadow-md overflow-x-auto border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                No.
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                Name
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left">
                Category
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                Price
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">
                Stock
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Status
              </th>
              <th className="px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center">
                Operator
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-100 text-gray-700">
            {products &&
              products.length > 0 &&
              products.map((product, index) => {
                const isOutOfStock = product?.stock === 0;
                const statusText = isOutOfStock ? "Out of stock" : "In stock";
                const statusClass = isOutOfStock
                  ? "bg-red-100 tẽ text-red-800"
                  : "bg-green-100 text-green-800";

                return (
                  <tr
                    key={product?._id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-left">
                      {((currentPage > 0 ? currentPage : 1) - 1) * pageSize +
                        index +
                        1}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap font-medium text-left">
                      {product?.name}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-left">
                      {product?.category}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right font-semibold text-green-600">
                      {product?.discountPrice?.toLocaleString("vi-VN")} VND
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-right">
                      {product?.stock}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <span
                        className={`px-3 py-1 inline-flex text-md leading-5 font-semibold rounded-full ${statusClass}`}
                      >
                        {statusText}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-4">
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
