/**
 * SMS Service using Twilio
 * Handles sending SMS reminders and notifications
 */

interface SMSConfig {
  accountSid: string;
  authToken: string;
  fromNumber: string;
}

class SMSService {
  private client: any;
  private fromNumber: string;
  private isConfigured: boolean = false;

  constructor() {
    this.fromNumber = process.env.TWILIO_PHONE_NUMBER || '';
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (accountSid && authToken && this.fromNumber) {
      try {
        // Dynamically import Twilio only if credentials are provided
        // This prevents errors when Twilio is not installed
        const twilio = require('twilio');
        this.client = twilio(accountSid, authToken);
        this.isConfigured = true;
        console.log('✅ SMS Service initialized with Twilio');
      } catch (error) {
        console.warn('⚠️  Twilio not installed. SMS features will be disabled.');
        console.warn('   To enable SMS: npm install twilio');
      }
    } else {
      console.warn('⚠️  Twilio credentials not configured. SMS features will be disabled.');
      console.warn('   Required env vars: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER');
    }
  }

  /**
   * Send an SMS message
   */
  async sendSMS(to: string, message: string): Promise<boolean> {
    if (!this.isConfigured) {
      console.log(`[SMS] Would send to ${to}: ${message}`);
      console.log('[SMS] Twilio not configured - message not sent');
      return false;
    }

    try {
      const result = await this.client.messages.create({
        body: message,
        from: this.fromNumber,
        to: this.formatPhoneNumber(to)
      });

      console.log(`✅ SMS sent to ${to} (SID: ${result.sid})`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to send SMS to ${to}:`, error);
      return false;
    }
  }

  /**
   * Send a booking reminder SMS
   */
  async sendBookingReminder(
    to: string,
    customerName: string,
    date: string,
    time: string,
    barberName: string
  ): Promise<boolean> {
    const message = `Hi ${customerName}! Reminder: Your haircut appointment with ${barberName} is on ${date} at ${time}. Reply STOP to opt out.`;
    return await this.sendSMS(to, message);
  }

  /**
   * Send a booking confirmation SMS
   */
  async sendBookingConfirmation(
    to: string,
    customerName: string,
    date: string,
    time: string,
    barberName: string
  ): Promise<boolean> {
    const message = `Hi ${customerName}! Your appointment with ${barberName} is confirmed for ${date} at ${time}. We look forward to seeing you!`;
    return await this.sendSMS(to, message);
  }

  /**
   * Send a cancellation notification
   */
  async sendCancellationNotification(
    to: string,
    customerName: string,
    date: string,
    time: string
  ): Promise<boolean> {
    const message = `Hi ${customerName}! Your appointment on ${date} at ${time} has been cancelled. Contact us to reschedule.`;
    return await this.sendSMS(to, message);
  }

  /**
   * Send a promotional SMS
   */
  async sendPromotion(
    to: string,
    customerName: string,
    promoCode: string,
    discount: string,
    expiryDate?: string
  ): Promise<boolean> {
    const expiry = expiryDate ? ` Valid until ${expiryDate}.` : '';
    const message = `Hi ${customerName}! Special offer: Use code ${promoCode} for ${discount} off your next visit.${expiry} Book now!`;
    return await this.sendSMS(to, message);
  }

  /**
   * Send a birthday SMS
   */
  async sendBirthdayMessage(
    to: string,
    customerName: string,
    specialOffer?: string
  ): Promise<boolean> {
    const offer = specialOffer ? ` ${specialOffer}` : '';
    const message = `Happy Birthday ${customerName}! 🎉${offer} We'd love to see you soon!`;
    return await this.sendSMS(to, message);
  }

  /**
   * Format phone number to E.164 format
   * Adds +1 for US numbers if not present
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // If already has country code, return with +
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return '+' + cleaned;
    }

    // If 10 digits, assume US and add +1
    if (cleaned.length === 10) {
      return '+1' + cleaned;
    }

    // Return as-is if already formatted
    if (phone.startsWith('+')) {
      return phone;
    }

    return '+' + cleaned;
  }

  /**
   * Check if SMS service is configured and ready
   */
  isReady(): boolean {
    return this.isConfigured;
  }
}

// Export singleton instance
export const smsService = new SMSService();
