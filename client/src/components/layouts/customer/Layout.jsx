import { getItem, setItem } from "../../../utils/operations";
import { useEffect, useState } from "react";
import { Footer } from "./main/Footer";
import { Header } from "./main/Header";
import {ActivateModel} from "../../models/ActivateModel"

export const Layout = ({ children }) => {
  //fake API
  // eslint-disable-next-line no-unused-vars
  const [notifications, setNotifications] = useState([
    {
      _id: "1",
      title: "Order Confirmed",
      message:
        "Your order #1234 has been confirmed successfully and will be shipped soon.",
      isRead: false,
      type: "order",
      createdAt: "2025-10-30T09:00:00",
    },
    {
      _id: "2",
      title: "System Update",
      message:
        "System maintenance tonight from 10 PM to 12 AM. Please save your work.",
      isRead: true,
      type: "system",
      createdAt: "2025-10-28T20:00:00",
    },
    {
      _id: "3",
      title: "Promotion Alert",
      message: "New 30% discount on pet grooming services this weekend only!",
      isRead: true,
      type: "promo",
      createdAt: "2025-10-27T14:00:00",
    },
  ]);
  const [user, setUser] = useState("");
  useEffect(() => {
    document.title = "PawPal | Home";
  }, []);
  useEffect(() => {
    setItem("notifications", notifications);
    setUser(getItem("user-data"));
  }, [notifications]);
  return (
    <>
      <Header
        name={user?.name}
        numberNotification={notifications.filter((item) => !item.isRead).length}
      />
      {!user?.isVerify && user && <ActivateModel email={user.email} />}
      <main className="grow p-4">{children}</main>
      <Footer />
    </>
  );
};
