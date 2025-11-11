import { getItem, setItem } from "../../../utils/operations";
import { useEffect, useState, useCallback } from "react";
import { Footer } from "./main/Footer";
import { Header } from "./main/Header";
import { ActivateModel } from "../../models/ActivateModel";
import { getNotificationsForUser } from "../../../services/notifications/notificationAPI";

export const Layout = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.title = "PawPal | Home";
  }, []);

  const loadNotifications = useCallback(async (userId) => {
    if (!userId) return;

    const data = await getNotificationsForUser(userId);
    if (data.success) {
      setNotifications(data.notifications);
    }
  }, []);

  useEffect(() => {
    const userData = getItem("user-data");
    if (userData) {
      setUser(userData);

      if (userData._id) {
        loadNotifications(userData._id);
      }
    } else {
      setNotifications([]);
    }
  }, [loadNotifications]);

  useEffect(() => {
    setItem("notifications", notifications);
  }, [notifications]);

  return (
    <>
      <Header
        name={user?.name}
        numberUnread={notifications.filter((item) => !item.read).length}
        reloadNotifications={() => loadNotifications(user?._id)}
      />
      {!user?.isActivate && user && <ActivateModel email={user.email} />}
      <main className="grow p-4">{children}</main>
      <Footer />
    </>
  );
};
