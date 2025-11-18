import { useState, useEffect } from "react";
import { X, Eye, AlertCircle } from "lucide-react";
import Swal from "sweetalert2";
import { getSolutionById } from "../../../services/solutions/solutionAPI";
import { Loader2 } from "../Loaders/Loader2";
import { formatDate } from "../../../utils/formatDate";

export const ServiceDetailsModel = ({ serviceId, setOpenDetails }) => {
  const [serviceData, setServiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchService = async () => {
      try {
        const res = await getSolutionById(serviceId);
        if (res.success) {
          setServiceData(res.solution);
        } else {
          Swal.fire(
            "Error!",
            res.message || "Failed to load service.",
            "error"
          );
          setOpenDetails(false);
        }
      } catch (error) {
        Swal.fire(
          "Error!",
          error.message || "An unexpected error occurred.",
          "error"
        );
        setOpenDetails(false);
      } finally {
        setIsLoading(false);
      }
    };

    if (serviceId) {
      fetchService();
    }
  }, [serviceId, setOpenDetails]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
          <Loader2 size={32} className="animate-spin" />
        </div>
      </div>
    );
  }

  if (!serviceData) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white p-8 rounded-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto shadow-lg border border-gray-200">
        <div className="flex justify-between items-center border-b pb-3 mb-6">
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <Eye className="text-blue-600" size={28} />
            Service Details
          </h2>
          <X
            className="cursor-pointer text-gray-500 hover:text-red-500 transition"
            size={24}
            onClick={() => setOpenDetails(false)}
          />
        </div>

        <div className="space-y-6">
          {/* Service Name */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-1">
              Service Name
            </h3>
            <p className="text-lg font-bold text-gray-800">
              {serviceData.name}
            </p>
          </div>

          {/* Duration, Price, Type, Pricing Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-600 uppercase mb-1">
                Duration
              </h3>
              <p className="text-sm text-gray-700 font-semibold">
                {serviceData.duration} minutes
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-600 uppercase mb-1">
                Price
              </h3>
              <p className="text-sm text-gray-700 font-semibold">
                {serviceData.price?.toLocaleString("vi-VN")} VND
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-600 uppercase mb-1">
                Service Type
              </h3>
              <p className="text-sm text-gray-700 font-semibold capitalize">
                {serviceData.type}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-600 uppercase mb-1">
                Pricing Type
              </h3>
              <p className="text-sm text-gray-700 font-semibold capitalize">
                {serviceData.pricingType?.replace("_", " ")}
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">
              Description
            </h3>
            <div
              className="prose prose-sm max-w-none text-gray-700 bg-white p-4 rounded border border-gray-100"
              dangerouslySetInnerHTML={{ __html: serviceData.description }}
            ></div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {serviceData.createdAt && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-600 uppercase mb-1">
                  Created At
                </h3>
                <p className="text-sm text-gray-700">
                  {formatDate(serviceData.createdAt)}
                </p>
              </div>
            )}

            {serviceData.updatedAt && (
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-xs font-semibold text-gray-600 uppercase mb-1">
                  Last Updated
                </h3>
                <p className="text-sm text-gray-700">
                  {formatDate(serviceData.updatedAt)}
                </p>
              </div>
            )}
          </div>

          {/* Service ID */}
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h3 className="text-xs font-semibold text-gray-600 uppercase mb-1">
              Service ID
            </h3>
            <p className="text-xs font-mono text-gray-600 break-all">
              {serviceData._id}
            </p>
          </div>

          {/* Close Button */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              onClick={() => setOpenDetails(false)}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
