import { USER_TARGET } from "../../../configs/config.js";

//* Activate Account
export const handleActivate = async (req, res) => {
  const { email, token } = req.query;
  try {
    const response = await fetch(
      `${USER_TARGET}/users/activate?email=${email}&token=${token}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Activate error: ${error.message}`,
    });
  }
};

export const ActivationRequired = async (req, res) => {
  const { email } = req.query;
  try {
    const response = await fetch(
      `${USER_TARGET}/users/required-activate?email=${email}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Required Activation Error: ${error.message}`,
    });
  }
};

export const ChangePasswordRequired = async (req, res) => {
  const { email } = req.query;
  try {
    const response = await fetch(
      `${USER_TARGET}/users/required-change-password?email=${email}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Send Verification Error: ${error.message}`,
    });
  }
};

export const handleChangePassword = async (req, res) => {
  const { email, token } = req.query;
  const { password } = req.body;
  try {
    const response = await fetch(
      `${USER_TARGET}/users/forgot-password?email=${email}&token=${token}`,
      {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ password }),
      }
    );
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: `Change password error: ${error.message}`,
    });
  }
};
