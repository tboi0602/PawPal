const SECRET_KEY = "TaiTriTrong";
import CryptoJS from "crypto-js";

const encryptData = (data) => {
  const jsonString = JSON.stringify(data);
  const encrypted = CryptoJS.AES.encrypt(jsonString, SECRET_KEY).toString();
  return encrypted;
};

const decryptData = (encryptedText) => {
  if (!encryptedText) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY);
    const originalText = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(originalText);
  } catch (error) {
    console.error("Error Decode:", error.message);
    return null;
  }
};

export function setItem(name, data) {
  const encryptedValue = encryptData(JSON.stringify(data));
  localStorage.setItem(name, encryptedValue);
}
export function getItem(name) {
  return JSON.parse(decryptData(localStorage.getItem(name)));
}
export function removeItem(name) {
  localStorage.removeItem(name);
}
