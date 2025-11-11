import NotificationStatus from "../models/NotificationStatus.js";
import NotificationAdmin from "../models/NotificationAdmin.js";

export const getNotificationsAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const findQuery = {};
    findQuery.senderId = req.headers["x-user-id"];

    const searchKeyword = req.query.search;
    const typeFilter = req.query.type;

    if (typeFilter) findQuery.type = typeFilter;

    if (searchKeyword) {
      findQuery.$or = [
        { title: { $regex: searchKeyword, $options: "i" } },
        { content: { $regex: searchKeyword, $options: "i" } },
      ];
    }

    const totalNotifications = await NotificationAdmin.countDocuments(
      findQuery
    );

    if (totalNotifications === 0) {
      return res.status(401).json({
        success: false,
        message: "No notifications found.",
        notifications: [],
        pagination: {
          totalNotifications: 0,
          totalPages: 0,
          currentPage: page,
          pageSize: limit,
        },
      });
    }

    const notifications = await NotificationAdmin.find(findQuery)
      .skip(skip)
      .limit(limit)
      .lean();

    return res.status(200).json({
      success: true,
      pagination: {
        totalNotifications,
        totalPages: Math.ceil(totalNotifications / limit),
        currentPage: page,
        pageSize: limit,
        totalGroupedResults: totalNotifications,
      },
      notifications,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

export const getNotificationsForUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required." });
    }

    const notifications = await NotificationAdmin.find({
      $or: [
        { receiverId: userId },
        { senderId: { $ne: "SYSTEM" }, receiverId: "ALL" },
      ],
    })
      .sort({
        createdAt: -1,
      })
      .lean();

    if (notifications.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No notifications found.",
      });
    }
    const notificationsId = notifications.map((n) => n._id);

    const numberRead = await NotificationStatus.find({
      notificationId: { $in: notificationsId },
      userId: userId,
    }).select("notificationId -_id");

    const readIdsSet = new Set(
      numberRead.map((doc) => doc.notificationId.toString())
    );

    const notificationsFinal = notifications.map((n) => {
      const notificationIdString = n._id.toString();

      const isRead = readIdsSet.has(notificationIdString);

      return {
        ...n,
        read: isRead,
      };
    });

    return res.status(200).json({
      success: true,
      notifications: notificationsFinal,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { userId, id } = req.params;

    const notification = await NotificationAdmin.findOne({ _id: id });
    if (!notification) {
      return res
        .status(404)
        .json({ success: false, message: "Notification not found." });
    }
    const isRead = await NotificationStatus.findOne({
      userId: userId,
      notificationId: id,
    });
    if (isRead)
      return res.status(200).json({
        success: true,
        message: "Notification already marked as read",
        notification: notification,
      });

    const newNotificationStatus = new NotificationStatus({
      userId: userId,
      notificationId: id,
    });
    await newNotificationStatus.save();

    return res.status(200).json({ success: true, notification: notification });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Notification error: ${error.message}`,
    });
  }
};

export const createBroadcastNotification = async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const { senderId } = req.params;
    if (!senderId || !title || !content) {
      return res.status(400).json({ success: false, message: "Missing data." });
    }
    const newNotification = new NotificationAdmin({
      senderId,
      title,
      content,
      type,
    });
    await newNotification.save();
    return res.status(201).json({
      success: true,
      message: `Notification sent successfully.`,
      newNotification: newNotification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

export const createPersonalNotification = async (req, res) => {
  try {
    const { userId } = req.params;
    const { type, title, content } = req.body;
    if (!userId || !title || !content) {
      return res.status(400).json({ success: false, message: "Missing data." });
    }

    const newNotification = new NotificationAdmin({
      receiverId: userId,
      title,
      content,
      type: type,
    });

    await newNotification.save();

    return res.status(201).json({
      success: true,
      message: "Personal notification created successfully.",
      notification: newNotification,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Missing id.",
      });
    }

    await NotificationAdmin.deleteOne({ _id: id });
    NotificationStatus.deleteMany({ notificationId: id });
    return res.status(200).json({
      success: true,
      message: `Deleted notifications Successfully.`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Deletion error: ${error.message}`,
    });
  }
};
