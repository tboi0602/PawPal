import { useState, useEffect, useCallback } from "react";
import {
  getResources,
  createResource,
  updateResource,
  deleteResource,
} from "../../services/solutions/bookingAPI";
import { getSolutions } from "../../services/solutions/solutionAPI";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  Package,
  MapPin,
  Users,
  Clock,
  DollarSign,
  Calendar,
  AlertCircle,
  SquarePen,
} from "lucide-react";
import { Loader } from "../../components/models/Loaders/Loader.jsx";
import InputForm from "../../components/inputs/InputForm.jsx";
import Swal from "sweetalert2";

export const AdminResourcePage = () => {
  const [search, setSearch] = useState("");

  const [resources, setResources] = useState([]);
  const [solutions, setSolutions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    solution: "",
    name: "",
    maxCapacity: "",
    location: "Floor 1",
    dayOfWeek: [],
    startTime: "",
    endTime: "",
    type: "Basic",
    upcharge: "",
  });

  const days = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Load resources and solutions
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [resResponse, solResponse] = await Promise.all([
        getResources(),
        getSolutions(),
      ]);

      const resourcesArray = Array.isArray(resResponse)
        ? resResponse
        : resResponse?.resources || [];
      const solutionsArray = Array.isArray(solResponse)
        ? solResponse
        : solResponse?.solutions || [];

      setResources(resourcesArray);
      setSolutions(solutionsArray);
    } catch (_error) {
      console.error("Error loading data:", _error);
      setResources([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filter resources based on search
  const filteredResources = resources.filter(
    (resource) =>
      resource.name?.toLowerCase().includes(search.toLowerCase()) ||
      resource.solution?.name?.toLowerCase().includes(search.toLowerCase()) ||
      resource.location?.toLowerCase().includes(search.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenModal = (resource = null) => {
    if (resource) {
      setEditingId(resource._id);
      setFormData({
        solution: resource.solution?._id || resource.solution || "",
        name: resource.name,
        maxCapacity: String(resource.maxCapacity || ""),
        location: resource.location,
        dayOfWeek: resource.dayOfWeek || [],
        startTime: resource.startTime,
        endTime: resource.endTime,
        type: resource.type,
        upcharge: String(resource.upcharge || ""),
      });
    } else {
      setEditingId(null);
      setFormData({
        solution: "",
        name: "",
        maxCapacity: "",
        location: "Floor 1",
        dayOfWeek: [],
        startTime: "",
        endTime: "",
        type: "Basic",
        upcharge: "",
      });
    }
    setModalOpen(true);
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      dayOfWeek: prev.dayOfWeek.includes(day)
        ? prev.dayOfWeek.filter((d) => d !== day)
        : [...prev.dayOfWeek, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      solutionId: formData.solution,
      name: formData.name,
      location: formData.location,
      dayOfWeek: formData.dayOfWeek,
      startTime: formData.startTime,
      endTime: formData.endTime,
      type: formData.type,
      maxCapacity: Number(formData.maxCapacity) || 0,
      upcharge: Number(formData.upcharge) || 0,
    };

    if (!payload.solutionId || !payload.name) {
      Swal.fire({
        icon: "warning",
        title: "Required Fields",
        text: "Please fill in Service and Resource Name.",
      });
      return;
    }

    try {
      if (editingId) {
        await updateResource(editingId, payload);
        Swal.fire({
          icon: "success",
          title: "Updated",
          text: "Resource updated successfully",
          timer: 2000,
        });
      } else {
        await createResource(payload);
        Swal.fire({
          icon: "success",
          title: "Created",
          text: "Resource created successfully",
          timer: 2000,
        });
      }
      setModalOpen(false);
      loadData();
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to save resource",
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    });

    if (result.isConfirmed) {
      try {
        await deleteResource(id);
        setResources((prev) => prev.filter((r) => r._id !== id));
        Swal.fire({
          title: "Deleted!",
          text: "Resource has been deleted.",
          icon: "success",
        });
      } catch {
        Swal.fire({
          title: "Error!",
          text: "Failed to delete resource",
          icon: "error",
        });
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-10">
      {/* Title & Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between w-full pt-4 md:pt-10 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-black shrink-0">
          Manager Resource
        </h1>
        {/* Search Container */}
        <div className="flex w-full md:w-2/3 lg:w-1/2 gap-4 justify-start md:justify-end items-center">
          <div className="w-full relative flex justify-center items-center">
            {/* Search Input */}
            <InputForm
              Icon={Search}
              placeholder="Search resource..."
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
          {/* Add Resource Button */}
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center p-3 rounded-lg bg-black text-white hover:bg-gray-800 transition duration-150 shrink-0 min-w-[120px]"
          >
            <Plus className="w-5 h-5 mr-2" />
            <span className="hidden sm:inline">Add Resource</span>
          </button>
        </div>
      </div>

      {/* Resource Table */}
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
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-[100px]">
                Service
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-left min-w-20">
                Location
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-[100px]">
                Capacity
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-20">
                Type
              </th>
              <th className="px-3 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-center min-w-[100px]">
                Operator
              </th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-100 text-gray-700 text-sm">
            {filteredResources && filteredResources.length > 0
              ? filteredResources.map((resource, index) => (
                  <tr
                    key={resource._id}
                    className="hover:bg-gray-50 transition duration-150"
                  >
                    <td className="px-3 py-3 whitespace-nowrap font-medium text-left">
                      {index + 1}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-left font-medium">
                      {resource.name}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-left">
                      {resource.solution?.name || "N/A"}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-left">
                      {resource.location}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">
                        {resource.maxCapacity} pets
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center uppercase">
                      {resource.type}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-3">
                        <SquarePen
                          className="w-4 cursor-pointer text-gray-500 hover:text-black duration-150"
                          onClick={() => handleOpenModal(resource)}
                        />
                        <Trash2
                          className="w-4 cursor-pointer text-gray-500 hover:text-red-600 duration-150"
                          onClick={() => handleDelete(resource._id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              : null}
          </tbody>
        </table>
        {filteredResources?.length === 0 && !isLoading && (
          <p className="text-center text-red-600 p-4 text-lg">
            No resources found
          </p>
        )}
        {isLoading && (
          <div className="w-full flex justify-center items-center py-10">
            <Loader />
          </div>
        )}
      </div>

      {/* Resource Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
            {/* Modal Header */}
            <div className="bg-black text-white p-6 flex justify-between items-center sticky top-0 z-10 rounded-t-xl">
              <h2 className="text-2xl font-bold">
                {editingId ? "Edit Resource" : "Add New Resource"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 hover:bg-gray-800 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* 1. Service & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Service *
                  </label>
                  <select
                    name="solution"
                    value={formData.solution}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option value="">Select Service</option>
                    {solutions.map((sol) => (
                      <option key={sol._id} value={sol._id}>
                        {sol.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resource Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g., Room A, Area 1"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* 2. Location & Capacity */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option>Floor 1</option>
                    <option>Floor 2</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Capacity
                  </label>
                  <input
                    type="number"
                    name="maxCapacity"
                    min="1"
                    placeholder="Number of pets"
                    value={formData.maxCapacity}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* 3. Time Schedule */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* 4. Type & Upcharge */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  >
                    <option>Basic</option>
                    <option>Premium</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upcharge (%)
                  </label>
                  <input
                    type="number"
                    name="upcharge"
                    min="0"
                    max="100"
                    placeholder="Additional charge %"
                    value={formData.upcharge}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>

              {/* 5. Available Days */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Available Days
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {days.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayToggle(day)}
                      className={`px-3 py-2 rounded-lg font-semibold text-sm transition-colors border ${
                        formData.dayOfWeek.includes(day)
                          ? "bg-black text-white shadow-md hover:bg-gray-800 border-black"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                      }`}
                    >
                      {day.slice(0, 3)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 font-semibold transition-colors shadow-md"
                >
                  {editingId ? "Update Resource" : "Create Resource"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminResourcePage;
