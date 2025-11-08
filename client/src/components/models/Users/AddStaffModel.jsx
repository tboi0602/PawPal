import { useState } from "react";
import { X, Phone, Mail, User, MapPin } from "lucide-react";
import InputForm from "../../inputs/InputForm";
import Swal from "sweetalert2";
import { Loader2 } from "../Loaders/Loader2";
import { addUser } from "../../../services/users/userAPI";

export const AddStaffModel = ({ setOpenAdd, reloadStaffs }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    setMessage("");
    if (!formData.name || !formData.email || !formData.address || !formData.phone) {
      setIsLoading(false);
      setMessage("Please fill in completely!");
      return;
    }

    try {
      const dataRes = await addUser(formData);

      if (!dataRes.success) {
        setMessage(dataRes.message || "Failed to add staff member.");
        setIsLoading(false);
        Swal.fire({
          toast: true,
          position: "top-right",
          icon: "error",
          title: "Addition Failed!",
          text: dataRes.message,
          showConfirmButton: false,
          timer: 5000,
        });
        return;
      }

      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: dataRes.message || "New staff member added successfully!",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });

      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
      });

      reloadStaffs();
      setOpenAdd(false);
    } catch (error) {
      setMessage(`An unexpected error occurred: ${error.message}`);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative z-50 w-full max-w-2xl bg-white text-black shadow-2xl rounded-xl p-6 overflow-y-auto max-h-[90vh] transition-all duration-300">
        {/* Close button */}
        <X
          className="absolute top-4 right-4 cursor-pointer text-neutral-600 hover:text-black transition duration-200"
          onClick={() => setOpenAdd(false)}
          size={24}
        />

        {/* Header */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-black border-b border-black pb-3">
          Add New Staff Member
        </h2>

        {/* Error Message */}
        {message && (
          <p className="text-center text-red-600 mb-4 font-medium">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-black">
                Full Name
              </label>
              <InputForm
                type="text"
                name="name"
                placeholder="Full namme"
                value={formData.name}
                Icon={User}
                onChange={handleChange}
                className="border-neutral-300 focus:border-black focus:ring-0"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-black">Email</label>
              <InputForm
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                Icon={Mail}
                onChange={handleChange}
                className="border-neutral-300 focus:border-black focus:ring-0"
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-black">
                Phone Number
              </label>
              <InputForm
                type="number"
                name="phone"
                placeholder="Number phone"
                value={formData.phone}
                Icon={Phone}
                onChange={handleChange}
                className="border-neutral-300 focus:border-black focus:ring-0"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-black">
                Address
              </label>
              <InputForm
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                Icon={MapPin}
                onChange={handleChange}
                className="border-neutral-300 focus:border-black focus:ring-0"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full p-3 mt-6 rounded-lg text-xl font-bold transition duration-200 bg-black text-white 
            hover:bg-neutral-800 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-500`}
          >
            {isLoading ? (
              <div className="flex justify-center items-center">
                <Loader2 />{" "}
              </div>
            ) : (
              "Save Staff"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModel;
