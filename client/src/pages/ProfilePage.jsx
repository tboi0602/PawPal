import { useState, useRef } from "react";
import { getItem, setItem } from "../utils/operations";
import InputForm from "../components/inputs/InputForm";
import { ImagePlus, User, Trash2, Home, Phone, Mail, Star } from "lucide-react";
import { editUser } from "../services/users/userAPI";
import Swal from "sweetalert2";
import { Loader2 } from "../components/models/Loaders/Loader2";

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
        const index = parseInt(name.match(/\[(\d+)\]/)[1], 10);
        const newAddress = [...prev.address];
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
      } else if (Array.isArray(tempUser[key])) {
        tempUser[key]
          .filter((a) => a.trim() !== "")
          .forEach((item, index) => formData.append(`${key}[${index}]`, item));
      } else {
        formData.append(key, tempUser[key]);
      }
    }

    const data = await editUser(user._id, formData);
    try {
      if (!data.success) {
        setIsLoading(false);
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
      setUser(tempUser);
      setItem("user-data", data.user);
      setIsEdit(false);
    } catch (error) {
      setIsLoading(false);
      console.log(error.message);
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
      address: [...(prev.address || []), ""],
    }));
  };

  const handleDeleteAddress = (indexToDelete) => {
    setTempUser((prev) => ({
      ...prev,
      address: prev.address.filter((_, index) => index !== indexToDelete),
    }));
  };

  const handleSetDefaultAddress = (indexToSetDefault) => {
    setTempUser((prev) => {
      const currentAddress = [...prev.address];
      const [defaultAddress] = currentAddress.splice(indexToSetDefault, 1);
      currentAddress.unshift(defaultAddress);
      return { ...prev, address: currentAddress };
    });
  };

  const displayUser = isEdit ? tempUser : user;

  return (
    <div className="p-16 w-full flex flex-col h-full items-center justify-center ">
      <div className="bg-gray-50 rounded-xl w-1/2 flex flex-col items-center justify-center gap-4 shadow-xl">
        {/* Tiêu đề */}
        <h1 className=" w-full text-3xl font-bold bg-black text-white p-4 rounded-t-xl">
          User Infomations
        </h1>

        {/* Phần Avatar và Role */}
        <div className="bg-gray-50 rounded-xl w-full flex flex-col items-center justify-center gap-2">
          {/* Avatar */}
          <h1
            className={`relative flex justify-center items-center w-44 h-44 bg-white border-4 rounded-full overflow-hidden ${
              isEdit ? "cursor-pointer hover:border-gray-500" : ""
            }`}
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
              <div className="absolute inset-0 bg-black/40 bg-opacity-30 flex flex-col items-center justify-center text-white text-lg font-bold opacity-0 hover:opacity-100 transition-opacity ">
                <ImagePlus className="w-1/3 h-1/3" />
                Choose Photo
              </div>
            )}
          </h1>

          <div className="bg-black text-white font-bold px-2 py-1 rounded-lg">
            {displayUser?.role}
          </div>
          <div className="font-bold px-2 py-1 rounded-lg flex gap-2">
            <div className="flex gap-1">
              <Mail className="w-5" />
              {displayUser.email}
            </div>
            <div className="flex gap-1">
              <Star className="w-5" />
              {displayUser.loyaltyPoints || 0}
            </div>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="w-full grid grid-cols-2 gap-4 p-4 ">
          {/* Các input trường thông tin cơ bản */}
          <div>
            <div className="font-semibold mb-2">Name</div>
            <InputForm
              name="name"
              value={displayUser?.name || ""}
              type="text"
              onChange={handleChange}
              disabled={!isEdit}
              Icon={User}
            />
          </div>
          <div>
            <div className="font-semibold mb-2">Number phone</div>
            <InputForm
              name="phone"
              value={displayUser?.phone || 0}
              type="number"
              onChange={handleChange}
              disabled={!isEdit}
              Icon={Phone}
            />
          </div>

          {/* Trường Address */}
          <div className="col-span-2 flex flex-col gap-2">
            <h3 className="text-xl font-semibold border-b pb-1">
              Delivery Addresses
            </h3>

            {/* Danh sách địa chỉ */}
            {displayUser?.address &&
              displayUser.address.map((a, index) => (
                <div key={index} className="flex flex-col gap-1">
                  <p className="flex items-center gap-2">
                    Address {index + 1}
                    {index === 0 && (
                      <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </p>
                  <div className="flex w-full items-center rounded-lg border bg-white border-zinc-200 ">
                    <input
                      type="text"
                      value={a || ""}
                      name={`address[${index}]`}
                      className="px-4 py-3 w-full rounded-l-lg outline-none bg-white text-zinc-800 placeholder:text-zinc-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                      onChange={handleChange}
                      disabled={!isEdit}
                      placeholder="Enter a detailed address"
                    />

                    {/* Các nút hành động */}
                    {isEdit && (
                      <div className="flex gap-1 p-2 border-l border-zinc-200">
                        {/* Đặt mặc định */}
                        {index !== 0 && (
                          <button
                            onClick={() => handleSetDefaultAddress(index)}
                            className="p-2 text-gray-600 hover:text-blue-500 rounded-full hover:bg-gray-100 transition"
                            title="Set as Default"
                          >
                            <Home className="w-5 h-5" />
                          </button>
                        )}
                        {/* Xóa */}
                        <button
                          onClick={() => handleDeleteAddress(index)}
                          className="p-2 text-red-500 hover:text-white rounded-full hover:bg-red-500 transition"
                          title="Delete Address"
                        >
                          <Trash2 className="w-5 h-5" />
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
                className="bg-gray-200 text-black font-semibold px-4 py-2 rounded-lg border-dashed border-2 border-gray-400 hover:bg-gray-300 transition mt-2"
              >
                + Add New Address
              </button>
            )}
          </div>
        </div>

        {/* Nút Edit/Save/Cancel */}
        <div className="w-full p-4 flex justify-end gap-4 rounded-b-xl border-t border-gray-200">
          {!isEdit ? (
            <button
              onClick={handleEdit}
              className="bg-black text-white font-bold px-6 py-2 rounded-lg hover:bg-gray-800 transition duration-150 cursor-pointer"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="bg-white text-black font-bold px-6 py-2 rounded-lg border border-black hover:bg-gray-200 transition duration-150 cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isLoading}
                className={`bg-black text-white font-bold px-6 py-2 rounded-lg 
                hover:bg-gray-800 transition duration-150 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-500`}
                onClick={handleSave}
              >
                {isLoading ? (
                  <div className="flex justify-center items-center">
                    <Loader2 />
                  </div>
                ) : (
                  "Save"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
