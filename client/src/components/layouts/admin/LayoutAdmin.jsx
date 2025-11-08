import { useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";

export const LayoutAdmin = ({ children }) => {
  const [isClick, setIsClick] = useState(true);
  useEffect(() => {
    document.title = "PawPal | Dashboard";
  }, []);
  return (
    <>
      <Sidebar setIsClick={setIsClick} />
      <main
        className={`${
          isClick ? `pl-64` : `pl-32`
        } "grow duration-300  pr-16 "`}
      >
        {children}
      </main>
    </>
  );
};
