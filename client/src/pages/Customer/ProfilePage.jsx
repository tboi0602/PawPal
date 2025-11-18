import { useState, useRef } from "react";
import { getItem, setItem } from "../../utils/operations";
import InputForm from "../../components/inputs/InputForm";
import {
  ImagePlus,
  User,
  Trash2,
  Home,
  Phone,
  Mail,
  Star,
  Save,
  X,
} from "lucide-react"; // Thêm Save và X
import { editUser } from "../../services/users/userAPI";
import Swal from "sweetalert2";
import { Loader2 } from "../../components/models/Loaders/Loader2";

export const ProfilePage = () => {
  const [user, setUser] = useState(getItem("user-data") || {});
  const initialTempUser = { ...user, address: user.address || [] };
  const [tempUser, setTempUser] = useState(initialTempUser);
  const [isEdit, setIsEdit] = useState(false);
  const fileInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState(user?.image || null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "number" ? (value === "" ? "" : Number(value)) : value;

    setTempUser((prev) => {
      if (name.startsWith("address")) {
        const indexMatch = name.match(/\[(\d+)\]/);
        if (!indexMatch) return prev; // Bảo vệ trường hợp không tìm thấy index
        const index = parseInt(indexMatch[1], 10);
        const newAddress = [...(prev.address || [])];
        newAddress[index] = newValue;
        return { ...prev, address: newAddress };
      }
      return { ...prev, [name]: newValue };
    });
  };

  const handleEdit = () => {
    setTempUser({ ...user, address: user.address || [] });
    setImagePreview(user?.image || null);
    setIsEdit(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    const formData = new FormData();
    for (const key in tempUser) {
      if (key === "image" && tempUser[key] instanceof File) {
        formData.append(key, tempUser[key]);
      } else if (key === "address" && Array.isArray(tempUser[key])) {
        // Filter out empty addresses before sending
        tempUser[key].forEach((item, index) =>
          formData.append(`${key}[${index}]`, item)
        );
      } else {
        formData.append(key, tempUser[key]);
      }
    }

    try {
      const data = await editUser(user._id, formData);
      if (!data.success) {
        Swal.fire({
          toast: true,
          position: "top-right",
          icon: "error",
          title: "Update failed!",
          text: data.message,
          showConfirmButton: false,
          timer: 3000,
        });
        return;
      }
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: data.message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      setUser(data.user); // Cập nhật state với dữ liệu mới từ server
      setItem("user-data", data.user);
      setIsEdit(false);
    } catch (error) {
      console.error("Error during save:", error);
      Swal.fire({
        toast: true,
        position: "top-right",
        icon: "error",
        title: "An unexpected error occurred.",
        showConfirmButton: false,
        timer: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setTempUser({ ...user, address: user.address || [] });
    setImagePreview(user?.image || null);
    setIsEdit(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setImagePreview(fileUrl);
      setTempUser((prev) => ({ ...prev, image: file }));
    }
  };

  const handleNewAddress = () => {
    setTempUser((prev) => ({
      ...prev,
      // Đảm bảo address là mảng trước khi thêm
      address: [...(prev.address || []), ""],
    }));
  };

  const handleDeleteAddress = (indexToDelete) => {
    setTempUser((prev) => ({
      ...prev,
      address: (prev.address || []).filter(
        (_, index) => index !== indexToDelete
      ),
    }));
  };

  const handleSetDefaultAddress = (indexToSetDefault) => {
    setTempUser((prev) => {
      const currentAddress = [...(prev.address || [])];
      if (indexToSetDefault >= currentAddress.length || indexToSetDefault < 0)
        return prev;

      const [defaultAddress] = currentAddress.splice(indexToSetDefault, 1);
      currentAddress.unshift(defaultAddress); // Đẩy lên vị trí đầu tiên
      return { ...prev, address: currentAddress };
    });
  };

  const displayUser = isEdit ? tempUser : user;

  return (
    <div className="p-16 w-full flex flex-col justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white rounded-xl w-full max-w-4xl flex flex-col items-center justify-center gap-4 shadow-2xl">
        {/* Tiêu đề */}
        <h1 className=" w-full text-2xl sm:text-3xl font-bold bg-black text-white p-4 rounded-t-xl text-center">
          User Information
        </h1>

        {/* Phần Avatar và Role */}
        <div className="bg-white rounded-xl w-full flex flex-col items-center justify-center gap-2 p-4">
          {/* Avatar */}
          <h1
            className={`relative flex justify-center items-center w-32 h-32 sm:w-40 sm:h-40 bg-white border-4 rounded-full overflow-hidden ${
              isEdit
                ? "cursor-pointer hover:border-blue-500 border-dashed"
                : "border-gray-300"
            } transition-all duration-300`}
            onClick={() => isEdit && fileInputRef.current.click()}
          >
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
              onChange={handleImageChange}
              ref={fileInputRef}
              disabled={!isEdit}
            />

            {imagePreview ? (
              <img
                src={imagePreview}
                alt="avatar"
                className="object-cover w-full h-full"
              />
            ) : (
              <User className="w-1/2 h-1/2 text-gray-400" />
            )}

            {isEdit && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-sm sm:text-lg font-bold opacity-0 hover:opacity-100 transition-opacity duration-300">
                <ImagePlus className="w-1/4 h-1/4" />
                Choose Photo
              </div>
            )}
          </h1>

          {/* Role, Email, Points (Cải thiện spacing) */}
          <div className="bg-black text-white font-bold px-3 py-1 text-sm rounded-lg mt-2">
            {displayUser?.role}
          </div>
          <div className="font-bold px-2 py-1 rounded-lg flex flex-wrap justify-center gap-x-4 gap-y-1 text-sm sm:text-base">
            <div className="flex gap-1 items-center text-gray-700">
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
              {displayUser.email}
            </div>
            <div className="flex gap-1 items-center text-gray-700">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />
              {displayUser.loyaltyPoints || 0} Points
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 p-4 sm:p-6 md:p-8 border-t border-gray-200">
          {/* Các input trường thông tin cơ bản */}
          <div className="space-y-1">
            <div className="font-semibold text-gray-700">Name</div>
            <InputForm
              name="name"
              value={displayUser?.name || ""}
              type="text"
              onChange={handleChange}
              disabled={!isEdit}
              Icon={User}
            />
          </div>
          <div className="space-y-1">
            <div className="font-semibold text-gray-700">Number phone</div>
            <InputForm
              name="phone"
              value={displayUser?.phone || ""}
              type="number"
              onChange={handleChange}
              disabled={!isEdit}
              Icon={Phone}
            />
          </div>

          {/* Trường Address */}
          <div className="col-span-1 md:col-span-2 flex flex-col gap-3 mt-4">
            <h3 className="text-xl font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
              <Home className="w-6 h-6 text-indigo-600" />
              Delivery Addresses
            </h3>

            {/* Danh sách địa chỉ */}
            {(displayUser?.address || []).map((a, index) => (
              <div key={index} className="flex flex-col gap-1">
                <p className="flex items-center gap-2 text-gray-700 font-medium text-sm">
                  Address {index + 1}
                  {index === 0 && (
                    <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                      Default
                    </span>
                  )}
                </p>
                <div className="flex w-full items-stretch rounded-lg border bg-white border-zinc-300 shadow-sm">
                  {/* Input */}
                  <input
                    type="text"
                    value={a || ""}
                    name={`address[${index}]`}
                    className="px-3 py-2 sm:px-4 sm:py-3 w-full rounded-l-lg outline-none bg-white text-zinc-800 placeholder:text-zinc-500 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm sm:text-base"
                    onChange={handleChange}
                    disabled={!isEdit}
                    placeholder="Enter a detailed address"
                  />

                  {/* Các nút hành động */}
                  {isEdit && (
                    <div className="flex gap-0 p-1 sm:p-2 border-l border-zinc-300 shrink-0">
                      {/* Đặt mặc định */}
                      {index !== 0 && (
                        <button
                          onClick={() => handleSetDefaultAddress(index)}
                          className="p-1 sm:p-2 text-gray-600 hover:text-blue-500 rounded-lg hover:bg-blue-50 transition"
                          title="Set as Default"
                        >
                          <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      )}
                      {/* Xóa */}
                      <button
                        onClick={() => handleDeleteAddress(index)}
                        className="p-1 sm:p-2 text-red-500 hover:text-white rounded-lg hover:bg-red-500 transition"
                        title="Delete Address"
                      >
                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Nút Thêm Địa chỉ mới */}
            {isEdit && (
              <button
                onClick={handleNewAddress}
                className="bg-gray-100 text-black font-semibold text-sm sm:text-base px-4 py-2 rounded-lg border-dashed border-2 border-gray-400 hover:bg-gray-200 transition mt-2"
              >
                + Add New Address
              </button>
            )}
          </div>
        </div>

        {/* Nút Edit/Save/Cancel */}
        <div className="w-full p-4 sm:p-6 flex justify-end gap-3 sm:gap-4 rounded-b-xl border-t border-gray-200">
          {!isEdit ? (
            <button
              onClick={handleEdit}
              className="flex items-center gap-2 bg-black text-white font-bold px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-150 cursor-pointer text-sm sm:text-base"
            >
              <User className="w-4 h-4 sm:w-5 sm:h-5" /> Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="flex items-center gap-2 bg-white text-black font-bold px-4 sm:px-6 py-2 rounded-lg border border-black hover:bg-gray-100 transition duration-150 cursor-pointer text-sm sm:text-base"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isLoading}
                className={`flex items-center gap-2 bg-black text-white font-bold px-4 sm:px-6 py-2 rounded-lg 
        hover:bg-gray-800 transition duration-150 disabled:cursor-not-allowed disabled:bg-gray-500 text-sm sm:text-base`}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <Loader2 />
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 sm:w-5 sm:h-5" /> Save Changes
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
