import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

import ApiResponse from '../utility/apiResponse.js';

class EmailService {
  static async sendOtpEmail(toEmail, otp) {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL,
        pass: process.env.GMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: process.env.GMAIL,
      to: toEmail,
      subject: "Your OTP Verification Code",
      text: `Your OTP is: ${otp}\nThis OTP is valid for 5 minutes.\nDo not share it with anyone.`,
    };

    try {
      await transporter.sendMail(mailOptions)
    } catch (err) {
      ApiResponse.serverError(err, "Failed to send OTP to email:", email);
    }
  }
}

export default EmailService;
