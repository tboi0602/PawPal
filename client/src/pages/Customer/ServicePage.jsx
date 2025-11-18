import {
  Search,
  Clock,
  MapPin,
  Users,
  AlertCircle,
  X,
  ChevronLeft, // Thêm icon cho nút Back
} from "lucide-react";
import { BackToTop } from "../../components/buttons/BackToTop";
import { getSolutions } from "../../services/solutions/solutionAPI";
import { getResourcesBySolutionId } from "../../services/solutions/bookingAPI";
import { getPets } from "../../services/users/petAPI";
import { useCallback, useEffect, useState } from "react";
import { Loader } from "../../components/models/Loaders/Loader";
import Swal from "sweetalert2";
import { getItem } from "../../utils/operations";
import { generateMoMO } from "../../services/payment/momoAPI";

// Định nghĩa màu chủ đạo mới: Primary là Đen/Trắng
const PRIMARY_COLOR = "bg-gray-900"; // Thay thế blue-600/700
const PRIMARY_TEXT = "text-white";
const SECONDARY_BG = "bg-gray-100"; // Thay thế slate-50/blue-50
const BORDER_COLOR = "border-gray-300";

// --- Components Con ---

/**
 * Thẻ hiển thị thông tin dịch vụ
 */
const ServiceCard = ({ service, onSelect }) => {
  const typeLabel = {
    caring: "Care",
    cleaning: "Cleaning",
    beauty: "Beauty",
  };

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 hover:border-black hover:shadow-md transition duration-200 overflow-hidden cursor-pointer"
      onClick={() => onSelect(service)}
    >
      <div className="p-6">
        <h3 className="text-lg font-bold text-black mb-2">{service.name}</h3>
        <div className="flex items-center gap-2 flex-wrap mb-4">
          <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded capitalize">
            {typeLabel[service.type] || service.type}
          </span>
          <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded">
            {service.pricingType?.replace("_", " ")}
          </span>
        </div>

        <p className="text-gray-600 text-sm line-clamp-2 mb-4 h-10">
          {service.description?.replace(/<[^>]*>/g, "") ||
            "Professional service"}
        </p>

        <div className="grid grid-cols-2 gap-4 border-t border-gray-200 pt-4">
          <div>
            <p className="text-xs text-gray-500 font-medium">Duration</p>
            <p className="text-base font-bold text-black">
              {service.duration}m
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium">Price</p>
            <p className="text-base font-bold text-black">
              {service.price?.toLocaleString("vi-VN")}đ
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect(service);
          }}
          className="w-full mt-4 py-2 bg-black text-white font-semibold rounded-lg hover:bg-gray-900 transition duration-200"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

/**
 * Các nút lọc dịch vụ theo loại
 */
const FilterTabs = ({ services, activeFilter, onFilterChange }) => {
  const uniqueTypes = [...new Set(services.map((s) => s.type).filter(Boolean))];

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onFilterChange(null)}
        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
          activeFilter === null
            ? "bg-black text-white"
            : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
        }`}
      >
        All
      </button>
      {uniqueTypes.map((type) => (
        <button
          key={type}
          onClick={() => onFilterChange(type)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors capitalize ${
            activeFilter === type
              ? "bg-black text-white"
              : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
          }`}
        >
          {type}
        </button>
      ))}
    </div>
  );
};

/**
 * Modal chi tiết dịch vụ
 */
