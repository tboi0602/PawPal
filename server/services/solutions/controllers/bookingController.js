import { calculateTotalAmount } from "../utils/calculatePrice.js";
import Solution from "../models/Solution.js";
import Resource from "../models/Resource.js";
import Booking from "../models/Booking.js";
import { EMAIL_TARGET, USER_TARGET } from "../../../configs/config.js";

export const createBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const solution = await Solution.findById(id);
    if (!solution)
      return res
        .status(404)
        .json({ success: false, message: "Solution not found" });

    const rawStart = data.dateStarts?.replace(" ", "T");
    const dateStart = new Date(rawStart);
    if (isNaN(dateStart))
      return res.status(400).json({
        success: false,
        message: "Invalid date format for dateStarts",
      });

    // Tính dateEnd theo duration
    const dateEnd = new Date(
      dateStart.getTime() + (solution.duration || 0) * 60000
    );

    // Chuyển sang giờ Việt Nam (+7h)
    const dateStartVN = new Date(dateStart.getTime() + 7 * 60 * 60 * 1000);
    const dateEndVN = new Date(dateEnd.getTime() + 7 * 60 * 60 * 1000);

    console.log("dateStartVN:", dateStartVN.toISOString());
    console.log("dateEndVN:", dateEndVN.toISOString());

    if (dateEndVN < dateStartVN)
      return res.status(400).json({
        success: false,
        message: "End date cannot be before start date",
      });

    // ✅ Validation 1: Không cho đặt trong quá khứ
    const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
    if (dateStartVN < nowVN) {
      return res.status(400).json({
        success: false,
        message: "Cannot book in the past. Please select a future date.",
      });
    }

    // ✅ Validation 2: Check pet conflict - không cho 1 pet đặt cùng thời gian
    const petIds = data.pets?.map((p) => p.petId) || [];
    if (petIds.length > 0) {
      const conflictingBookings = await Booking.findOne({
        $or: [
          {
            "pets.petId": { $in: petIds },
            status: { $in: ["pending", "confirmed"] },
            dateStarts: { $lt: dateEndVN },
            dateEnd: { $gt: dateStartVN },
          },
        ],
      });

      if (conflictingBookings) {
        return res.status(400).json({
          success: false,
          message:
            "One or more pets already have a booking during this time period. Please choose a different time.",
        });
      }
    }

    const userRes = await fetch(`${USER_TARGET}/users/${data.userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": req.headers["x-user-id"],
        "x-user-role": req.headers["x-user-role"],
        "x-user-activate": req.headers["x-user-activate"],
      },
    });
    const userData = await userRes.json();
    const user = userData.user;

    // Validate pets có petId và resourceId
    for (const pet of data.pets) {
      if (!pet.petId || !pet.resourceId) {
        return res.status(400).json({
          success: false,
          message: "Each pet must have petId and resourceId",
        });
      }
    }

    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    };

    const { totalAmount, petsWithSubTotal } = await calculateTotalAmount(
      solution,
      {
        ...data,
        pets: data.pets,
        userPets: user.pets,
        dateStarts: dateStartVN,
        dateEnd: dateEndVN,
      }
    );

    const booking = await Booking.create({
      user: userInfo,
      solutionId: solution._id,
      solutionName: solution.name,
      dateStarts: dateStartVN,
      dateEnd: dateEndVN,
      pets: petsWithSubTotal,
      totalAmount,
      hireShipper: !!data.hireShipper,
      status: "pending",
    });

    if (booking) {
      const templateName = "bookingConfirmation";
      const to = userInfo?.email;
      const subject = `Booking Confirmation ${booking._id}`;
      const data = {
        customerName: userInfo?.name,
        bookingId: booking._id,
        serviceName: booking.solutionName,
        bookingTime: booking.createdAt.toLocaleDateString("vi-VN"),
        bookingLink: "http://localhost:5173/home/bookings",
      };

      fetch(`${EMAIL_TARGET}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ templateName, to, subject, data }),
      }).catch((err) => console.log(err.message));
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

/**
 * Create booking with status "pending" before MoMo payment
 * After payment verification, status will be updated to "confirmed"
 * If payment fails, booking will be deleted
 */
