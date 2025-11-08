import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { requiredActivate } from "../../services/auth/verifyAPI";

export const ActivateModel = ({ email }) => {
  const [cooldown, setCooldown] = useState(0);
  const COOLDOWN_TIME = 120; 
  const LOCAL_STORAGE_KEY = "lastResendTimeActivateModel"; 

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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleResend = async () => {
    if (cooldown > 0) return; 

    try {
      const data = await requiredActivate(email);
      let icon = data?.success ? "success" : "error"; 
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: icon,
        title: data?.message || "Error processing request.",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        customClass: { popup: "swal-margin" },
      });

      if (data?.success) {
        localStorage.setItem(LOCAL_STORAGE_KEY, Date.now().toString());
        setCooldown(COOLDOWN_TIME);
      }
    } catch (error) {
      console.error("Resend API error:", error.message); 
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "error",
        title: "Failed to connect to server.",
        showConfirmButton: false,
        timer: 5000,
        timerProgressBar: true,
        customClass: { popup: "swal-margin" },
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-lg p-6 w-[400px] relative text-center animate-fadeIn">
        <h2 className="text-2xl font-bold mb-2 text-gray-800">
          Activate Your Account
        </h2>

        <p className="text-gray-600 mb-6">
          Your account has not been activated yet. Please check your email to
          confirm, or resend the activation link below.{" "}
        </p>

        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className={`p-2 w-full rounded-lg font-medium transition ${
            cooldown > 0
              ? "bg-gray-300 text-gray-600 cursor-not-allowed"
              : "bg-black text-white hover:bg-gray-800 cursor-pointer"
          }`}
        >
          {cooldown > 0
            ? `Please wait ${formatTime(cooldown)}`
            : "Resend Activation Link"}
        </button>
      </div>
    </div>
  );
};
