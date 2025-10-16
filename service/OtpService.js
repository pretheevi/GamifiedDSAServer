import OTPModel from "../models/Otp.js";
import ApiResponse from "../utility/apiResponse.js";
import EmailService from "./emailService.js";

class OtpService {
  static generateExpiry() {
    const currentTime = new Date();
    const expiryTime = new Date(currentTime.getTime() + 5 * 60 * 1000); // add 5 minutes from now
    return expiryTime.toISOString();
  }

  static generateOtp() {
    const numbers = "0123456789";
    const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numAlpha = numbers + alphabets;
    let otp = "";

    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * numAlpha.length);
      otp += numAlpha[randomIndex];
    }

    return otp;
  }

  static async createAndSendOtp(email) {
    try {
      const otp = OtpService.generateOtp();
      const expiryTime = OtpService.generateExpiry();
      await EmailService.sendOtpEmail(email, otp);
      await OTPModel.storeOtp(email, otp, expiryTime);

      console.log(`OTP sent to ${email} ${otp}`);
      return { expiryTime };
    } catch (err) {
      console.error("Error sending OTP:", err);
      ApiResponse.serverError(err, "Database Error");
    }
  }
}

export default OtpService;
