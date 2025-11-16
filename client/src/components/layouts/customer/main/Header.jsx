import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { logo } from "../../../../assets/images";
import {
  PawPrint,
  Logs,
  TicketCheck,
  User,
  Bell,
  ShoppingCart,
  ShowerHead,
  ShoppingBag,
  Menu, 
  X,
  TicketCheckIcon, 
} from "lucide-react";
import { UserModel } from "../../../models/Users/UserModel";
import { NotifiModel } from "../../../models/NotifiModel";

// Định nghĩa các liên kết điều hướng
const navLinks = [
  {  path: "/home/products",  href: "/home/products",  icon: ShoppingBag,  label: "Product",},
  {  path: "/home/services",  href: "/home/services",  icon: ShowerHead,  label: "Service",},
  { path: "/home/orders", href: "/home/orders", icon: Logs, label: "Order" },
  {  path: "/home/booking",  href: "/home/booking",  icon: TicketCheck,  label: "Booking",},
  { path: "/home/pets", href: "/home/pets", icon: PawPrint, label: "My Pet" },
  { path: "/home/promotions", href: "/home/promotions", icon: TicketCheckIcon, label: "Promotion" },
];

export const Header = ({ name, numberUnread, loadHeader, numberItems }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  // Chỉ lấy 2 từ cuối của tên
  const shortName = name?.split(" ").slice(-2).join(" ");

  const [isScroll, setIsScroll] = useState(false);
  const [openNotifi, setOpenNotifi] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State cho menu mobile

  // Logic ẩn/hiện header khi cuộn
  useEffect(() => {
    const handleScroll = () => {
      const currenScroll = window.scrollY;
      setIsScroll(currenScroll > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Đóng menu mobile khi chuyển trang
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  // Class cho các mục điều hướng
  const getNavLinkClass = (path) => {
    const baseClass =
      "p-2 rounded-lg text-black/70 hover:text-black hover:bg-gray-100 hover:shadow-md hover:-translate-y-1 duration-150 flex gap-1 items-center transition-all";
    const activeClass =
      "bg-gray-100 shadow-md -translate-y-1 border border-gray-400 !text-black";

    return currentPath.startsWith(path)
      ? `${baseClass} ${activeClass}`
      : baseClass;
  };

  return (
    <div
      className={` ${
        isScroll ? " bg-white/70 backdrop-blur-md shadow-xl scale-100" : ""
      } fixed z-50 py-3 sm:py-4 flex w-full font-medium items-center justify-between px-4 sm:px-8 lg:px-12 xl:px-20 transition-all duration-300`}
    >
      {/* Logo */}
      <a href="/home" className="shrink-0">
        <img src={logo} alt="Logo" className="w-24 sm:w-28 cursor-pointer" />
      </a>

      {/* Menu Desktop */}
      <div className="hidden lg:flex items-center justify-center gap-4 xl:gap-6 mx-auto">
        {navLinks.map((link) => (
          <a
            key={link.path}
            className={getNavLinkClass(link.path)}
            href={link.href}
          >
            <link.icon className="w-5" />
            {link.label}
          </a>
        ))}
      </div>

      {/* Controls (Cart, Notifi, User/Login) */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {shortName ? (
          <div className="flex gap-2 ">
            {/* Cart */}
            <a
              href="/home/cart"
              className="relative button-black-outline p-1.5 sm:p-2 rounded-md flex items-center justify-center transition-colors duration-200"
            >
              <ShoppingCart className="w-5 h-5" />
              {numberItems > 0 && (
                <div
                  className="absolute flex items-center justify-center bg-red-600 rounded-full 
                text-white font-semibold w-4 h-4 text-sm -top-1 -right-1"
                >
                  {numberItems}
                </div>
              )}
            </a>

            {/* Notifications */}
            <div
              className="relative button-black-outline p-1.5 sm:p-2 rounded-md flex items-center justify-center cursor-pointer transition-colors duration-200"
              onClick={() => {
                setOpenNotifi(!openNotifi);
                setOpenUser(false);
                setIsMenuOpen(false);
              }}
            >
              {numberUnread > 0 && (
                <div className="absolute bg-red-600 w-5 h-5 rounded-full -top-1 -right-1 text-white text-xs font-medium flex justify-center items-center ring-2 ring-white">
                  {numberUnread > 9 ? "9+" : numberUnread}
                </div>
              )}
              <Bell className="w-5 h-5" />
              {openNotifi && <NotifiModel loadHeader={loadHeader} />}
            </div>

            <div
              className="relative button-black-outline p-1.5 sm:p-2 px-3 sm:px-4 rounded-md flex gap-1 items-center cursor-pointer transition-colors duration-200"
              onClick={() => {
                setOpenUser(!openUser);
                setOpenNotifi(false);
                setIsMenuOpen(false);
              }}
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">{shortName}</span>
              {openUser && <UserModel />}
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <a
              href="/login"
              className="button-black-outline p-1.5 px-3 rounded-lg text-sm sm:text-base"
            >
              Login
            </a>
            <a
              href="/register"
              className="button-black p-1.5 px-3 rounded-lg text-sm sm:text-base"
            >
              Register
            </a>
          </div>
        )}

        <button
          className="lg:hidden p-2 rounded-md transition-colors hover:bg-gray-200"
          onClick={() => {
            setIsMenuOpen(!isMenuOpen);
            setOpenUser(false);
            setOpenNotifi(false);
          }}
        >
          {isMenuOpen ? (
            <X className="w-6 h-6 text-gray-700 hover:text-black cursor-pointer" />
          ) : (
            <Menu className="w-6 h-6  text-gray-500 hover:text-black cursor-pointer duration-300" />
          )}
        </button>
      </div>

      <div
        className={`lg:hidden absolute top-[calc(100%+0.5rem)] right-4 bg-white shadow-2xl rounded-xl p-4 w-64 border border-gray-200 transition-opacity duration-300 transform 
      ${
        isMenuOpen
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
      }
    `}
      >
        <div className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <a
              key={link.path}
              className={getNavLinkClass(link.path)}
              href={link.href}
            >
              <link.icon className="w-5" />
              {link.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
