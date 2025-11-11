import InputForm from "../../inputs/InputForm";
import { useState } from "react";
import Swal from "sweetalert2";
import { Loader2 } from "../Loaders/Loader2";
import { addNotifications } from "../../../services/notifications/notificationAPI";
import { X, Tag } from "lucide-react";
import { getItem } from "../../../utils/operations";

export const AddNotificationModel = ({ setOpenAdd, reloadNotifications }) => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "SALE",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const senderId = getItem("user-data")._id;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    setMessage("");
    if (!formData.title || !formData.content || !formData.type) {
      setIsLoading(false);
      setMessage("Please fill in completely!");
      return;
    }

    try {
      const dataRes = await addNotifications(senderId, formData);

      if (!dataRes.success) {
        setMessage(dataRes.message || "Failed to add notification.");
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
        title: dataRes.message || "New notification member added successfully!",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
      });

      setFormData({
        title: "",
        content: "",
        type: "",
      });

      reloadNotifications();
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
          Add New Notification
        </h2>

        {/* Error Message */}
        {message && (
          <p className="text-center text-red-600 mb-4 font-medium">{message}</p>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-x-6 gap-y-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-black">Title</label>
              <InputForm
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                Icon={Tag}
                onChange={handleChange}
                className="border-neutral-300 focus:border-black focus:ring-0"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-black">
                Content
              </label>
              <textarea
                name="content"
                placeholder="Content"
                value={formData.content}
                onChange={handleChange}
                className="outline-none border border-gray-200 rounded-lg p-3"
              ></textarea>
            </div>
            <div className="flex flex-col gap-1 ">
              <label
                className="text-sm font-semibold text-black"
                htmlFor="type-select"
              >
                Type
              </label>
              <select
                id="type-select"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full rounded-lg border border-neutral-300 bg-white p-3 text-gray-900 
                focus:border-black focus:ring-0 appearance-none pr-8"
              >
                <option value="SALE">SALE</option>
                <option value="MAINTENANCE">MAINTENANCE</option>
              </select>
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
              "Send Notification"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
