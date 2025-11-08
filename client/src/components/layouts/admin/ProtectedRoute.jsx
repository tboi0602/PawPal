// components/ProtectedRoute.jsx
import React, { useState, useEffect } from "react"; // 💡 Cần import React, useState, useEffect
import { Navigate, Outlet } from "react-router-dom";
import { getItem } from "../../../utils/operations";
import { checkTokenValidity } from "../../../utils/checkToken";
import Swal from "sweetalert2";

export const ProtectedRoute = ({ children }) => {
  const userData = getItem("user-data");
  const userRole = userData?.role;
  const isTokenValid = checkTokenValidity();
  const [shouldNavigateToLogin, setShouldNavigateToLogin] = useState(false);
  const [isAlertProcessed, setIsAlertProcessed] = useState(false);
  useEffect(() => {
    if (!isTokenValid && !isAlertProcessed) {
      setIsAlertProcessed(true);
      localStorage.removeItem("user-data");
      Swal.fire({
        icon: "warning",
        title: "Session expired",
        text: "Please log in again to continue.",
        confirmButtonText: "OK",
        confirmButtonColor: "orange",
        allowOutsideClick: false,
      }).then((result) => {
        if (result.isConfirmed) {
          setShouldNavigateToLogin(true);
        }
      });
    }
  }, [isTokenValid, isAlertProcessed]);
  if (shouldNavigateToLogin) {
    return <Navigate to="/login" replace />;
  }
  if (!isTokenValid) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        Checking session status...
      </div>
    );
  }
  if (userRole === "ADMIN" && isTokenValid) {
    return children ? children : <Outlet />;
  } else {
    return <Navigate to="/*" replace />;
  }
};
