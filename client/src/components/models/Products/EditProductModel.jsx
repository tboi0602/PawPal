import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  Save,
  Trash2,
  PlusCircle,
  MinusCircle,
  Info,
  ListChecks,
  Image as ImageIcon,
  FileText,
  Tag,
  Folder,
  DollarSign,
  Package,
  TicketPercent,
  Loader2,
} from "lucide-react";
import Swal from "sweetalert2";
import { getProduct, editProduct } from "../../../services/shopping/productAPI";
import InputForm from "../../inputs/InputForm";
import { MarkdownForm } from "../../inputs/MarkdownForm";

const PRODUCT_CATEGORIES = [
  "accessory",
  "food",
  "nutrition",
  "medication",
  "toy",
  "functional",
];

const availableAttributes = [
  { key: "color", label: "Color", placeholder: "e.g., Red, Blue" },
  { key: "size", label: "Size", placeholder: "e.g., S, M, L, XL" },
  { key: "weight", label: "Weight", placeholder: "e.g., 250g, 1kg" },
  { key: "capacity", label: "Capacity", placeholder: "e.g., 5000mAh, 128GB" },
];

export const EditProductModel = ({
  productId,
  setOpenEdit,
  reloadProducts,
}) => {
  const [isloading, setIsLoading] = useState(false);
  const [productData, setProductData] = useState(null);
  const [newImages, setNewImages] = useState([]);
  const [newImagePreviews, setNewImagePreviews] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [dynamicAttributes, setDynamicAttributes] = useState([]);

  useEffect(() => {
    async function loadProductData() {
      setIsLoading(true);
      try {
        const dataRes = await getProduct(productId);
        if (dataRes.success) {
          const product = dataRes.product;
          let initialAttributes = [];
          try {
            let attributesObj = {};
            if (typeof product.attributes === "string") {
              attributesObj = JSON.parse(product.attributes);
            } else if (
              typeof product.attributes === "object" &&
              product.attributes !== null
            ) {
              attributesObj = product.attributes;
            }
            initialAttributes = Object.entries(attributesObj).map(
              ([key, value]) => ({ key, value })
            );
          } catch (e) {
            console.error("Error parsing attributes:", e);
          }

          setProductData({
            name: product.name || "",
            category: product.category || "",
            price: product.price || 0,
            discountPrice: product.discountPrice || 0,
            stock: product.stock || 0,
            description: product.description || "",
            existingImages: product.images || [],
          });
          setDynamicAttributes(initialAttributes);
        } else {
          Swal.fire("Error", dataRes.message, "error");
          setOpenEdit(false);
        }
      } catch (error) {
        Swal.fire("Server Error", error.message, "error");
        setOpenEdit(false);
      } finally {
        setIsLoading(false);
      }
    }
    loadProductData();
    return () => {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [productId, setOpenEdit, newImagePreviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProductData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock" || name === "discountPrice"
          ? Number(value)
          : value,
    }));
  };

  const handleEditorChange = useCallback((content) => {
    setProductData((prev) => ({ ...prev, description: content }));
  }, []);

  const addAttribute = () => {
    const defaultKey =
      availableAttributes.length > 0 ? availableAttributes[0].key : "";
    setDynamicAttributes((prev) => [...prev, { key: defaultKey, value: "" }]);
  };

  const removeAttribute = (indexToRemove) => {
    setDynamicAttributes((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleAttributeChange = (index, field, value) => {
    setDynamicAttributes((prev) =>
      prev.map((attr, i) => (i === index ? { ...attr, [field]: value } : attr))
    );
  };

  const handleNewImageChange = (e) => {
    const files = Array.from(e.target.files);
    const existingCount = productData?.existingImages.length || 0;
    const totalFilesAfterAddition =
      existingCount - imagesToDelete.length + newImages.length + files.length;

    if (totalFilesAfterAddition > 10) {
      Swal.fire(
        "Warning",
        `Maximum 10 photos allowed in total. You can only add ${
          10 - (existingCount - imagesToDelete.length + newImages.length)
        } more.`,
        "warning"
      );
      e.target.value = null;
      return;
    }

    setNewImages((prevFiles) => [...prevFiles, ...files]);
    const newUrls = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prevUrls) => [...prevUrls, ...newUrls]);

    e.target.value = null;
  };

  const removeNewImage = useCallback(
    (indexToRemove) => {
      URL.revokeObjectURL(newImagePreviews[indexToRemove]);
      setNewImagePreviews((prevUrls) =>
        prevUrls.filter((_, index) => index !== indexToRemove)
      );
      setNewImages((prevFiles) =>
        prevFiles.filter((_, index) => index !== indexToRemove)
      );
    },
    [newImagePreviews]
  );

  const toggleDeleteExistingImage = useCallback((url) => {
    setImagesToDelete((prev) =>
      prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url]
    );
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!productData) return;
    setIsLoading(true);
    const requiredFields = [
      { key: "name", label: "Product Name" },
      { key: "category", label: "Category" },
      { key: "price", label: "Regular Price" },
      { key: "stock", label: "Stock Quantity" },
      { key: "description", label: "Product Description" },
    ];

    for (const field of requiredFields) {
      if (!productData[field.key] && productData[field.key] !== 0) {
        Swal.fire(
          "Warning",
          `Please enter the ${field.label}. This field is required.`,
          "warning"
        );
        setIsLoading(false);
        return;
      }
    }

    const currentImageCount =
      productData.existingImages.length -
      imagesToDelete.length +
      newImages.length;
    if (currentImageCount === 0) {
      Swal.fire(
        "Warning",
        "The product must have at least one image after the update.",
        "warning"
      );
      setIsLoading(false);
      return;
    }

    if (
      productData.discountPrice &&
      productData.price &&
      productData.discountPrice >= productData.price
    ) {
      Swal.fire(
        "Validation Error",
        "Discount Price must be less than the regular Price.",
        "error"
      );
      setIsLoading(false);
      return;
    }

    const attributesObject = {};
    dynamicAttributes.forEach((attr) => {
      if (attr.key && attr.value) {
        attributesObject[attr.key] = attr.value;
      }
    });

    const imagesToKeep = productData.existingImages.filter(
      (url) => !imagesToDelete.includes(url)
    );

    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("category", productData.category);
    formData.append("price", productData.price);
    if (productData.discountPrice) {
      formData.append("discountPrice", productData.discountPrice);
    }
    formData.append("stock", productData.stock);
    formData.append("description", productData.description);

    formData.append("attributes", JSON.stringify(attributesObject));

    formData.append("imagesToKeep", JSON.stringify(imagesToKeep));

    newImages.forEach((file) => {
      formData.append("newImages", file);
    });

    try {
      const dataRes = await editProduct(productId, formData);
      if (!dataRes.success) {
        Swal.fire(
          "Error!",
          dataRes.message || "Update product failed.",
          "error"
        );
      } else {
        Swal.fire("Success!", "Product updated successfully.", "success");
        setOpenEdit(false);
        reloadProducts();
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        error.message || "An unexpected error occurred.",
        "error"
      );
    } finally {
      newImagePreviews.forEach((url) => URL.revokeObjectURL(url));
      setIsLoading(false);
    }
  };

  if (!productData)
    return (
      <div className="fixed inset-0 bg-gray-100/80 flex justify-center items-center z-50 p-4">
        <Loader2 />
      </div>
    );

  const totalImageCount =
    productData.existingImages.length -
    imagesToDelete.length +
    newImages.length;
  const canAddMoreImages = totalImageCount < 10;

  return (
    <div className="fixed inset-0 bg-gray-100/80 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-lg border border-gray-200">
        {/* title */}
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Tag className="text-blue-600" size={28} />
            Edit Product:{" "}
            <span className="text-gray-600 truncate">{productData.name}</span>
          </h2>
          <X
            className="cursor-pointer text-gray-500 hover:text-red-500 transition"
            size={24}
            onClick={() => setOpenEdit(false)}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* image */}
            <div className="space-y-6">
              <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ImageIcon className="text-orange-500" size={20} /> Product
                  Images (Total: {totalImageCount}/10)
                </h3>

                <h4 className="text-sm font-medium text-gray-600 mb-2 border-b pb-1">
                  Current Images ({productData.existingImages.length}):
                </h4>
                <p className="text-xs text-gray-500 mb-3">
                  Click on an image to mark it for deletion.
                </p>
                <div className="flex overflow-x-auto gap-3 pb-2 mb-4">
                  {productData.existingImages.map((url) => {
                    const isDeleting = imagesToDelete.includes(url);
                    return (
                      <div
                        key={url}
                        className={`relative shrink-0 w-24 h-24 overflow-hidden rounded-lg border-2 ${
                          isDeleting
                            ? "border-red-500 opacity-50"
                            : "border-gray-300"
                        } shadow-sm group transition duration-200 cursor-pointer`}
                        onClick={() => toggleDeleteExistingImage(url)}
                      >
                        <img
                          src={url}
                          alt="product old"
                          className="w-full h-full object-cover"
                        />
                        <div
                          className={`absolute inset-0 flex items-center justify-center transition duration-300 ${
                            isDeleting ? "bg-black/50" : "bg-black/0"
                          }`}
                        >
                          <Trash2
                            size={18}
                            className={`text-white transition duration-300 ${
                              isDeleting ? "opacity-100" : "opacity-0"
                            }`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                <input
                  type="file"
                  name="newImages"
                  id="image-upload-input-edit"
                  accept="image/*"
                  multiple
                  onChange={handleNewImageChange}
                  className="hidden"
                  disabled={!canAddMoreImages || isloading}
                />

                {canAddMoreImages ? (
                  <label
                    htmlFor="image-upload-input-edit"
                    className={`flex items-center justify-center h-24 w-full border-2 border-dashed border-gray-400 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-150 mb-4 ${
                      !canAddMoreImages || isloading
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <div className="flex flex-col items-center text-gray-600">
                      <ImageIcon size={24} />
                      <span className="text-sm font-medium mt-1">
                        Click to add new image(s) (Max: {10 - totalImageCount}{" "}
                        more)
                      </span>
                    </div>
                  </label>
                ) : (
                  <p className="text-center text-sm text-red-500 border border-red-200 bg-red-50 p-3 rounded-lg mb-4">
                    Maximum of 10 images reached.
                  </p>
                )}

                {newImagePreviews.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-600 mb-2 border-t pt-3">
                      New Image Previews ({newImagePreviews.length}):
                    </h4>
                    <div className="flex overflow-x-auto gap-3 pb-2">
                      {newImagePreviews.map((url, index) => (
                        <div
                          key={index}
                          className="relative shrink-0 w-24 h-24 overflow-hidden rounded-lg border border-green-500 shadow-sm group"
                        >
                          <img
                            src={url}
                            alt={`New Preview ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition duration-300"
                            title="Remove new image"
                            disabled={isloading}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            {/* basic form */}
            <div className="space-y-6">
              <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Info className="text-blue-600" size={20} /> Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputForm
                    name="name"
                    type="text"
                    value={productData.name}
                    onChange={handleChange}
                    placeholder="Product Name"
                    Icon={Tag}
                    required
                  />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Folder className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      name="category"
                      value={productData.category}
                      onChange={handleChange}
                      required
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-900 placeholder-gray-500"
                    >
                      <option value="" disabled>
                        -- Select Category --
                      </option>
                      {PRODUCT_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <InputForm
                    name="price"
                    type="number"
                    value={productData.price}
                    onChange={handleChange}
                    placeholder="Regular Price"
                    Icon={DollarSign}
                  />
                  <InputForm
                    name="discountPrice"
                    type="number"
                    value={productData.discountPrice}
                    onChange={handleChange}
                    placeholder="Discount Price"
                    Icon={TicketPercent}
                  />
                  <InputForm
                    name="stock"
                    type="number"
                    value={productData.stock}
                    onChange={handleChange}
                    placeholder="Stock Quantity"
                    Icon={Package}
                  />
                </div>
              </div>

              <div className="p-5 border border-gray-200 rounded-xl bg-gray-50 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ListChecks className="text-purple-600" size={20} />
                  Specifications
                </h3>
                {dynamicAttributes.map((attr, index) => (
                  <div
                    key={index}
                    className="flex gap-2 mb-3 items-center p-2 border border-gray-200 rounded bg-white"
                  >
                    <select
                      value={attr.key}
                      onChange={(e) =>
                        handleAttributeChange(index, "key", e.target.value)
                      }
                      className="p-2 border rounded w-1/3 bg-gray-50 text-sm"
                    >
                      <option value="" disabled>
                        -- Select Attribute --
                      </option>
                      {availableAttributes.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={attr.value}
                      onChange={(e) =>
                        handleAttributeChange(index, "value", e.target.value)
                      }
                      placeholder={
                        availableAttributes.find((a) => a.key === attr.key)
                          ?.placeholder || "Enter value..."
                      }
                      className="p-2 border rounded w-2/3 text-sm"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => removeAttribute(index)}
                      className="p-1 text-gray-500 hover:text-red-600 transition"
                      disabled={isloading}
                    >
                      <MinusCircle size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAttribute}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                  disabled={isloading}
                >
                  <PlusCircle size={18} className="mr-1" /> Add Attribute
                </button>
              </div>
            </div>
            {/* markdown */}
            <div className="col-span-2">
              <label className=" text-md font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="text-indigo-500" size={20} /> Product
                Description
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                <MarkdownForm
                  initialContent={productData.description}
                  handleEditorChange={handleEditorChange}
                />
              </div>
            </div>
          </div>

          {/* button */}
          <div className="pt-6 flex justify-center border-t mt-6">
            <button
              type="submit"
              disabled={isloading}
              className="flex items-center justify-center px-8 py-3 rounded-lg text-lg button-black transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isloading ? (
                <Loader2 />
              ) : (
                <>
                  <Save size={20} className="mr-2" /> Update Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
