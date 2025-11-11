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
} from "lucide-react";
import { UserModel } from "../../../models/Users/UserModel";
import { NotifiModel } from "../../../models/NotifiModel";

export const Header = ({ name, numberUnread, reloadNotifications }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  name = name?.split(" ").slice(-2).join(" ");

  const [isScroll, setIsScroll] = useState(false);
  const [openNotifi, setOpenNotifi] = useState(false);
  const [openUser, setOpenUser] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currenScroll = window.scrollY;
      if (currenScroll > 10) setIsScroll(true);
      else setIsScroll(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const getNavLinkClass = (path) => {
    if (currentPath === path) {
      return "p-2 rounded-lg text-black bg-gray-100 shadow-md -translate-y-1 duration-150 flex gap-1 border border-gray-400";
    }
    return " p-2  rounded-lg text-black/70  hover:text-black hover:bg-gray-100 hover:shadow-md  hover:-translate-y-1 duration-150 flex gap-1";
  };

  return (
    <div
      className={` ${
        isScroll
          ? " bg-white/70 backdrop-blur-sm shadow-md scale-100"
          : "scale-105"
      } fixed z-90 py-4 flex w-full font-medium items-center justify-between px-20 transition-all duration-400`}
    >
      <a href="/home">
        <img src={logo} className="w-30 cursor-pointer" />
      </a>
      <div className="flex items-center justify-evenly w-1/2">
        <a className={getNavLinkClass("/home/products")} href="/home/product">
          <ShoppingBag className="w-5" />
          Product
        </a>
        <a className={getNavLinkClass("/home/services")} href="/home/service">
          <ShowerHead className="w-6" />
          Service
        </a>
        <a className={getNavLinkClass("/home/orders")} href="/home/order">
          <Logs className="w-5" />
          Order
        </a>
        <a className={getNavLinkClass("/home/booking")} href="/home/booking">
          <TicketCheck className="w-5" />
          Booking
        </a>
        <a className={getNavLinkClass("/home/pets")} href="/home/pets">
          <PawPrint className="w-5" />
          My Pet
        </a>
      </div>
      {name ? (
        <div className="flex gap-2 ">
          <a
            href="/home/cart"
            className="button-black-outline p-1 px-2 rounded-md flex gap-1"
          >
            <ShoppingCart className="w-5" />
          </a>
          <div
            className="relative button-black-outline p-1 px-2 rounded-md flex gap-1 "
            onClick={() => {
              setOpenNotifi(!openNotifi);
              setOpenUser(false);
            }}
          >
            {numberUnread > 0 && (
              <div className="absolute bg-red-600 w-3 h-3 rounded-full top-1 right-2 text-white text-[10px] font-medium flex justify-center items-center">
                {numberUnread}
              </div>
            )}
            <Bell className="w-5" />
            {openNotifi && (
              <NotifiModel reloadNotifications={reloadNotifications} />
            )}
          </div>
          <div
            className="relative button-black-outline p-1 px-2 rounded-md flex gap-1"
            onClick={() => {
              setOpenUser(!openUser);
              setOpenNotifi(false);
            }}
          >
            <User className="w-5" />
            {name}
            {openUser && <UserModel />}
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <a href="/login" className="button-black-outline p-1 px-2 rounded-lg">
            Login
          </a>
          <a href="/register" className="button-black p-1 px-2 rounded-lg">
            Register
          </a>
        </div>
      )}
    </div>
  );
};
