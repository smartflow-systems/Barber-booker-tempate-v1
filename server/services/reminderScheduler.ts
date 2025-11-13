/**
 * Reminder Scheduler Service
 * Handles automatic sending of email and SMS reminders for upcoming appointments
 */

import { storage } from '../storage';
import { smsService } from './sms';
import { sendEmailConfirmation } from '../ai/bookingMessage';
import type { Booking, ReminderTemplate } from '@shared/schema';

class ReminderScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private checkIntervalMs: number = 5 * 60 * 1000; // Check every 5 minutes

  /**
   * Start the reminder scheduler
   */
  start() {
    if (this.isRunning) {
      console.log('⚠️  Reminder scheduler is already running');
      return;
    }

    console.log('🕐 Starting reminder scheduler...');
    this.isRunning = true;

    // Run immediately on start
    this.checkAndSendReminders().catch(console.error);

    // Then run on interval
    this.intervalId = setInterval(() => {
      this.checkAndSendReminders().catch(console.error);
    }, this.checkIntervalMs);

    console.log(`✅ Reminder scheduler started (checking every ${this.checkIntervalMs / 60000} minutes)`);
  }

  /**
   * Stop the reminder scheduler
   */
  stop() {
    if (!this.isRunning) {
      console.log('⚠️  Reminder scheduler is not running');
      return;
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log('🛑 Reminder scheduler stopped');
  }

  /**
   * Check for upcoming bookings and send reminders
   */
  private async checkAndSendReminders() {
    try {
      // Get all active reminder templates
      const templates = await storage.getReminderTemplates();
      const activeTemplates = templates.filter(t => t.isActive);

      if (activeTemplates.length === 0) {
        return;
      }

      // Get all confirmed bookings
      const allBookings = await storage.getBookings();
      const upcomingBookings = allBookings.filter(
        b => b.status === 'confirmed' && !b.reminderSent
      );

      const now = new Date();

      for (const booking of upcomingBookings) {
        const bookingDateTime = this.parseBookingDateTime(booking.date, booking.time);
        if (!bookingDateTime) continue;

        // Check each reminder template
        for (const template of activeTemplates) {
          const shouldSend = await this.shouldSendReminder(
            booking,
            bookingDateTime,
            template,
            now
          );

          if (shouldSend) {
            await this.sendReminder(booking, template);
          }
        }
      }
    } catch (error) {
      console.error('❌ Error in reminder scheduler:', error);
    }
  }

  /**
   * Determine if a reminder should be sent
   */
  private async shouldSendReminder(
    booking: Booking,
    bookingDateTime: Date,
    template: ReminderTemplate,
    now: Date
  ): Promise<boolean> {
    // Calculate the target send time
    const triggerMs = template.triggerHours * 60 * 60 * 1000;
    const targetSendTime = new Date(bookingDateTime.getTime() - triggerMs);

    // Check if we're within the send window (current time is past target, but booking is still in future)
    const isPastTargetTime = now >= targetSendTime;
    const isBeforeBooking = now < bookingDateTime;

    if (!isPastTargetTime || !isBeforeBooking) {
      return false;
    }

    // Check if this specific reminder was already sent
    const logs = await storage.getReminderLogsByBooking(booking.id);
    const alreadySent = logs.some(
      log => log.templateId === template.id && log.status === 'sent'
    );

    return !alreadySent;
  }

  /**
   * Send a reminder for a booking
   */
  private async sendReminder(booking: Booking, template: ReminderTemplate) {
    try {
      // Get barber info for personalization
      const barber = booking.barberId ? await storage.getBarber(booking.barberId) : null;
      const barberName = barber?.name || 'your barber';

      // Personalize the message
      const message = template.message
        .replace('{customerName}', booking.customerName)
        .replace('{date}', this.formatDate(booking.date))
        .replace('{time}', booking.time)
        .replace('{barberName}', barberName);

      let success = false;
      const recipient = template.type === 'sms' ? booking.customerPhone : booking.customerEmail || '';

      // Send based on template type
      if (template.type === 'sms' && booking.customerPhone) {
        success = await smsService.sendSMS(booking.customerPhone, message);
      } else if (template.type === 'email' && booking.customerEmail) {
        const subject = template.subject || `Reminder: Your appointment on ${this.formatDate(booking.date)}`;
        success = await sendEmailConfirmation(booking.customerEmail, message);
      }

      // Log the reminder attempt
      await storage.createReminderLog({
        bookingId: booking.id,
        templateId: template.id,
        type: template.type,
        recipient: recipient,
        status: success ? 'sent' : 'failed',
        sentAt: success ? new Date() : undefined,
        errorMessage: success ? undefined : 'Failed to send reminder'
      });

      // Update booking reminder status
      if (success) {
        await storage.updateBooking(booking.id, {
          reminderSent: new Date()
        });

        console.log(`✅ Sent ${template.type} reminder for booking #${booking.id} to ${recipient}`);
      } else {
        console.warn(`⚠️  Failed to send ${template.type} reminder for booking #${booking.id}`);
      }
    } catch (error) {
      console.error(`❌ Error sending reminder for booking #${booking.id}:`, error);
    }
  }

  /**
   * Parse booking date and time into a Date object
   */
  private parseBookingDateTime(date: string, time: string): Date | null {
    try {
      // date is in YYYY-MM-DD format
      // time is in HH:MM format
      const [year, month, day] = date.split('-').map(Number);
      const [hours, minutes] = time.split(':').map(Number);

      return new Date(year, month - 1, day, hours, minutes);
    } catch (error) {
      console.error('Error parsing booking date/time:', error);
      return null;
    }
  }

  /**
   * Format date for display
   */
  private formatDate(dateStr: string): string {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const date = new Date(year, month - 1, day);

      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return dateStr;
    }
  }

  /**
   * Manually trigger reminder check (for testing)
   */
  async triggerCheck() {
    console.log('🔄 Manually triggering reminder check...');
    await this.checkAndSendReminders();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      checkIntervalMs: this.checkIntervalMs,
      checkIntervalMinutes: this.checkIntervalMs / 60000
    };
  }
}

// Export singleton instance
export const reminderScheduler = new ReminderScheduler();
