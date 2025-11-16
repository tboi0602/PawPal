import { Info, CheckCircle, Tag, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import { getItem } from "../../utils/operations";
import { markAsRead } from "../../services/notifications/notificationAPI";

const notificationStyleMap = {
  CONFIRM: {
    color: "text-green-600",
    icon: CheckCircle,
    unReadBg: "bg-green-50 border-green-200",
  },
  SALE: {
    color: "text-blue-600",
    icon: Tag,
    unReadBg: "bg-blue-50 border-blue-200",
  },
  DEFAULT: {
    color: "text-red-600",
    icon: ShieldAlert,
    unReadBg: "bg-red-50 border-red-200",
  },
};

export const NotifiModel = ({ loadHeader }) => {
  const [notifications, setNotifications] = useState([]);
  const [notification, setNotification] = useState({});
  const [openDetails, setOpenDetails] = useState(false);
  const [message, setMessage] = useState("");

  const userId = getItem("user-data")?._id;

  useEffect(() => {
    setNotifications(
      getItem("notifications")?.sort((a, b) => a.read - b.read) || []
    );
  }, []);

  const handleRead = async (e, id, n) => {
    e.stopPropagation();
    setOpenDetails(true);

    const data = await markAsRead(userId, id);

    if (!data.success) {
      setMessage(data.message);
      return;
    }

    setNotifications((prevNotifications) =>
      prevNotifications.map((notif) =>
        notif._id === id ? { ...notif, read: true } : notif
      )
    );

    setNotification({ ...n, read: true });
    loadHeader();
  };

  const handelClose = (e) => {
    e.stopPropagation();
    setOpenDetails(false);
    setNotification([]);
    setMessage("");
  };

  return (
    <>
      <div className="absolute w-72 max-h-64 overflow-y-auto top-12 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50">
        {notifications.length === 0 ? (
          <p className="text-gray-500 text-center text-sm py-2">
            No notifications
          </p>
        ) : (
          <ul className="space-y-1">
            {notifications.map((n) => {
              const style =
                notificationStyleMap[n.type] || notificationStyleMap.DEFAULT;
              const Icon = style.icon;

              return (
                <li
                  key={n._id}
                  onClick={(e) => handleRead(e, n._id, n)}
                  className={`p-2 rounded-lg border flex items-start justify-between transition hover:scale-[1.01] cursor-pointer ${
                    n.read ? "bg-gray-50 border-gray-200" : style.unReadBg
                  }`}
                >
                  <div className="w-11/12">
                    <div className="flex items-center gap-1">
                      <Icon className={`${style.color} shrink-0`} size={14} />
                      <h3 className="font-medium text-sm truncate">
                        {n.title}
                      </h3>
                    </div>

                    <p className="text-xs text-gray-600 line-clamp-2">
                      {n.content}
                    </p>
                    <span className="text-[10px] text-gray-400">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>

                  {n.read ? (
                    <CheckCircle
                      className="text-green-500 mt-1 shrink-0"
                      size={16}
                    />
                  ) : (
                    <Info
                      className={` text-gray-600 mt-1 shrink-0`}
                      size={16}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {openDetails && (
        <div
          className="absolute w-96 max-h-96 overflow-y-auto top-10 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50 cursor-default"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-white p-6 rounded-lg">
            {(() => {
              const style =
                notificationStyleMap[notification.type] ||
                notificationStyleMap.DEFAULT;
              const Icon = style.icon;
              return (
                <div className="flex gap-2 items-center mb-2">
                  <Icon className={style.color} size={24} />
                  <h3 className={`${style.color} font-bold text-xl`}>
                    {notification.title}
                  </h3>
                </div>
              );
            })()}

            <p className="text-lg text-gray-700 mb-4">{notification.content}</p>
            <span className="text-sm text-gray-500 block mb-4">
              {new Date(notification.createdAt).toLocaleString()}
            </span>
            {message && (
              <p className="text-red-600 text-center mt-2">{message}</p>
            )}
            <button
              onClick={(e) => handelClose(e)}
              className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-black transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
