import { Info, CheckCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getItem } from "../../utils/operations";

export const NotifiModel = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    setNotifications(getItem("notifications"));
  }, []);
  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  return (
    <div className="absolute w-72 max-h-64 overflow-y-auto top-10 right-0 bg-white border border-gray-200 rounded-xl shadow-lg p-2 z-50">
      {notifications.length === 0 ? (
        <p className="text-gray-500 text-center text-sm py-2">
          No notifications
        </p>
      ) : (
        <ul className="space-y-1">
          {notifications.map((n) => (
            <li
              key={n._id}
              className={`p-2 rounded-lg border flex items-start justify-between transition hover:scale-[1.01] ${
                n.isRead
                  ? "bg-gray-50 border-gray-200"
                  : "bg-blue-50 border-blue-200"
              }`}
              onClick={() => markAsRead(n._id)}
            >
              <div className="w-11/12">
                <h3 className="font-medium text-sm truncate">{n.title}</h3>
                <p className="text-xs text-gray-600 line-clamp-2">
                  {n.message}
                </p>
                <span className="text-[10px] text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>
              {n.isRead ? (
                <CheckCircle
                  className="text-green-500 mt-1 shrink-0"
                  size={16}
                />
              ) : (
                <Info className="text-blue-500 mt-1 shrink-0" size={16} />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
