import { AES, enc } from 'crypto-js';

export function decryptSecretKey(
  encryptedSecretKey: string,
  cryptoSecretKey: string,
) {
  const decrypted = AES.decrypt(encryptedSecretKey, cryptoSecretKey);
  return decrypted.toString(enc.Utf8);
}

export function encryptString(stringToEncrypt) {
  const encryptedString = AES.encrypt(
    stringToEncrypt,
    process.env.CRYPTO_SECRET_KEY,
  ).toString();
  return encryptedString;
}
