import { encryptData, decryptData, hashPassword, comparePassword } from "./utils/crypto.js";

(async () => {
  const testObject = { name: "Johan", role: "Admin" };

  const encrypted = encryptData(testObject);
  console.log("🔒 Encriptado:", encrypted);

  const decrypted = decryptData(encrypted);
  console.log("🔓 Desencriptado:", decrypted);

  const password = "123456";
  const hash = await hashPassword(password);
  console.log("🔑 Hash:", hash);

  const match = await comparePassword(password, hash);
  console.log("✅ Coincide:", match);
})();
