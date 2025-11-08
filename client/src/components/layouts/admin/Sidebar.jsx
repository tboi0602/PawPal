import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  User,
  Settings,
  ShoppingBag,
  Logs,
  TicketCheck,
  Percent,
  Bell,
  FileText,
  Menu,
  X,
  LogOutIcon,
} from "lucide-react";
import { logo } from "../../../assets/images";
import { logout } from "../../../services/auth/indentityAPI";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, link: "/admin/dashboard" },
  { name: "Staff", icon: User, link: "/admin/staff" },
  { name: "Customer", icon: Users, link: "/admin/customer" },
  { name: "Service", icon: Settings, link: "/admin/service" },
  { name: "Product", icon: ShoppingBag, link: "/admin/product" },
  { name: "Order", icon: Logs, link: "/admin/order" },
  { name: "Booking", icon: TicketCheck, link: "/admin/booking" },
  { name: "Promotion", icon: Percent, link: "/admin/promotion" },
  { name: "Notification", icon: Bell, link: "/admin/notification" },
  { name: "Contract", icon: FileText, link: "/admin/contract" },
];

export const Sidebar = ({ setIsClick }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
    setIsClick(!isOpen);
  };

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
    <>
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 text-white bg-gray-800 rounded-md hover:bg-black transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      <div
        className={`
          fixed h-full bg-white text-gray-800 
          transition-all duration-300 z-40 p-4 shadow-lg border-r border-gray-200
          ${isOpen ? "w-52" : "w-20"} 
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="flex items-center justify-center pb-6 mb-6 border-b border-gray-200">
          {isOpen ? (
            <img src={logo} alt="logo" className="w-2/3" />
          ) : (
            <button
              onClick={toggleSidebar}
              className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer p-0 text-black hover:bg-gray-200"
            >
              <Menu size={20} />
            </button>
          )}

          {isOpen && (
            <button
              onClick={toggleSidebar}
              className={`hidden md:block p-2 rounded-full transition cursor-pointer hover:bg-gray-200 text-gray-500 ml-auto`}
            >
              <X size={20} />
            </button>
          )}
        </div>

        <nav className="space-y-2 flex flex-col h-[calc(100vh-100px)]">
          <div className="grow space-y-2">
            {navItems.map((item) => (
              <a
                key={item.name}
                href={item.link}
                className={`flex items-center p-3 rounded-lg transition duration-200 group relative
                  hover:bg-gray-100 hover:text-black 
                  ${isOpen ? "justify-start" : "justify-center"}
                  text-gray-700
                `}
              >
                <item.icon size={20} className={`${isOpen ? "mr-4" : ""}`} />
                <span
                  className={`whitespace-nowrap ${
                    isOpen ? "opacity-100" : "opacity-0 hidden"
                  }`}
                >
                  {item.name}
                </span>

                {!isOpen && (
                  <span
                    className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-sm 
                      rounded-md shadow-md opacity-0 invisible 
                      group-hover:opacity-100 group-hover:visible transition-opacity duration-300 whitespace-nowrap z-50
                    "
                  >
                    {item.name}
                  </span>
                )}
              </a>
            ))}
          </div>

          <a
            onClick={handleLogout}
            className={`flex items-center p-3 rounded-b-lg transition duration-200 group relative
              hover:bg-red-50 hover:text-red-700 font-bold border-t py-4
              text-red-500 cursor-pointer
            `}
          >
            <LogOutIcon size={20} className={`${isOpen ? "mr-4" : ""}`} />
            <span
              className={`whitespace-nowrap ${
                isOpen ? "opacity-100" : "opacity-0 hidden"
              }`}
            >
              Logout
            </span>
            {!isOpen && (
              <span
                className="absolute left-full ml-4 px-3 py-1 bg-gray-800 text-white text-sm 
                  rounded-md shadow-md opacity-0 invisible 
                  group-hover:opacity-100 group-hover:visible transition-opacity duration-300 whitespace-nowrap z-50
                "
              >
                Logout
              </span>
            )}
          </a>
        </nav>
      </div>

      {isOpen && (
        <div
          onClick={toggleSidebar}
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
        />
      )}
    </>
  );
};
