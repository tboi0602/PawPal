import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import { Lock, XCircle, CheckCircle } from "lucide-react";
import InputForm from "../components/inputs/InputForm";
import { Loader2 } from "../components/models/Loaders/Loader2";
import {
  changePassword,
  requiredChangePassword,
} from "../services/auth/verifyAPI";
import { useRef } from "react";
import { validatePassword } from "../utils/validatePassword";

export const ForgotPasswordPage = () => {
  // eslint-disable-next-line no-unused-vars
  const [searchParams, setSearchParams] = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(null);

  const [newPassword, setNewPassword] = useState("");

  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const COOLDOWN_TIME = 120;
  const LOCAL_STORAGE_KEY = "lastPasswordResendTime";
  const hasRunRef = useRef(false);

  useEffect(() => {
    const lastSent = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (lastSent) {
      const elapsed = Math.floor((Date.now() - parseInt(lastSent)) / 1000);
      const remaining = COOLDOWN_TIME - elapsed;
      if (remaining > 0) setCooldown(remaining);
    }
  }, []);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  const handleResendRecovery = async () => {
    if (!email || cooldown > 0) return;
    setIsLoading(true);

    try {
      const dataRes = await requiredChangePassword(email);
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: dataRes.success ? "success" : "error",
        title: dataRes.message,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "swal-margin",
        },
      });
      if (dataRes.success) {
        setCooldown(COOLDOWN_TIME);
        localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
      }
    } catch (error) {
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "error",
        title: "An error occurred during resend.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "swal-margin",
        },
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !email || !token) {
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "error",
        title: "Missing fields.",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: "swal-margin",
        },
      });
      return;
    }

    const isValid = validatePassword(newPassword);
    if (!isValid) {
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "error",
        title:
          "Password must be at least 8 characters, include an uppercase letter, a number, and a special character.",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        customClass: {
          popup: "swal-margin",
        },
      });
      return;
    }

    setIsLoading(true);
    try {
      const dataRes = await changePassword(email, token, newPassword);
      if (dataRes.success) {
        setSuccess(true);
        setMessage(dataRes.message);
        setNewPassword("");
      } else {
        setSuccess(false);
        setMessage(dataRes.message);
      }
    } catch (error) {
      setSuccess(false);
      setMessage("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasRunRef.current) return;
    if (email && token) {
      hasRunRef.current = true;
      // Nếu có email và token, coi như thành công bước 1 và cho người dùng nhập mật khẩu mới
      setSuccess(null); // Trạng thái form nhập
    } else {
      // Nếu không có email hoặc token, coi như thất bại và cho phép resend
      setSuccess(false);
      setMessage(
        "Invalid recovery link. Please resend the link or check your email."
      );
      hasRunRef.current = true;
    }
  }, [email, token]);

  return (
    // Responsive: Căn giữa màn hình và đảm bảo chiều cao tối thiểu là 100vh
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {success === null ? (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full border-black"
        >
          <h1 className="text-3xl font-bold text-black mb-6 text-center">
            New Password
          </h1>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-semibold text-black">
                New Password
              </label>
              <InputForm
                type="password"
                name="newPassword"
                value={newPassword}
                Icon={Lock}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            {message && (
              <p className="text-sm font-medium text-red-500 text-center">
                {message}
              </p>
            )}
            <button
              type="submit"
              disabled={isLoading || !newPassword}
              className={`w-full p-3 mt-4 rounded-xl text-xl font-bold transition duration-200 bg-black text-white 
            hover:bg-neutral-800 cursor-pointer disabled:cursor-not-allowed disabled:bg-gray-500`}
            >
              {isLoading ? (
                <div className="flex justify-center items-center">
                  <Loader2 />
                </div>
              ) : (
                "Change Password"
              )}
            </button>
          </div>
        </form>
      ) : success === false ? (
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-md w-full text-center border-black">
          <h1 className="text-3xl font-bold text-red-600 mb-6">
            Password Recovery Failed
          </h1>
          <div className="flex flex-col items-center">
            <XCircle className="w-16 h-16 text-red-500 mb-4" />
            <p className="text-lg font-semibold text-red-700 mb-6">{message}</p>
            <button
              className={`w-full p-3 rounded-xl font-bold transition duration-300 ${
                cooldown > 0
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800 cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed"
              }`}
              onClick={handleResendRecovery}
              disabled={isLoading}
            >
              {cooldown > 0 ? (
                `Please wait ${formatTime(cooldown)}`
              ) : isLoading ? (
                <div className="flex w-full items-center justify-center">
                  <Loader2 />{" "}
                </div>
              ) : (
                "Resend Recovery link"
              )}
            </button>
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
            <a
              href="/login"
              className="w-full p-3 rounded-xl font-bold transition duration-300 bg-black text-white hover:bg-gray-800 cursor-pointer"
            >
              Go to Login
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
