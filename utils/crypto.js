import bcrypt from "bcryptjs";
import CryptoJS from "crypto-js";
import dotenv from "dotenv";

dotenv.config();
const secret = process.env.JWT_ACCESS_SECRET || process.env.JWT_REFRESH_SECRET;
export function encryptData(data) {
  try {
    const encrypted = CryptoJS.AES.encrypt(JSON.stringify(data), secret).toString();
    return encrypted;
  } catch (error) {
    console.error("Error al cifrar datos:", error);
    throw error;
  }
}
export function decryptData(ciphertext) {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, secret);
    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    return decrypted;
  } catch (error) {
    console.error("Error al descifrar datos:", error);
    throw error;
  }
}
export async function hashPassword(password) {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    return hashed;
  } catch (error) {
    console.error("Error al hashear contraseña:", error);
    throw error;
  }
}
export async function comparePassword(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch (error) {
    console.error("Error al comparar contraseñas:", error);
    throw error;
  }
}


