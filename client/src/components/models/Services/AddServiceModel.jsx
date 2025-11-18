import { useState } from "react";
import {
  X,
  Save,
  PlusCircle,
  FileText,
  Tag,
  Clock,
  DollarSign,
  Layers,
} from "lucide-react";
import InputForm from "../../inputs/InputForm";
import Swal from "sweetalert2";
import { createSolution } from "../../../services/solutions/solutionAPI";
import { MarkdownForm } from "../../inputs/MarkdownForm";
import { Loader2 } from "../Loaders/Loader2";

const SERVICE_TYPES = ["caring", "cleaning", "beauty"];
const PRICING_TYPES = ["per_hour", "per_day", "per_kg", "per_session"];

export const AddServiceModel = ({ setOpenAdd, reloadServices }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    duration: "",
    price: "",
    pricingType: "per_session",
    type: "cleaning",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : name === "duration" || name === "price"
          ? Number(value) || ""
          : value,
    }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({ ...prev, description: content }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const requiredFields = [
      { key: "name", label: "Service Name" },
      { key: "description", label: "Service Description" },
      { key: "duration", label: "Duration (minutes)" },
      { key: "price", label: "Price" },
      { key: "type", label: "Service Type" },
      { key: "pricingType", label: "Pricing Type" },
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

    if (formData.duration <= 0) {
      Swal.fire("Warning", "Duration must be greater than 0.", "warning");
      setIsLoading(false);
      return;
    }

    if (formData.price <= 0) {
      Swal.fire("Warning", "Price must be greater than 0.", "warning");
      setIsLoading(false);
      return;
    }

    try {
      const dataRes = await createSolution({
        name: formData.name,
        description: formData.description,
        duration: formData.duration,
        price: formData.price,
        pricingType: formData.pricingType,
        type: formData.type,
      });

      if (!dataRes.success) {
        Swal.fire("Error!", dataRes.message || "Add service failed.", "error");
      } else {
        Swal.fire("Success!", "Service added successfully.", "success");
        setOpenAdd(false);
        reloadServices();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white p-8 rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-100">
        <div className="flex justify-between items-center border-b border-gray-100 pb-5 mb-7">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="p-2 bg-linear-to-br from-green-50 to-green-100 rounded-lg">
              <PlusCircle className="text-green-600" size={28} />
            </div>
            Add New Service
          </h2>
          <button
            onClick={() => setOpenAdd(false)}
            className="p-2 hover:bg-gray-100 rounded-lg transition duration-200 text-gray-500 hover:text-gray-700"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <div className="p-1.5 bg-blue-50 rounded-md">
                <Tag size={16} className="text-blue-600" />
              </div>
              Service Name
            </label>
            <InputForm
              Icon={Tag}
              placeholder="e.g., Pet Grooming, Veterinary Consultation"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
            />
          </div>

          {/* Description */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
              <div className="p-1.5 bg-purple-50 rounded-md">
                <FileText size={16} className="text-purple-600" />
              </div>
              Service Description
            </label>
            <MarkdownForm
              handleEditorChange={handleEditorChange}
              placeholder="Describe the service, features, and benefits..."
            />
          </div>

          {/* Grid for Price and Duration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Duration */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <div className="p-1.5 bg-orange-50 rounded-md">
                  <Clock size={16} className="text-orange-600" />
                </div>
                Duration (minutes) *
              </label>
              <InputForm
                Icon={Clock}
                placeholder="e.g., 60"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleChange}
                min="1"
              />
            </div>

            {/* Price */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <div className="p-1.5 bg-green-50 rounded-md">
                  <DollarSign size={16} className="text-green-600" />
                </div>
                Price *
              </label>
              <InputForm
                Icon={DollarSign}
                placeholder="e.g., 50000"
                name="price"
                type="number"
                value={formData.price}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          {/* Grid for Type and Pricing Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Service Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <div className="p-1.5 bg-indigo-50 rounded-md">
                  <Layers size={16} className="text-indigo-600" />
                </div>
                Service Type
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white hover:border-gray-300"
              >
                {SERVICE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Pricing Type */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                <div className="p-1.5 bg-green-50 rounded-md">
                  <DollarSign size={16} className="text-green-600" />
                </div>
                Pricing Type
              </label>
              <select
                name="pricingType"
                value={formData.pricingType}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-white hover:border-gray-300"
              >
                {PRICING_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt
                      .replace("_", " ")
                      .split(" ")
                      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                      .join(" ")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-7 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setOpenAdd(false)}
              className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 bg-linear-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:shadow-lg hover:from-green-700 hover:to-green-800 transition duration-200 disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} />
                  Adding...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Add Service
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
