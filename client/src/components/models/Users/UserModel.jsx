import { LogOut, UserRoundPen } from "lucide-react";
import { logout } from "../../../services/auth/indentityAPI";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

export const UserModel = () => {
  const navigate = useNavigate();
  const handleLogout = async () => {
    localStorage.clear();
    const data = await logout();
    Swal.fire({
      toast: true,
      position: "bottom-right",
      icon: "success",
      title: data.message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      customClass: {
        popup: "swal-margin",
      },
    });
    navigate("/login");
  };
  return (
    <div className="absolute  bg-white mt-10 top-2 right-0 w-32 h-32 rounded-b-lg flex flex-col justify-evenly items-center shadow-lg">
      <a
        className="flex gap-1 justify-center items-center w-full p-2  hover:bg-gray-100"
        href="/home/me"
      >
        Profile <UserRoundPen className="w-5 " />
      </a>
      <div
        className="flex gap-1 justify-center items-center w-full p-2 hover:bg-gray-100"
        onClick={handleLogout}
      >
        Logout <LogOut className="w-5" />
      </div>
    </div>
  );
};
