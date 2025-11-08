import { useEffect, useState } from "react";
import { getUser, editUser } from "../../../services/users/userAPI";
import { X, Phone, Star, Shield, Mail, User } from "lucide-react";
import InputForm from "../../inputs/InputForm";
import { Loader2 } from "../Loaders/Loader2";
import Swal from "sweetalert2";

export const EditUserModel = ({ userId, setOpenEdit, reloadUser }) => {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      const res = await getUser(userId);
      if (!res.success) {
        setMessage(res.message);
        setUser(null);
      } else {
        setUser({
          ...res.user,
          phone: res.user.phone || "",
          loyaltyPoints: res.user.loyaltyPoints ?? 0,
        });
        setMessage("");
      }
    };
    loadUser();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    const newValue =
      type === "number" ? (value === "" ? "" : Number(value)) : value;
    setUser((prev) => ({ ...prev, [name]: newValue }));
  };

  const handleSave = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("name", user.name || "");
    formData.append("email", user.email || "");
    formData.append("phone", user.phone || "");
    formData.append("loyaltyPoints", user.loyaltyPoints ?? 0);
    try {
      const dataRes = await editUser(userId, formData);

      if (!dataRes.success) {
        setMessage(dataRes.message);
        setIsLoading(false);
        Swal.fire({
          toast: true,
          position: "top-right",
          icon: "error",
          title: "Update failed!",
          text: dataRes.message,
          showConfirmButton: false,
          timer: 3000,
        });
        return;
      }

      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: dataRes.message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
      reloadUser();
      setOpenEdit(false);
    } catch (error) {
      setMessage(`Save error: ${error.message}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative z-50 w-full max-w-2xl bg-white text-black shadow-2xl rounded-xl p-6 overflow-y-auto max-h-[90vh] transition-all duration-300">
        {/* Close button */}
        <X
          className="absolute top-4 right-4 cursor-pointer text-neutral-600 hover:text-black transition duration-200"
          onClick={() => setOpenEdit(false)}
          size={24}
        />

        {/* Header */}
        <h2 className="text-3xl font-extrabold mb-6 text-center text-black border-b border-black pb-3">
          Edit User Information
        </h2>

        {/* Error Message */}
        {message && (
          <p className="text-center text-red-600 mb-4 font-medium">{message}</p>
        )}

        {user ? (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-semibold text-black">
                  Full Name
                </label>
                <InputForm
                  type="text"
                  name="name"
                  value={user?.name || ""}
                  Icon={User}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  Email
                </label>
                <InputForm
                  type="email"
                  name="email"
                  value={user?.email || ""}
                  Icon={Mail}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">Role</label>
                <InputForm
                  type="text"
                  name="role"
                  value={user?.role || ""}
                  Icon={Shield}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  Phone Number
                </label>
                <InputForm
                  type="number"
                  name="phone"
                  value={user?.phone}
                  Icon={Phone}
                  onChange={handleChange}
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-sm font-semibold text-black">
                  Loyalty Points
                </label>
                <InputForm
                  type="number"
                  name="loyaltyPoints"
                  value={user?.loyaltyPoints}
                  Icon={Star}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full p-3 mt-6 rounded-lg text-xl font-bold transition duration-200 bg-black text-white 
            hover:bg-neutral-800 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-500`}
            >
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <Loader2 />
                </div>
              ) : (
                "Update Staff"
              )}
            </button>
          </form>
        ) : (
          <div className="text-center p-10 text-red-600 font-semibold">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