const ServiceDetailsModal = ({ service, isOpen, onClose, onBookingClick }) => {
  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className={`p-6 sticky top-0 bg-white border-b ${BORDER_COLOR}`}>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {service.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Professional pet care service
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 p-1 transition rounded-full"
            >
              <X size={24} />
            </button>
          </div>
          <div className="flex gap-2 flex-wrap mt-3">
            <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-md capitalize">
              {service.type}
            </span>
            <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 text-xs font-semibold rounded-md">
              {service.pricingType?.replace("_", " ")}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wider">
              Description
            </h3>
            <p
              className={`text-gray-700 text-sm leading-relaxed ${SECONDARY_BG} p-4 rounded-lg border border-gray-200`}
            >
              {service.description?.replace(/<[^>]*>/g, "") ||
                "Professional service"}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <DetailBox title="Duration" value={`${service.duration} min`} />
            <DetailBox
              title="Price"
              value={`${service.price?.toLocaleString("vi-VN")} đ`}
            />
            <DetailBox title="Type" value={service.type} capitalize={true} />
            <DetailBox
              title="Billing"
              value={service.pricingType?.replace("_", " ")}
              capitalize={true}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-3 border ${BORDER_COLOR} text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition`}
            >
              Close
            </button>
            <button
              onClick={onBookingClick}
              className={`flex-1 px-4 py-3 ${PRIMARY_COLOR} hover:bg-gray-700 ${PRIMARY_TEXT} font-semibold rounded-lg transition shadow-md`}
            >
              Book Service
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper component cho chi tiết trong modal
const DetailBox = ({ title, value, capitalize = false }) => (
  <div className={`p-4 rounded-lg border border-gray-200 ${SECONDARY_BG}`}>
    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2">
      {title}
    </p>
    <p
      className={`text-lg font-bold text-gray-900 ${
        capitalize ? "capitalize" : ""
      }`}
    >
      {value}
    </p>
  </div>
);

/**
 * Modal đặt lịch (Booking Modal)
 */
const BookingModal = ({ service, isOpen, onClose, onBookingSuccess }) => {
  const [step, setStep] = useState(1);
  const [resources, setResources] = useState([]);
  const [userPets, setUserPets] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [bookingData, setBookingData] = useState({
    userId: "",
    dateStarts: "",
    pets: [{ petId: "", petName: "", resourceId: "" }],
    hireShipper: false,
    insurance: false,
    shipperAddress: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Load current user and set userId automatically
  useEffect(() => {
    const userData = getItem("user-data");
    if (userData) {
      setBookingData((prev) => ({
        ...prev,
        userId: userData._id || "",
      }));
    }
  }, []);

  // Load user pets using petAPI
  const loadUserPets = useCallback(async () => {
    try {
      const userData = getItem("user-data");
      if (!userData || !userData._id) return;

      const data = await getPets(userData._id);
      if (data.success) {
        setUserPets(data.pets || data.data || []);
      }
    } catch (error) {
      console.error("Error loading pets:", error);
    }
  }, []);

  // Load resources using bookingAPI
  const loadResourcesCallback = useCallback(async () => {
    try {
      const data = await getResourcesBySolutionId(service._id);
      if (data.success) {
        setResources(data.resources || []);
      } else {
        Swal.fire("Error", "Failed to load available resources", "error");
      }
    } catch (error) {
      Swal.fire("Error", error.message, "error");
    }
  }, [service?._id]);

  // Load already booked time slots (excluding cancelled bookings)
  const loadBookedSlots = useCallback(async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api-solution/booking?solutionId=${service._id}&status=pending,confirmed`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
        }
      );
      const data = await response.json();
      if (data.success) {
        setBookedSlots(data.bookings || []);
      }
    } catch (error) {
      console.error("Error loading booked slots:", error);
    }
  }, [service?._id]);

  useEffect(() => {
    if (isOpen && service?._id) {
      setStep(1);
      setSelectedResource(null);
      setBookingData({
        userId: getItem("user-data")._id || "",
        dateStarts: "",
        pets: [{ petId: "", petName: "", resourceId: "" }],
        hireShipper: false,
        insurance: false,
      });
      loadResourcesCallback();
      loadUserPets();
      loadBookedSlots();
    }
  }, [
    isOpen,
    service?._id,
    loadResourcesCallback,
    loadUserPets,
    loadBookedSlots,
  ]);

  const handleSelectResource = (resource) => {
    setSelectedResource(resource);
    setBookingData((prev) => ({
      ...prev,
      pets: [
        {
          petId: prev.pets[0].petId || "",
          petName: "",
          resourceId: resource._id,
        },
      ],
    }));
    setStep(2);
  };

  const calculateTotal = () => {
    let total = service.price || 0;
    if (selectedResource?.upcharge) {
      total += (total * selectedResource.upcharge) / 100;
    }
    if (bookingData.hireShipper) {
      total += 50000; // Shipper fee
    }
    if (bookingData.insurance) {
      total += 20000; // Insurance fee
    }
    return total;
  };

  const handleBooking = async () => {
    const { userId, dateStarts, pets, hireShipper, insurance, shipperAddress } =
      bookingData;

    if (!userId) {
      Swal.fire("Error", "User ID not found. Please log in again.", "error");
      return;
    }

    if (!dateStarts) {
      Swal.fire(
        "Validation Error",
        "Please select a date and time.",
        "warning"
      );
      return;
    }

    if (!pets[0].petId) {
      Swal.fire(
        "Validation Error",
        "Please select a pet from your list.",
        "warning"
      );
      return;
    }

    if (hireShipper && !shipperAddress) {
      Swal.fire(
        "Validation Error",
        "Please enter a shipping address.",
        "warning"
      );
      return;
    }

    setIsLoading(true);
    try {
      // Step 1: Create booking with status "pending"
      const totalAmount = calculateTotal();
      const orderInfo = `Booking Service - ${service.name} for ${pets[0].petName}`;

      console.log("Creating booking...");
      const createBookingResponse = await fetch(
        `http://localhost:5000/api-solution/booking/for-payment`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            solutionId: service._id,
            userId,
            dateStarts,
            pets,
            hireShipper,
            insurance,
            shipperAddress: hireShipper ? shipperAddress : null,
          }),
        }
      );

      const bookingResult = await createBookingResponse.json();
      console.log("Booking creation result:", bookingResult);

      if (!bookingResult.success) {
        Swal.fire(
          "Error",
          bookingResult.message || "Failed to create booking",
          "error"
        );
        setIsLoading(false);
        return;
      }

      const bookingId =
        bookingResult.booking.bookingId || bookingResult.booking._id;
      console.log("Booking created successfully. BookingId:", bookingId);

      // Step 2: Generate MoMo payment link with bookingId
      const momoResponse = await generateMoMO(
        bookingId,
        totalAmount,
        orderInfo,
        true // isServiceBooking flag
      );

      if (momoResponse.payUrl) {
        // Redirect to MoMo payment
        console.log("Redirecting to MoMo:", momoResponse.payUrl);
        window.location.href = momoResponse.payUrl;
      } else {
        Swal.fire(
          "Error",
          momoResponse.message || "Failed to initiate MoMo payment",
          "error"
        );
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error in handleBooking:", error);
      Swal.fire("Error", error.message || "Something went wrong", "error");
      setIsLoading(false);
    }
  };

  if (!isOpen || !service) return null;

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200">
        {/* Header */}
        <div className={`bg-white border-b ${BORDER_COLOR} p-6 sticky top-0`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {step === 1 ? "Select Location & Resource" : "Booking Details"}
              </h2>
              <p className="text-sm text-gray-600 mt-1">{service.name}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-900 p-1 transition rounded-full"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 1 ? (
            // Step 1: Resource Selection
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Available Resources
              </h3>
              {resources.length > 0 ? (
                <div className="grid gap-4">
                  {resources.map((resource) => (
                    <div
                      key={resource._id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-gray-900 hover:bg-gray-50 transition cursor-pointer"
                      onClick={() => handleSelectResource(resource)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-bold text-lg text-gray-900">
                          {resource.name}
                        </h3>
                        <span className="text-xs font-semibold px-3 py-1 bg-gray-200 text-gray-800 rounded">
                          {resource.type}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mt-2">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <MapPin size={14} />
                          <span>{resource.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Users size={14} />
                          <span>Max {resource.maxCapacity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock size={14} />
                          <span>
                            {resource.startTime} - {resource.endTime}
                          </span>
                        </div>
                        <div className="text-gray-600 text-right font-medium">
                          {resource.upcharge > 0 &&
                            `+${resource.upcharge.toLocaleString("vi-VN")}đ`}
                        </div>
                      </div>

                      {/* Time Slots Display */}
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                          Available Time Slots
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {/* Available times (example: 08:00, 09:00, 10:00, etc.) */}
                          {resource.startTime && resource.endTime && (
                            <>
                              {[
                                "08:00",
                                "09:00",
                                "10:00",
                                "11:00",
                                "12:00",
                                "13:00",
                                "14:00",
                                "15:00",
                                "16:00",
                              ].map((time) => (
                                <span
                                  key={time}
                                  className="px-3 py-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 rounded"
                                >
                                  ✓ {time}
                                </span>
                              ))}
                            </>
                          )}
                        </div>
                      </div>

                      {/* Days of Week */}
                      <div className="mt-3 flex flex-wrap gap-1.5 border-t pt-3 border-gray-100">
                        {resource.dayOfWeek?.map((day) => (
                          <span
                            key={day}
                            className="text-xs px-2.5 py-1 bg-gray-100 text-gray-700 font-medium rounded-full"
                          >
                            {day.slice(0, 3)}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                  <AlertCircle size={32} className="mx-auto mb-3 opacity-60" />
                  <p>No resources available for this service</p>
                </div>
              )}
            </div>
          ) : (
            // Step 2: Booking Form
            <div className="space-y-6">
              {/* Selected Resource Info */}
              {selectedResource && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-900 flex items-center gap-2">
                    <MapPin size={16} className="text-gray-700" />
                    <span className="font-semibold">Selected: </span>
                    {selectedResource.name} at {selectedResource.location}
                    {selectedResource.upcharge > 0 &&
                      ` (+${selectedResource.upcharge.toLocaleString(
                        "vi-VN"
                      )}đ)`}
                  </p>
                </div>
              )}

              {/* Service Details & Pricing */}
              <div className="bg-linear-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Duration
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {service.duration} min
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Base Price
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {service.price?.toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-600 uppercase tracking-wide">
                      Total
                    </p>
                    <p className="text-lg font-bold text-blue-600">
                      {calculateTotal().toLocaleString("vi-VN")} đ
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Form */}
              <form
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleBooking();
                }}
              >
                <div>
                  <label
                    htmlFor="dateStarts"
                    className="block text-sm font-bold text-gray-900 mb-2"
                  >
                    Date & Time *
                  </label>
                  <input
                    id="dateStarts"
                    type="datetime-local"
                    required
                    value={bookingData.dateStarts}
                    onChange={(e) =>
                      setBookingData((prev) => ({
                        ...prev,
                        dateStarts: e.target.value,
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />

                  {/* Booked Times Info */}
                  {bookedSlots.length > 0 && (
                    <div className="mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-amber-900 mb-2">
                        ⏰ Already Booked Times (Cannot Select):
                      </p>
                      <div className="space-y-1">
                        {bookedSlots.map((booking, idx) => (
                          <p key={idx} className="text-xs text-amber-800">
                            •{" "}
                            {new Date(booking.dateStarts).toLocaleString(
                              "vi-VN"
                            )}{" "}
                            -{" "}
                            {new Date(booking.dateEnd).toLocaleString("vi-VN")}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resource Working Hours */}
                  {selectedResource && (
                    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">
                        ⏰ Resource Working Hours:
                      </p>
                      <p className="text-sm text-blue-800 font-medium">
                        {selectedResource.startTime} -{" "}
                        {selectedResource.endTime}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Available on: {selectedResource.dayOfWeek?.join(", ")}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="petId"
                    className="block text-sm font-bold text-gray-900 mb-2"
                  >
                    Select Your Pet *
                  </label>
                  {userPets.length > 0 ? (
                    <select
                      id="petId"
                      required
                      value={bookingData.pets[0].petId}
                      onChange={(e) => {
                        const selectedPet = userPets.find(
                          (p) => p._id === e.target.value
                        );
                        const newPets = [...bookingData.pets];
                        newPets[0].petId = e.target.value;
                        newPets[0].petName = selectedPet?.name || "";
                        // Preserve resourceId from previous booking data
                        newPets[0].resourceId =
                          bookingData.pets[0].resourceId || "";
                        setBookingData((prev) => ({ ...prev, pets: newPets }));
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white text-black"
                    >
                      <option value="">Choose a pet...</option>
                      {userPets.map((pet) => (
                        <option key={pet._id} value={pet._id}>
                          {pet.name} ({pet.type})
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                      <p className="text-sm text-amber-800 font-medium">
                        ⚠️ You haven't added any pets yet.
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        Please add a pet to your profile before booking
                        services.
                      </p>
                      <button
                        type="button"
                        onClick={() => (window.location.href = "/home/pets")}
                        className="mt-3 px-4 py-2 bg-amber-600 text-white text-sm font-semibold rounded-lg hover:bg-amber-700 transition"
                      >
                        Go to Pets
                      </button>
                    </div>
                  )}
                </div>

                {/* Additional Services - Hire Shipper & Insurance */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    Additional Services
                  </h3>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingData.hireShipper}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          hireShipper: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Hire Shipper
                      </p>
                      <p className="text-xs text-gray-600">
                        +50,000₫ - We will pick up and drop off your pet
                      </p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bookingData.insurance}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          insurance: e.target.checked,
                        }))
                      }
                      className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Pet Insurance
                      </p>
                      <p className="text-xs text-gray-600">
                        +20,000₫ - Full coverage in case of incidents
                      </p>
                    </div>
                  </label>
                </div>

                {/* Shipping Address - Show only if hireShipper is selected */}
                {bookingData.hireShipper && (
                  <div>
                    <label
                      htmlFor="shipperAddress"
                      className="block text-sm font-bold text-gray-900 mb-2"
                    >
                      Shipping Address *
                    </label>
                    <textarea
                      id="shipperAddress"
                      placeholder="Enter detailed address for pickup and dropoff..."
                      value={bookingData.shipperAddress}
                      onChange={(e) =>
                        setBookingData((prev) => ({
                          ...prev,
                          shipperAddress: e.target.value,
                        }))
                      }
                      rows="3"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                      required={bookingData.hireShipper}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      We will use this address for pickup and dropoff services
                    </p>
                  </div>
                )}

                {/* User ID (auto-detected, read-only) */}
                <div>
                  <label
                    htmlFor="userId"
                    className="block text-sm font-bold text-gray-900 mb-2"
                  >
                    Your User ID
                  </label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 text-sm">
                    {bookingData.userId || "Loading..."}
                  </div>
                </div>
              </form>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setStep(1)}
                  className={`flex-1 px-4 py-3 border ${BORDER_COLOR} text-gray-700 font-semibold rounded-lg hover:bg-gray-100 transition flex items-center justify-center gap-1`}
                >
                  <ChevronLeft size={18} />
                  Back to Resources
                </button>
                <button
                  onClick={handleBooking}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-3 ${PRIMARY_COLOR} hover:bg-gray-700 ${PRIMARY_TEXT} font-semibold rounded-lg transition disabled:opacity-50 shadow-md`}
                >
                  {isLoading ? "Processing..." : "Confirm Booking"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- Component Trang Chủ ---

export const ServicePage = () => {
  const [services, setServices] = useState([]);
  const [filteredServices, setFilteredServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [bookingOpen, setBookingOpen] = useState(false);

  // Tải services
  const loadServices = useCallback(async () => {
    setIsLoading(true);
    try {
      // Giả sử getSolutions trả về format: { success: boolean, solutions: array }
      const response = await getSolutions();
      if (response.success) {
        setServices(response.solutions || []);
      } else {
        Swal.fire("Error", "Failed to load services", "error");
      }
    } catch (error) {
      console.error("Fetch services error:", error);
      Swal.fire("Error", error.message || "Failed to load services", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  // Filter và search
  useEffect(() => {
    let filtered = services;

    if (activeFilter) {
      filtered = filtered.filter((s) => s.type === activeFilter);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name?.toLowerCase().includes(searchLower) ||
          s.description?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredServices(filtered);
  }, [services, activeFilter, search]);

  const handleSelectService = (service) => {
    setSelectedService(service);
    setDetailsOpen(true);
    setBookingOpen(false); // Đảm bảo modal booking đóng
  };

  const handleBookingClick = () => {
    setDetailsOpen(false);
    setBookingOpen(true);
  };

  const handleCloseDetails = () => {
    setDetailsOpen(false);
    setSelectedService(null);
  };

  const handleCloseBooking = () => {
    setBookingOpen(false);
    setSelectedService(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-white">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black">
      {/* Header */}
      <div className="border-b border-gray-200 py-12 px-4 md:px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-black mb-3">
            Professional Services
          </h1>
          <p className="text-gray-600 text-lg">
            Discover our premium pet care services
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black focus:border-black text-black placeholder-gray-500"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="mb-10">
          <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">
            Filter by Type
          </h3>
          <FilterTabs
            services={services}
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
          />
        </div>

        {/* Services Grid */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-8">
            {filteredServices.length} Service
            {filteredServices.length !== 1 ? "s" : ""} Available
          </h2>
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredServices.map((service) => (
                <ServiceCard
                  key={service._id}
                  service={service}
                  onSelect={handleSelectService}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
              <AlertCircle size={40} className="mx-auto mb-4 text-gray-400" />
              <p className="text-lg font-semibold text-gray-900 mb-1">
                No services found
              </p>
              <p className="text-gray-600">
                Try adjusting your search or filter options
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ServiceDetailsModal
        service={selectedService}
        isOpen={detailsOpen}
        onClose={handleCloseDetails}
        onBookingClick={handleBookingClick}
      />

      <BookingModal
        service={selectedService}
        isOpen={bookingOpen}
        onClose={handleCloseBooking}
        onBookingSuccess={() => {
          handleCloseBooking();
          loadServices();
        }}
      />

      <BackToTop />
    </div>
  );
};
