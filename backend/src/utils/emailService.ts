import nodemailer from 'nodemailer';
import { SMTP_FROM_EMAIL, SMTP_PASS, SMTP_USER } from '../config/env';

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
    },
});

export const sendOTPEmail = async (email: string, otp: string) => {
  const mailOptions = {
    from: SMTP_FROM_EMAIL,
    to: email,
    subject: "Your Email Verification OTP",
    text: `Your OTP for email verification is: ${otp}. It expires in 10 minutes.`,
  };

  await transporter.sendMail(mailOptions);
};