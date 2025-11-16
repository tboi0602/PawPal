import { getItem, setItem } from "../../../utils/operations";
import { useEffect, useState, useCallback } from "react";
import { Footer } from "./main/Footer";
import { Header } from "./main/Header";
import { ActivateModel } from "../../models/ActivateModel";
import { getNotificationsForUser } from "../../../services/notifications/notificationAPI";
import { getCart } from "../../../services/shopping/cartAPI";
export const Layout = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [numberItems, setNumberItems] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    document.title = "PawPal | Home";
  }, []);

  const loadHeader = useCallback(async (userId) => {
    if (!userId) return;

    const data = await getNotificationsForUser(userId);
    const data2 = await getCart();
    if (data.success || data2.success) {
      setNumberItems(data2.pagination.totalItems || []);
      setNotifications(data.notifications || []);
    }
  }, []);

  useEffect(() => {
    const userData = getItem("user-data");
    if (userData) {
      setUser(userData);

      if (userData._id) {
        loadHeader(userData._id);
      }
    } else {
      setNotifications([]);
    }
  }, [loadHeader]);

  useEffect(() => {
    setItem("notifications", notifications);
  }, [notifications]);

  return (
    <>
      <Header
        name={user?.name}
        numberUnread={notifications?.filter((item) => !item.read).length}
        numberItems={numberItems}
        reloadHeader={() => loadHeader(user?._id)}
      />
      {!user?.isActivate && user && <ActivateModel email={user.email} />}
      <main className="grow p-4">{children}</main>
      <Footer />
    </>
  );
};
