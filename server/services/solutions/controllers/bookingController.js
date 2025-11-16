import { calculateTotalAmount } from "../utils/calculatePrice.js";
import { validatePetBooking } from "../utils/bookingUtils.js";
import { enrichPetData } from "../utils/petUtils.js";
import Solution from "../models/Solution.js";
import Booking from "../models/Booking.js";
import { USER_TARGET } from "../../../configs/config.js";

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
      return res
        .status(400)
        .json({
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
      return res
        .status(400)
        .json({
          success: false,
          message: "End date cannot be before start date",
        });

    const userRes = await fetch(`${USER_TARGET}/users/${data.userId}`);
    const userData = await userRes.json();
    const user = userData.user;

    const petsWithResource = [];
    for (const pet of data.pets) {
      if (!pet.petId || !pet.resourceId)
        return res
          .status(400)
          .json({
            success: false,
            message: "Each pet must have petId and resourceId",
          });

      const resource = await validatePetBooking(
        pet,
        solution,
        dateStartVN,
        dateEndVN
      );
      const petData = await enrichPetData(data.userId, pet, resource);
      petsWithResource.push(petData);
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
      { ...data, pets: petsWithResource }
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

    return res
      .status(201)
      .json({
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

    // Lọc theo userId (booking.user.id)
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

    // If no bookings found, return empty list with pagination (better for clients)
    // continue and return empty results instead of 404

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

  if (!validStatuses.includes(status)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid status value" });
  }
  try {
    const updatedBooking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatedBooking) {
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });
    }
    return res
      .status(200)
      .json({
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

export const updateBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Lấy booking hiện tại
    const booking = await Booking.findById(id);
    if (!booking)
      return res
        .status(404)
        .json({ success: false, message: "Booking not found" });

    // Lấy solution liên quan
    const solution = await Solution.findById(booking.solutionId);
    if (!solution)
      return res
        .status(404)
        .json({ success: false, message: "Solution not found" });

    // Xác định userId (ưu tiên booking, fallback body)
    const userId = booking.user?.id || data.userId;
    if (!userId)
      return res
        .status(400)
        .json({ success: false, message: "Missing userId" });

    // Lấy thông tin user
    const userRes = await fetch(`${USER_TARGET}/users/${userId}`);
    const userData = await userRes.json();
    const user = userData.user;
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Chuẩn hóa dateStarts (cho phép dạng "YYYY-MM-DD HH:mm")
    let rawStart = data.dateStarts || booking.dateStarts;
    if (typeof rawStart === "string") {
      rawStart = rawStart.trim();
      if (!rawStart.includes("T")) rawStart = rawStart.replace(" ", "T");
      if (rawStart.length === 16) rawStart += ":00";
    }

    const dateStart = new Date(rawStart);
    if (isNaN(dateStart))
      return res
        .status(400)
        .json({
          success: false,
          message: "Invalid date format for dateStarts",
        });

    const dateEnd = new Date(
      dateStart.getTime() + (solution.duration || 0) * 60000
    );

    // Chuyển sang giờ Việt Nam (+7)
    const dateStartVN = new Date(dateStart.getTime() + 7 * 60 * 60 * 1000);
    const dateEndVN = new Date(dateEnd.getTime() + 7 * 60 * 60 * 1000);

    // Check end trước start
    if (dateEndVN < dateStartVN)
      return res
        .status(400)
        .json({
          success: false,
          message: "End date cannot be before start date",
        });

    // Không cho update về quá khứ
    const nowVN = new Date(Date.now() + 7 * 60 * 60 * 1000);
    if (dateStartVN < nowVN)
      return res
        .status(400)
        .json({
          success: false,
          message: "Cannot update booking to a past date",
        });

    // Lấy pets (nếu không gửi thì dùng booking.pets)
    const pets = data.pets && data.pets.length > 0 ? data.pets : booking.pets;
    if (!pets || pets.length === 0)
      return res
        .status(400)
        .json({
          success: false,
          message: "Booking must have at least one pet",
        });

    const petsWithResource = [];

    // Validate từng pet
    for (const pet of pets) {
      try {
        if (!pet.petId || !pet.resourceId)
          return res
            .status(400)
            .json({
              success: false,
              message: "Each pet must have petId and resourceId",
            });

        const resource = await validatePetBooking(
          pet,
          solution,
          dateStartVN,
          dateEndVN
        );
        const petData = await enrichPetData(userId, pet, resource);
        petsWithResource.push(petData);
      } catch (err) {
        console.error(`❌ enrichPetData error for ${pet.petId}:`, err.message);
        // Nếu muốn fail toàn bộ booking:
        return res.status(400).json({ success: false, message: err.message });
        // Nếu muốn skip pet lỗi thì comment dòng trên, và continue;
      }
    }

    // Tính tổng tiền
    const { totalAmount, petsWithSubTotal } = await calculateTotalAmount(
      solution,
      {
        ...booking,
        userId, // ✅ Thêm dòng này để truyền đúng user
        pets: petsWithResource,
      }
    );

    // Cập nhật booking
    booking.dateStarts = dateStartVN;
    booking.dateEnd = dateEndVN;
    booking.pets = petsWithSubTotal.map((p) => ({
      petId: p.petId,
      petName: p.petName,
      resourceId: p.resourceId,
      resourceName: p.resourceName,
      subTotal: p.subTotal,
    }));
    booking.totalAmount = totalAmount;
    if (data.hireShipper !== undefined)
      booking.hireShipper = !!data.hireShipper;
    if (data.status) booking.status = data.status;

    const updatedBooking = await booking.save();

    return res.status(200).json({
      success: true,
      message: "Booking updated successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    console.error("❌ Update booking error:", error);
    return res
      .status(500)
      .json({ success: false, message: `Server error: ${error.message}` });
  }
};
