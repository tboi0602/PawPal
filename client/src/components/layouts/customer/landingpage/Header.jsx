import { useEffect, useState } from "react";
import { logo } from "../../../../assets/images";

export const Header = () => {
  const [isScroll, setIsScroll] = useState(false);

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
  return (
    <div
      className={` ${
        isScroll
          ? " bg-white/50 backdrop-blur-sm shadow-md scale-100"
          : "scale-105"
      }  fixed z-50 flex w-full font-medium items-center justify-between px-20 py-2 transition-all duration-400`}
    >
      <a href="#hero">
        <img src={logo} className="w-30 cursor-pointer" />
      </a>
      <div className="flex gap-4">
        <a
          className="text-black/70 hover:text-black hover:underline duration-150"
          href="#service"
        >
          Services
        </a>
        <a
          className="text-black/70 hover:text-black hover:underline duration-150"
          href="#product"
        >
          Products
        </a>
        <a
          className="text-black/70 hover:text-black hover:underline duration-150"
          href="#contact"
        >
          Contact
        </a>
      </div>
      <div className="flex gap-2">
        <a href="/home" className="button-black p-1 px-2 rounded-lg">
          Discover
        </a>
        <div className="bg-black border"></div>
        <a href="/login" className="button-black-outline p-1 px-2 rounded-lg">
          Login
        </a>
        <a href="/register" className="button-black p-1 px-2 rounded-lg">
          Register
        </a>
      </div>
    </div>
  );
};
