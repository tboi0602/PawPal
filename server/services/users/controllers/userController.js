import User from "../models/User.js";
import bcrypt from "bcryptjs";
import { put, del } from "@vercel/blob";

//* GET USER
export const getUser = async (req, res) => {
  const { id } = req.params;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);
  const roleFilter = req.query.role;
  const nameSearch = req.query.search;
  const skip = (page - 1) * limit;
  try {
    if (!id) {
      const findQuery = {};
      if (roleFilter) {
        findQuery.role = roleFilter;
      }
      if (nameSearch) {
        findQuery.name = { $regex: nameSearch, $options: "i" };
      }
      const totalUsers = await User.countDocuments(findQuery);
      if (totalUsers === 0) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }
      const users = await User.find(findQuery).skip(skip).limit(limit).lean();
      return res.status(200).json({
        success: true,
        pagination: {
          totalUsers: totalUsers,
          totalPages: Math.ceil(totalUsers / limit),
          currentPage: page,
          pageSize: limit,
        },
        users: users,
      });
    } else {
      const user = await User.findById(id).lean();
      if (!user)
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      return res.status(200).json({ success: true, user: user });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server User error: ${error.message}` });
  }
};

//* ADD User
export const addUser = async (req, res) => {
  const dataUser = req.body;
  const password = "staff@123";
  try {
    const email = dataUser.email;
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res
        .status(409)
        .json({ success: false, message: "This email is already in use." });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      password: hashPassword,
      role: "STAFF",
      ...dataUser,
    });
    const userSaved = await newUser.save();
    return res.status(201).json({
      success: true,
      message: `User created successfully`,
      user: userSaved,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server User error: ${error.message}` });
  }
};

//*  UPDATE INFORMATION USER

export const updateUser = async (req, res) => {
  const { id } = req.params;
  let updateData = req.body;
  const file = req.file;

  try {
    let existingUser = await User.findById(id);
    if (!existingUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const oldAvatarUrl = existingUser?.image;
    if (file) {
      if (!process.env.BLOB_READ_WRITE_TOKEN) {
        return res.status(500).json({
          success: false,
          message: "Server configuration error: Missing Vercel Blob Token.",
        });
      }
      const uploadedBlob = await put(
        `users/${Date.now()}-${file.originalname}`,
        file.buffer,
        {
          access: "public",
        }
      );

      const newAvatarUrl = uploadedBlob.url;
      if (oldAvatarUrl) {
        await del(oldAvatarUrl);
      }
      updateData.image = newAvatarUrl;
    }
    const userUpdated = await User.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!userUpdated)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    res.status(200).json({
      success: true,
      message: "User update successful.",
      user: userUpdated,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server User error: ${error.message}` });
  }
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const userDeleted = await User.findByIdAndDelete(id);
    if (!userDeleted)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (userDeleted?.image) await del(userDeleted.image);
    res.status(200).json({
      success: true,
      message: `${userDeleted.name} has been successfully deleted`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: `Server User error: ${error.message}` });
  }
};
