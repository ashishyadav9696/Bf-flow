import twilio from 'twilio';

/**
 * Check if Twilio is properly configured
 */
const isTwilioConfigured = () => {
  const sid = process.env.TWILIO_ACCOUNT_SID || '';
  const token = process.env.TWILIO_AUTH_TOKEN || '';
  const phone = process.env.TWILIO_PHONE_NUMBER || '';
  return (
    sid.startsWith('AC') &&
    token.length > 10 &&
    phone.startsWith('+')
  );
};

/**
 * Send OTP SMS to a phone number
 * @param {string} phoneNumber - 10-digit Indian phone number (e.g. 9876543210)
 * @param {string} otp - 6-digit OTP code
 */
export const sendOTPSms = async (phoneNumber, otp) => {
  if (!isTwilioConfigured()) {
    throw new Error('TWILIO_NOT_CONFIGURED');
  }

  const client = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  // Add +91 India country code if not already present
  const formattedNumber = phoneNumber.startsWith('+')
    ? phoneNumber
    : `+91${phoneNumber}`;

  await client.messages.create({
    body: `Your BankFlow OTP is: ${otp}\nValid for 5 minutes. Do not share with anyone.\n- BankFlow Security`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: formattedNumber,
  });
};