export const createBookingForPayment = async (req, res) => {
  try {
    const {
      solutionId,
      userId,
      dateStarts,
      pets,
      hireShipper,
      insurance,
      shipperAddress,
    } = req.body;

    if (!solutionId || !userId || !dateStarts || !pets || pets.length === 0) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: solutionId, userId, dateStarts, pets",
      });
    }

    if (hireShipper && !shipperAddress) {
      return res.status(400).json({
        success: false,
        message: "Shipping address is required when hiring shipper",
      });
    }

    const solution = await Solution.findById(solutionId);
    if (!solution) {
      return res
        .status(404)
        .json({ success: false, message: "Solution not found" });
    }

    const rawStart = dateStarts?.replace(" ", "T");
    const dateStart = new Date(rawStart);
    if (isNaN(dateStart)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for dateStarts",
      });
    }

    // Calculate dateEnd based on solution duration
    const dateEnd = new Date(
      dateStart.getTime() + (solution.duration || 0) * 60000
    );

    // Convert to Vietnam timezone (+7h)
    const dateStartVN = new Date(dateStart.getTime() + 7 * 60 * 60 * 1000);
    const dateEndVN = new Date(dateEnd.getTime() + 7 * 60 * 60 * 1000);

    // Validate: Cannot book in the past
    const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
    if (dateStartVN < nowVN) {
      return res.status(400).json({
        success: false,
        message: "Cannot book in the past. Please select a future date.",
      });
    }

    // Validate: Check pet conflict
    const petIds = pets?.map((p) => p.petId) || [];
    if (petIds.length > 0) {
      const conflictingBookings = await Booking.findOne({
        $or: [
          {
            "pets.petId": { $in: petIds },
            status: { $in: ["pending", "confirmed"] },
            dateStarts: { $lt: dateEndVN },
            dateEnd: { $gt: dateStartVN },
          },
        ],
      });

      if (conflictingBookings) {
        return res.status(400).json({
          success: false,
          message:
            "One or more pets already have a booking during this time period.",
        });
      }
    }

    // Validate: Check resource working hours (based on resourceId from first pet)
    const resourceId = pets[0]?.resourceId;
    if (resourceId) {
      const resource = await Resource.findById(resourceId);
      if (resource) {
        // Get day of week from booking date (0 = Sunday, 1 = Monday, etc.)
        const dayOfWeekNum = dateStartVN.getDay();
        const daysMap = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];
        const bookingDayOfWeek = daysMap[dayOfWeekNum];

        // Check if resource operates on this day
        if (!resource.dayOfWeek.includes(bookingDayOfWeek)) {
          return res.status(400).json({
            success: false,
            message: `Resource is not available on ${bookingDayOfWeek}. Available days: ${resource.dayOfWeek.join(
              ", "
            )}`,
          });
        }

        // Check if booking time falls within working hours
        const bookingStartTime = `${String(dateStartVN.getHours()).padStart(
          2,
          "0"
        )}:${String(dateStartVN.getMinutes()).padStart(2, "0")}`;
        const bookingEndTime = `${String(dateEndVN.getHours()).padStart(
          2,
          "0"
        )}:${String(dateEndVN.getMinutes()).padStart(2, "0")}`;

        if (
          bookingStartTime < resource.startTime ||
          bookingEndTime > resource.endTime
        ) {
          return res.status(400).json({
            success: false,
            message: `Booking time must be between ${resource.startTime} and ${resource.endTime}. Resource operating hours: ${resource.startTime} - ${resource.endTime}`,
          });
        }
      }
    }

    // Fetch user data
    const userRes = await fetch(`${USER_TARGET}/users/${userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": req.headers["x-user-id"] || userId,
        "x-user-role": req.headers["x-user-role"] || "customer",
        "x-user-activate": req.headers["x-user-activate"] || "true",
      },
    });
    const userData = await userRes.json();
    const user = userData.user;

    // Validate pets have required fields
    for (const pet of pets) {
      if (!pet.petId) {
        return res.status(400).json({
          success: false,
          message: "Each pet must have a petId",
        });
      }
    }

    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    };

    // Calculate total amount
    const { totalAmount, petsWithSubTotal } = await calculateTotalAmount(
      solution,
      {
        pets,
        userPets: user.pets,
        dateStarts: dateStartVN,
        dateEnd: dateEndVN,
      }
    );

    // Create booking with "pending" status
    const booking = await Booking.create({
      user: userInfo,
      solutionId: solution._id,
      solutionName: solution.name,
      dateStarts: dateStartVN,
      dateEnd: dateEndVN,
      pets: petsWithSubTotal,
      totalAmount,
      hireShipper: !!hireShipper,
      shipperAddress: hireShipper ? shipperAddress : null,
      insurance: !!insurance,
      status: "pending",
      paymentMethod: "MOMO",
    });

    if (booking) {
      const templateName = "bookingConfirmation";
      const to = userInfo?.email;
      const subject = `Booking Confirmation ${booking._id}`;
      const data = {
        customerName: userInfo?.name,
        bookingId: booking._id,
        serviceName: booking.solutionName,
        bookingTime: booking.createdAt.toLocaleDateString("vi-VN"),
        bookingLink: "http://localhost:5173/home/bookings",
      };
      fetch(`${EMAIL_TARGET}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ templateName, to, subject, data }),
      }).catch((err) => console.log(err.message));
      return res.status(201).json({
        success: true,
        message: "Booking created. Proceed to payment.",
        booking: {
          _id: booking._id,
          bookingId: booking._id,
          totalAmount: booking.totalAmount,
          solutionName: booking.solutionName,
          dateStarts: booking.dateStarts,
          dateEnd: booking.dateEnd,
          pets: booking.pets,
        },
      });
    }
  } catch (error) {
    console.error("Error in createBookingForPayment:", error);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getBookingById = async (req, res) => {
  const { id } = req.params;
  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    return res.status(200).json({ success: true, booking });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getBookings = async (req, res) => {
  try {
    // Lấy param từ query string
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const search = req.query.search || ""; // tìm theo petName / resourceName / solutionName
    const statusFilter = req.query.status; // pending / confirmed / completed / cancelled
    const userIdFilter = req.query.userId; // để lọc booking của 1 user cụ thể
    const bookingIdFilter = req.query.bookingId; // để lọc theo bookingId
    const solutionFilter = req.query.solutionId;
    const dateFrom = req.query.from ? new Date(req.query.from) : null;
    const dateTo = req.query.to ? new Date(req.query.to) : null;

    // Xây dựng điều kiện tìm kiếm (MongoDB)
    const findQuery = {};

    // Tìm kiếm theo tên pet / resource / solution (dùng $or)
    if (search) {
      findQuery.$or = [
        { "pets.petName": { $regex: search, $options: "i" } },
        { "pets.resourceName": { $regex: search, $options: "i" } },
        { solutionName: { $regex: search, $options: "i" } },
      ];
    }

    //  Lọc theo status
    if (statusFilter) {
      findQuery.status = statusFilter;
    }

    // Lọc theo userId
    if (userIdFilter) {
      findQuery["user.id"] = userIdFilter;
    }

    if (bookingIdFilter) {
      findQuery._id = bookingIdFilter;
    }

    // Lọc theo loại dịch vụ (solutionId)
    if (solutionFilter) {
      findQuery.solutionId = solutionFilter;
    }

    // Lọc theo khoảng thời gian (VD: trong ngày, tuần, tháng,…)
    if (dateFrom && dateTo) {
      findQuery.dateStarts = { $gte: dateFrom, $lte: dateTo };
    } else if (dateFrom) {
      findQuery.dateStarts = { $gte: dateFrom };
    } else if (dateTo) {
      findQuery.dateStarts = { $lte: dateTo };
    }

    // Tổng số booking phù hợp
    const totalBookings = await Booking.countDocuments(findQuery);

    if (totalBookings === 0) {
      return res.status(404).json({
        success: false,
        message: "No bookings found",
      });
    }

    // Lấy danh sách booking (phân trang + sort mới nhất)
    const bookings = await Booking.find(findQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Trả kết quả
    return res.status(200).json({
      success: true,
      pagination: {
        totalBookings,
        totalPages: Math.ceil(totalBookings / limit),
        currentPage: page,
        pageSize: limit,
      },
      bookings,
    });
  } catch (error) {
    console.error(`Error in getBookings: ${error.message}`);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const getBookingsByUserId = async (req, res) => {
  const { userId } = req.params;
  try {
    const bookings = await Booking.find({ "user.id": userId }).sort({
      createdAt: -1,
    });
    return res.status(200).json({ success: true, bookings });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const deleteBooking = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedBooking = await Booking.findByIdAndDelete(id);
    if (!deletedBooking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Booking deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

export const updateBookingStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ["pending", "confirmed", "completed", "cancelled"];

  // Định nghĩa thứ tự tiến triển (lớn hơn là cấp cao hơn/tiến triển hơn)
  const statusOrder = {
    pending: 0,
    confirmed: 1,
    completed: 2,
    cancelled: -1, // Trạng thái hủy được xử lý riêng
  };

  // 1. Kiểm tra trạng thái mới có hợp lệ không
  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value" });
  }

  try {
    // 2. Lấy booking hiện tại để kiểm tra trạng thái
    const existingBooking = await Booking.findById(id);

    if (!existingBooking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }

    const currentStatus = existingBooking.status;

    // Kiểm tra xem trạng thái có bị trùng lặp không
    if (status === currentStatus) {
      return res.status(400).json({
        success: false,
        message: `Booking is already in status '${currentStatus}'.`,
      });
    }

    // --- LOGIC CHẶN CÁC TRẠNG THÁI KHÔNG THỂ CẬP NHẬT (CANCELLED / COMPLETED) ---

    // 3. Quy tắc: Không thể thay đổi status của booking đã CANCELLED
    if (currentStatus === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Cannot update status: Booking is already cancelled.",
      });
    }

    // 4. Quy tắc: Không thể thay đổi status của booking đã COMPLETED
    if (currentStatus === "completed") {
      return res.status(400).json({
        success: false,
        message: "Cannot update status: Booking is already completed.",
      });
    }

    // --- LOGIC CHẶN CHUYỂN TRẠNG THÁI LÙI CẤP ---

    // 5. Nếu trạng thái mới KHÔNG phải là 'cancelled', kiểm tra việc lùi cấp
    if (status !== "cancelled") {
      const currentOrderIndex = statusOrder[currentStatus];
      const newOrderIndex = statusOrder[status];

      // Chỉ áp dụng logic tiến triển cho các trạng thái trong luồng chính (pending, confirmed, completed)
      if (currentOrderIndex !== undefined && newOrderIndex !== undefined) {
        if (newOrderIndex < currentOrderIndex) {
          return res.status(400).json({
            success: false,
            message: `Invalid status transition: Cannot change status backward from '${currentStatus}' to '${status}'.`,
          });
        }
      }
    }

    // 6. Cập nhật booking
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedBooking) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to save status update." });
    }

    return res.status(200).json({
      success: true,
      message: "Booking status updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};

/**
 * Create booking after successful MoMo payment
 * Called from payment service after payment verification
 */
export const createBookingAfterPayment = async (req, res) => {
  try {
    const { solutionId, bookingData } = req.body;

    if (!solutionId || !bookingData) {
      return res.status(400).json({
        success: false,
        message: "Missing solutionId or bookingData",
      });
    }

    const solution = await Solution.findById(solutionId);
    if (!solution) {
      return res
        .status(404)
        .json({ success: false, message: "Solution not found" });
    }

    const rawStart = bookingData.dateStarts?.replace(" ", "T");
    const dateStart = new Date(rawStart);
    if (isNaN(dateStart)) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format for dateStarts",
      });
    }

    // Calculate dateEnd based on duration
    const dateEnd = new Date(
      dateStart.getTime() + (solution.duration || 0) * 60000
    );

    // Convert to Vietnam timezone (+7h)
    const dateStartVN = new Date(dateStart.getTime() + 7 * 60 * 60 * 1000);
    const dateEndVN = new Date(dateEnd.getTime() + 7 * 60 * 60 * 1000);

    // Validate: Cannot book in the past
    const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
    if (dateStartVN < nowVN) {
      return res.status(400).json({
        success: false,
        message: "Cannot book in the past. Please select a future date.",
      });
    }

    // Validate: Check pet conflict
    const petIds = bookingData.pets?.map((p) => p.petId) || [];
    if (petIds.length > 0) {
      const conflictingBookings = await Booking.findOne({
        $or: [
          {
            "pets.petId": { $in: petIds },
            status: { $in: ["pending", "confirmed"] },
            dateStarts: { $lt: dateEndVN },
            dateEnd: { $gt: dateStartVN },
          },
        ],
      });

      if (conflictingBookings) {
        return res.status(400).json({
          success: false,
          message:
            "One or more pets already have a booking during this time period.",
        });
      }
    }

    // Fetch user data
    const userRes = await fetch(`${USER_TARGET}/users/${bookingData.userId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": req.headers["x-user-id"],
        "x-user-role": req.headers["x-user-role"],
        "x-user-activate": req.headers["x-user-activate"],
      },
    });
    const userData = await userRes.json();
    const user = userData.user;

    // Validate pets have petId and resourceId
    for (const pet of bookingData.pets) {
      if (!pet.petId) {
        return res.status(400).json({
          success: false,
          message: "Each pet must have a petId",
        });
      }
    }

    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    };

    // Calculate total amount
    const { totalAmount, petsWithSubTotal } = await calculateTotalAmount(
      solution,
      {
        ...bookingData,
        pets: bookingData.pets,
        userPets: user.pets,
        dateStarts: dateStartVN,
        dateEnd: dateEndVN,
      }
    );

    // Create booking with "confirmed" status since payment was successful
    const booking = await Booking.create({
      user: userInfo,
      solutionId: solution._id,
      solutionName: solution.name,
      dateStarts: dateStartVN,
      dateEnd: dateEndVN,
      pets: petsWithSubTotal,
      shipperAddress,
      totalAmount,
      status: "confirmed",
      paymentMethod: "MOMO",
    });
    if (booking) {
      const templateName = "bookingConfirmation";
      const to = userInfo?.email;
      const subject = `Booking Confirmation ${booking._id}`;
      const data = {
        customerName: userInfo?.name,
        bookingId: booking._id,
        serviceName: booking.solutionName,
        bookingTime: booking.createdAt.toLocaleDateString("vi-VN"),
        bookingLink: "http://localhost:5173/home/bookings",
      };
      fetch(`${EMAIL_TARGET}/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ templateName, to, subject, data }),
      }).catch((err) => console.log(err.message));
    }

    return res.status(201).json({
      success: true,
      message: "Booking created successfully after payment",
      booking,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};
