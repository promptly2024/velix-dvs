import nodemailer from 'nodemailer';
import { SMTP_FROM_EMAIL, SMTP_PASS, SMTP_USER } from '../config/env';
import { batchReportTemplate, breachNotificationTemplate, passwordBreachTemplate } from './breachEmailTemplates';

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

// email breach 
export const sendBreachNotificationEmail = async (
  userEmail: string,
  checkedEmail: string,
  breachCount: number,
  breaches: Array<{ name: string; date: string; dataClasses: string[] }>,
): Promise<void> => {
  const breachList = breaches
    .map((b) => `• ${b.name} (${b.date}) - Exposed: ${b.dataClasses.join(', ')}`)
    .join('\n');

  const mailOptions = {
    from: SMTP_FROM_EMAIL,
    to: userEmail,
    subject: breachNotificationTemplate.subject(breachCount),
    html: breachNotificationTemplate.html(checkedEmail, breachCount, breachList),
    text: breachNotificationTemplate.text(checkedEmail, breachCount, breachList),
  };

  await transporter.sendMail(mailOptions);
};

// password breach email
export const sendPasswordBreachAlertEmail = async (
  userEmail: string,
  pwnCount: number,
  severity: string
): Promise<void> => {
  const mailOptions = {
    from: SMTP_FROM_EMAIL,
    to: userEmail,
    subject: passwordBreachTemplate.subject(pwnCount),
    html: passwordBreachTemplate.html(pwnCount, severity),
    text: passwordBreachTemplate.text(pwnCount, severity),
  };

  await transporter.sendMail(mailOptions);
};

// batch email report
export const sendBatchBreachReportEmail = async (
  userEmail: string,
  results: Array<{ email: string; breachCount: number; status: string }>,
  totalBreaches: number
): Promise<void> => {
  const resultsList = results
    .map((r) => `• ${r.email}: ${r.status === 'checked' ? `${r.breachCount} breach(es) found` : 'Failed to check'}`)
    .join('\n');

  const mailOptions = {
    from: SMTP_FROM_EMAIL,
    to: userEmail,
    subject: batchReportTemplate.subject(totalBreaches),
    html: batchReportTemplate.html(resultsList, totalBreaches),
    text: batchReportTemplate.text(resultsList, totalBreaches),
  };

  await transporter.sendMail(mailOptions);
};