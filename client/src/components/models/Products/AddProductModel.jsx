import { useState, useCallback } from "react";
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
} from "lucide-react";
import InputForm from "../../inputs/InputForm";
import Swal from "sweetalert2";
import { addProduct } from "../../../services/shopping/productAPI";
import { MarkdownForm } from "../../inputs/MarkdownForm";
import { Loader2 } from "../Loaders/Loader2";

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

export const AddProductModel = ({ setOpenAdd, reloadProducts }) => {
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    price: "",
    discountPrice: "",
    stock: "",
    description: "",
    images: [],
  });
  const [dynamicAttributes, setDynamicAttributes] = useState([]);
  const [isloading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "stock" || name === "discountPrice"
          ? Number(value)
          : value,
    }));
  };

  const handleImageChange = (e) => {
    const newFiles = Array.from(e.target.files);

    const totalFiles = formData.images.length + newFiles.length;
    if (totalFiles > 10) {
      Swal.fire(
        "Warning",
        `Maximum 10 photos allowed. You tried to add ${
          newFiles.length
        } photos, but can only add ${10 - formData.images.length} more.`,
        "warning"
      );
      e.target.value = null;
      return;
    }

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));

    const newFileUrls = newFiles.map((file) => URL.createObjectURL(file));
    setImagePreviews((prevUrls) => [...prevUrls, ...newFileUrls]);

    e.target.value = null;
  };

  const handleRemoveImage = useCallback(
    (indexToRemove) => {
      URL.revokeObjectURL(imagePreviews[indexToRemove]);

      setImagePreviews((prevUrls) =>
        prevUrls.filter((_, index) => index !== indexToRemove)
      );
      setFormData((prev) => ({
        ...prev,
        images: prev.images.filter((_, index) => index !== indexToRemove),
      }));
    },
    [imagePreviews]
  );

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsLoading(true);

    const requiredFields = [
      { key: "name", label: "Product Name" },
      { key: "price", label: "Regular Price" },
      { key: "stock", label: "Stock Quantity" },
      { key: "description", label: "Product Description" },
    ];
    for (const field of requiredFields) {
      if (!formData[field.key] && formData[field.key] !== 0) {
        Swal.fire(
          "Warning",
          `Please enter the ${field.label}. This field is required.`,
          "warning"
        );
        setIsLoading(false);
        return;
      }
    }
    if (!formData.category) {
      Swal.fire(
        "Warning",
        "Please select a Category. This field is required.",
        "warning"
      );
      setIsLoading(false);
      return;
    }
    if (formData.images.length === 0) {
      Swal.fire(
        "Warning",
        "Please upload at least one product photo.",
        "warning"
      );
      setIsLoading(false);
      return;
    }
    if (
      formData.discountPrice &&
      formData.price &&
      formData.discountPrice >= formData.price
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

    const submitFormData = new FormData();
    submitFormData.append("name", formData.name);
    submitFormData.append("category", formData.category);
    submitFormData.append("price", formData.price);
    if (formData.discountPrice) {
      submitFormData.append("discountPrice", formData.discountPrice);
    }
    submitFormData.append("stock", formData.stock);
    submitFormData.append("description", formData.description);
    submitFormData.append("attributes", JSON.stringify(attributesObject));
    formData.images.forEach((file) => {
      submitFormData.append("images", file);
    });

    try {
      const dataRes = await addProduct(submitFormData);
      if (!dataRes.success) {
        Swal.fire("Error!", dataRes.message || "Add product failed.", "error");
      } else {
        Swal.fire("Success!", "Product added successfully.", "success");
        setOpenAdd(false);
        reloadProducts();
      }
    } catch (error) {
      Swal.fire(
        "Error!",
        error.message || "An unexpected error occurred.",
        "error"
      );
    }
    setIsLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white p-8 rounded-xl w-full max-w-6xl max-h-[95vh] overflow-y-auto shadow-lg border border-gray-200">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <PlusCircle className="text-green-600" size={28} />
            Add New Product
          </h2>
          <X
            className="cursor-pointer text-gray-500 hover:text-red-500 transition"
            size={24}
            onClick={() => setOpenAdd(false)}
          />
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm h-full">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <ImageIcon className="text-orange-500" size={20} /> Product
                  Images (Max: 10)
                </h3>
                <input
                  type="file"
                  name="images"
                  id="image-upload-input"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={isloading}
                />

                {formData.images.length < 10 && (
                  <label
                    htmlFor="image-upload-input"
                    className="flex items-center justify-center h-24 w-full border-2 border-dashed border-gray-400 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition duration-150 mb-4"
                    disabled={isloading}
                  >
                    <div className="flex flex-col items-center text-gray-600">
                      <ImageIcon size={24} />
                      <span className="text-sm font-medium mt-1">
                        Click to add new image(s)
                      </span>
                    </div>
                  </label>
                )}

                {imagePreviews.length > 0 && (
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-600 mb-2 border-t pt-3">
                      Previews ({imagePreviews.length}):
                    </h4>
                    <div className="flex overflow-x-auto gap-3 pb-2">
                      {imagePreviews.map((url, index) => (
                        <div
                          key={index}
                          className="relative shrink-0 w-24 h-24 overflow-hidden rounded-lg border border-gray-300 shadow-sm group"
                        >
                          <img
                            src={url}
                            alt={`Preview ${index}`}
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(index)}
                            className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition duration-300"
                            title="Remove image"
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
            <div className="space-y-6">
              <div className="p-5 border border-gray-200 rounded-xl bg-white shadow-sm">
                <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
                  <Info className="text-blue-600" size={20} /> Basic Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <InputForm
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Product Name"
                    Icon={Tag}
                  />
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Folder className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      name="category"
                      value={formData.category}
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
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Regular Price"
                    Icon={DollarSign}
                  />
                  <InputForm
                    name="discountPrice"
                    type="number"
                    value={formData.discountPrice}
                    onChange={handleChange}
                    placeholder="Discount Price"
                    Icon={TicketPercent}
                  />
                  <InputForm
                    name="stock"
                    type="number"
                    value={formData.stock}
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
                    >
                      <MinusCircle size={20} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addAttribute}
                  className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                >
                  <PlusCircle size={18} className="mr-1" /> Add Attribute
                </button>
              </div>
            </div>

            <div className="col-span-2">
              <label className="text-md font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <FileText className="text-indigo-500" size={20} /> Product
                Description
              </label>
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-sm bg-white">
                <MarkdownForm handleEditorChange={handleEditorChange} />
              </div>
            </div>
          </div>
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
                  <Save size={20} className="mr-2" /> Save Product
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
