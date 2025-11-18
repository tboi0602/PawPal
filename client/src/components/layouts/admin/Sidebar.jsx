import { useState, useEffect } from "react";
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
  { name: "Staff", icon: User, link: "/admin/staffs" },
  { name: "Customer", icon: Users, link: "/admin/customers" },
  { name: "Service", icon: Settings, link: "/admin/services" },
  { name: "Resource", icon: TicketCheck, link: "/admin/resources" },
  { name: "Product", icon: ShoppingBag, link: "/admin/products" },
  { name: "Order", icon: Logs, link: "/admin/orders" },
  { name: "Booking", icon: TicketCheck, link: "/admin/bookings" },
  { name: "Promotion", icon: Percent, link: "/admin/promotions" },
  { name: "Notification", icon: Bell, link: "/admin/notifications" },
];

export const Sidebar = ({ setIsClick }) => {
  const [isOpen, setIsOpen] = useState(true);
  const navigate = useNavigate();

  // ✅ Kiểm tra kích thước màn hình để set mặc định
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsOpen(false);
        if (setIsClick) setIsClick(false);
      } else {
        setIsOpen(true);
        if (setIsClick) setIsClick(true);
      }
    };

    handleResize(); // chạy 1 lần khi load
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [setIsClick]);

  const toggleSidebar = () => {
    const next = !isOpen;
    setIsOpen(next);
    if (setIsClick) setIsClick(next);
  };

  const handleLogout = async () => {
    try {
      const data = await logout();
      localStorage.clear();
      Swal.fire({
        toast: true,
        position: "bottom-right",
        icon: "success",
        title: data?.message || "Logged out successfully!",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        customClass: { popup: "swal-margin" },
      });
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Logout failed!",
        text: "Please try again.",
      });
    } finally {
      navigate("/login");
    }
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button
          onClick={toggleSidebar}
          className="p-2 text-white bg-gray-800 rounded-md hover:bg-black transition"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed h-full bg-white text-gray-800 
          transition-all duration-300 z-40 p-4 shadow-lg border-r border-gray-200
          ${isOpen ? "w-52" : "w-20"}
          ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-center pb-6 mb-6 border-b border-gray-200">
          {isOpen ? (
            <img
              src={logo}
              alt="logo"
              className="w-2/3 cursor-pointer hover:scale-105 duration-150 active:scale-100"
              onClick={() => navigate("/home")}
            />
          ) : (
            <button
              onClick={toggleSidebar}
              className="h-8 w-8 rounded-full flex items-center justify-center cursor-pointer text-black hover:bg-gray-200"
            >
              <Menu size={20} />
            </button>
          )}

          {isOpen && (
            <button
              onClick={toggleSidebar}
              className="hidden md:block p-2 rounded-full transition cursor-pointer hover:bg-gray-200 text-gray-500 ml-auto"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation */}
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
                {isOpen && <span>{item.name}</span>}
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

          {/* Logout */}
          <div
            onClick={handleLogout}
            className={`flex items-center p-3 rounded-b-lg transition duration-200 group relative
              hover:bg-red-50 hover:text-red-700 font-bold border-t py-4
              text-red-500 cursor-pointer
            `}
          >
            <LogOutIcon size={20} className={`${isOpen ? "mr-4" : ""}`} />
            {isOpen && <span>Logout</span>}
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
          </div>
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
