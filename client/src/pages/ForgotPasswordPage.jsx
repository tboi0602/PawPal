import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Lock, XCircle, CheckCircle } from "lucide-react";
import InputForm from "../components/inputs/InputForm";
import {
  changePassword,
  requiredChangePassword,
} from "../services/auth/verifyAPI";

export const ForgotPasswordPage = () => {
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(null);

  const [newPassword, setNewPassword] = useState(""); // === LOGIC COOLDOWN BỔ SUNG ===

  const [cooldown, setCooldown] = useState(0);
  const COOLDOWN_TIME = 120;
  const LOCAL_STORAGE_KEY = "lastPasswordResendTime";

  useEffect(() => {
    const lastSent = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (lastSent) {
      const elapsed = Math.floor((Date.now() - parseInt(lastSent)) / 1000);
      const remaining = COOLDOWN_TIME - elapsed;
      if (remaining > 0) setCooldown(remaining);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]); 
  useEffect(() => {
    const loadData = async () => {
      if (!email || !token) {
        setSuccess(false);
        setMessage("The activation link is invalid. Please check again.");
        return;
      }
      try {
        const data = await changePassword(email, token);
        if (!data.success) {
          setSuccess(false);
          setMessage(data.message);
        }
      } catch (err) {
        setSuccess(false);
        setMessage(err.message);
      }
    };
    loadData();
  }, [email, token]);

  const handleChangePassword = async () => {
    if (!newPassword) return setMessage("Please enter new pasword");
    try {
      const data = await changePassword(email, token, newPassword);
      if (!data.success) {
        setSuccess(false);
        setMessage(data.message);
        return;
      }
      setSuccess(true);
      setMessage(data.message);
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: data.message,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        customClass: {
          popup: "swal-margin",
        },
      });
    } catch (err) {
      setSuccess(false);
      setMessage(err.message);
    }
  };

  const handleResendRecovery = async () => {
    if (cooldown > 0) return;
    try {
      const data = await requiredChangePassword(email); 
      if (data.success) {
        localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
        setCooldown(COOLDOWN_TIME);
      }
      setMessage(data.message);
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: data.success ? "success" : "error", 
        title: data.message,
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        customClass: { popup: "swal-margin" },
      });
    } catch (err) {
      setMessage(err.message);
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {" "}
      {success == null ? (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-black">
          <h1 className="text-3xl font-bold text-black mb-6">
            Change Password
          </h1>

          <div className="flex flex-col gap-2">
            <InputForm
              Icon={Lock}
              name="newPassword"
              type="password"
              value={newPassword}
              placeholder={"New password"}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <p className="text-red-600 w-full text-left">{message}</p>{" "}
            <div
              className="w-full bg-black text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition duration-300 cursor-pointer"
              onClick={handleChangePassword}
            >
              Confirm
            </div>
          </div>
        </div>
      ) : success == false ? (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-black">
          <h1 className="text-3xl font-bold text-red-600 mb-6">Error</h1>{" "}
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />{" "}
            <p className="text-lg font-semibold text-red-700 mb-6">{message}</p>
            <div
              className={`w-full p-3 rounded-xl font-bold transition duration-300 ${
                cooldown > 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800 cursor-pointer"
              }`}
              onClick={handleResendRecovery}
            >
              {cooldown > 0
                ? `Please wait ${formatTime(cooldown)}`
                : "Resend Recovery link"}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-black">
          <h1 className="text-3xl font-bold text-green-600 mb-6">Success</h1>{" "}
          <div className="flex flex-col items-center">
            <CheckCircle className="w-16 h-16 text-green-500 mb-4" />
            <p className="text-lg font-semibold text-green-700 mb-6">
              {message}
            </p>

            <a className="button-black w-full p-3 rounded-xl" href="/login">
              Login
            </a>
          </div>
        </div>
      )}{" "}
    </div>
  );
};
