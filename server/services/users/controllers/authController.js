import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Verify from "../models/Verify.js";
import crypto from "crypto";
import { CLIENT_TARGET } from "../../../configs/config.js";
const validatePassword = (password) => {
  const minLength = /.{8,}/;
  const uppercase = /(?=.*[A-Z])/;
  const lowercase = /(?=.*[a-z])/;
  const number = /(?=.*\d)/;
  const specialChar = /(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?~`])/;

  return {
    minLength: minLength.test(password),
    uppercase: uppercase.test(password),
    lowercase: lowercase.test(password),
    number: number.test(password),
    specialChar: specialChar.test(password),
    isValid:
      minLength.test(password) &&
      uppercase.test(password) &&
      lowercase.test(password) &&
      number.test(password) &&
      specialChar.test(password),
  };
};
//! Register
export const handleRegister = async (req, res) => {
  const dataRegister = req.body;
  const email = dataRegister.email;
  const password = dataRegister.password;
  if (!validatePassword)
    return res
      .status(409)
      .json({ success: false, message: "Password is too weak." });
  try {
    const existingUser = await User.findOne({ email: email }).lean();
    if (existingUser)
      return res
        .status(409)
        .json({ success: false, message: "This email is already in use." });

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      ...dataRegister,
      password: hashPassword,
    });

    //* Trường hợp đăng ký với GG
    if (dataRegister?.isActivate)
      return res.status(201).json({
        success: true,
        message: "Register successful!.",
        token: token,
      });

    const token = crypto.randomBytes(32).toString("hex");
    const verify = new Verify({
      email: email,
      verificationToken: token,
      verificationExpires: Date.now() + 5 * 60 * 1000,
      type: "activateAccount",
    });
    await newUser.save();
    const verifySave = await verify.save();

    //*Gọi email service để gửi mail
    if (verifySave)
      return res.status(201).json({
        success: true,
        message:
          "Register successful, please check your email to activate your account.",
        token: token,
      });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server Auth error: ${error.message}` });
  }
};

//! Login
export const handleLogin = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email })
      .select("+password")
      .lean();
    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Wrong email or password" });
    const match = await bcrypt.compare(password, user.password);
    if (!match)
      return res
        .status(401)
        .json({ success: false, message: "Wrong email or password" });

    delete user.password;
    return res
      .status(200)
      .json({ success: true, message: "Login successful", user: user });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: `Server Auth error: ${error.message}` });
  }
};

//! Required activate ( Yêu cầu kích hoạt lại tài khoản)
export const ActivationRequired = async (req, res) => {
  const { email } = req.query;
  const token = crypto.randomBytes(32).toString("hex");

  const user = await User.findOne({ email: email });
  if (!user)
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  //* Xóa những Yêu cầu cũ
  await Verify.deleteMany({ email: email, type: "activateAccount" });
  const verify = new Verify({
    email: email,
    verificationToken: token,
    verificationExpires: Date.now() + 5 * 60 * 1000,
    type: "activateAccount",
  });
  const verifySave = await verify.save();
  //* Gọi server email để gửi mail ("http://localhost:5173/...email=email&token=token")
  try {
    if (verifySave)
      return res.status(200).json({
        success: true,
        message: "Please check your email to activate account",
        token: token,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Send Verification Error: ${error.message}`,
    });
  }
};

//! Activate Account ( Thực hiện kích hoạt tài khoản)
export const handleActivate = async (req, res) => {
  const { email, token } = req.query;
  try {
    const isVerify = await Verify.findOne({
      email: email,
      verificationToken: token,
      verificationExpires: { $gt: Date.now() },
      type: "activateAccount",
    });
    if (!isVerify)
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link.",
      });
    await User.updateOne(
      { email: email },
      {
        $set: { isActivate: true },
      }
    );
    await Verify.deleteMany({ email: email, type: "activateAccount" });
    return res.status(200).json({
      success: true,
      message: "Account successfully activated! Please proceed to login.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Verify error: ${error.message}`,
    });
  }
};

//! Required ChangePassword ( yêu cầu đổi pass)
export const ChangePasswordRequired = async (req, res) => {
  const { email } = req.query;
  const token = crypto.randomBytes(32).toString("hex");

  //* Xóa những Yêu cầu cũ
  await Verify.deleteMany({ email: email, type: "changePassword" });

  const user = await User.findOne({ email: email });
  if (!user)
    return res.status(404).json({
      success: false,
      message: "User not found",
    });

  const newVerify = new Verify({
    email: email,
    verificationToken: token,
    verificationExpires: Date.now() + 5 * 60 * 1000,
    type: "changePassword",
  });
  const newVerifySave = await newVerify.save();
  //* Gọi server email để gửi mail ("http://localhost:5173/...email=email&token=token")
  try {
    if (newVerifySave)
      return res.status(200).json({
        success: true,
        message: "Please check your email to change password",
        token: token,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Send Verification Error: ${error.message}`,
    });
  }
};

//! Forgot Password (Đổi Password)
export const handleChangePassword = async (req, res) => {
  const { email, token } = req.query;
  const { password } = req.body;
  try {
    const allowChange = await Verify.findOne({
      email: email,
      verificationToken: token,
      verificationExpires: { $gt: Date.now() },
      type: "changePassword",
    });
    if (!allowChange)
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link.",
      });
    if (password) {
      const hashPassword = await bcrypt.hash(password, 10);
      const changePass = await User.findOneAndUpdate(
        { email: email },
        { $set: { password: hashPassword } }
      );
      if (!changePass)
        return res.status(401).json({
          success: false,
          message: "User not found",
        });
      await Verify.deleteMany({ email: email, type: "changePassword" });
      return res
        .status(200)
        .json({ success: true, message: "Change Password successfully" });
    }
    return res
      .status(200)
      .json({ success: true, message: "Valid verification link" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Change password error: ${error.message}`,
    });
  }
};
