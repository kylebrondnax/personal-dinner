import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export class EmailService {
  private static instance: EmailService;
  private fromEmail: string;

  private constructor() {
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@familydinner.me';
  }

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  async sendEmail({ to, subject, html, from }: EmailData): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn('RESEND_API_KEY not configured, skipping email send');
        return false;
      }

      const { data, error } = await resend.emails.send({
        from: from || this.fromEmail,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error('Email send error:', error);
        return false;
      }

      console.log('Email sent successfully:', data?.id);
      return true;
    } catch (error) {
      console.error('Email service error:', error);
      return false;
    }
  }

  // Specific email types
  async sendWelcomeEmail(userEmail: string, userName: string, userRole: 'CHEF' | 'ATTENDEE'): Promise<boolean> {
    const subject = `Welcome to Family Dinner, ${userName}!`;
    const html = this.generateWelcomeEmail(userName, userRole);
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendReservationConfirmation(
    userEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: Date,
    eventLocation: string,
    guestCount: number
  ): Promise<boolean> {
    const subject = `Reservation Confirmed: ${eventTitle}`;
    const html = this.generateReservationConfirmationEmail(
      userName,
      eventTitle,
      eventDate,
      eventLocation,
      guestCount
    );
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendEventReminder(
    userEmail: string,
    userName: string,
    eventTitle: string,
    eventDate: Date,
    eventLocation: string,
    hoursUntilEvent: number
  ): Promise<boolean> {
    const subject = `Reminder: ${eventTitle} in ${hoursUntilEvent} hours`;
    const html = this.generateEventReminderEmail(
      userName,
      eventTitle,
      eventDate,
      eventLocation,
      hoursUntilEvent
    );
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendPaymentRequest(
    userEmail: string,
    userName: string,
    eventTitle: string,
    amount: number,
    venmoUrl: string,
    chefName: string
  ): Promise<boolean> {
    const subject = `Payment Request: ${eventTitle}`;
    const html = this.generatePaymentRequestEmail(
      userName,
      eventTitle,
      amount,
      venmoUrl,
      chefName
    );
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendEventUpdate(
    userEmail: string,
    userName: string,
    eventTitle: string,
    updateMessage: string,
    eventDate: Date
  ): Promise<boolean> {
    const subject = `Update: ${eventTitle}`;
    const html = this.generateEventUpdateEmail(
      userName,
      eventTitle,
      updateMessage,
      eventDate
    );
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  async sendEventCancellation(
    userEmail: string,
    userName: string,
    eventTitle: string,
    reason: string,
    eventDate: Date
  ): Promise<boolean> {
    const subject = `Cancelled: ${eventTitle}`;
    const html = this.generateEventCancellationEmail(
      userName,
      eventTitle,
      reason,
      eventDate
    );
    
    return this.sendEmail({
      to: userEmail,
      subject,
      html,
    });
  }

  // Email template generators
  private generateWelcomeEmail(userName: string, userRole: 'CHEF' | 'ATTENDEE'): string {
    const roleSpecificContent = userRole === 'CHEF' 
      ? `
        <p>As a chef, you can:</p>
        <ul>
          <li>Create and manage dinner events</li>
          <li>Connect with food lovers in your community</li>
          <li>Share your culinary passion</li>
          <li>Get paid fairly for your ingredients and time</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/chef/create-event" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">Create Your First Event</a>
      `
      : `
        <p>As a food lover, you can:</p>
        <ul>
          <li>Discover amazing dinner experiences</li>
          <li>Meet passionate home chefs</li>
          <li>Enjoy unique, home-cooked meals</li>
          <li>Pay only your fair share</li>
        </ul>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}/browse" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 16px 0;">Browse Dinners</a>
      `;

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Welcome to Family Dinner</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #2563eb; margin-bottom: 8px;">🍽️ Family Dinner</h1>
            <p style="color: #666; margin: 0;">Bringing food lovers together</p>
          </div>
          
          <h2>Welcome, ${userName}!</h2>
          <p>Thank you for joining Family Dinner, where passionate home chefs connect with food lovers to create amazing dining experiences.</p>
          
          ${roleSpecificContent}
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h3 style="margin-top: 0; color: #2563eb;">Getting Started</h3>
            <ol>
              <li>Complete your profile</li>
              <li>${userRole === 'CHEF' ? 'Create your first dinner event' : 'Browse upcoming dinners'}</li>
              <li>Start connecting with your local food community</li>
            </ol>
          </div>
          
          <p>If you have any questions, feel free to reach out to our support team.</p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px; text-align: center; color: #666; font-size: 14px;">
            <p>Happy dining!<br>The Family Dinner Team</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #2563eb;">familydinner.me</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateReservationConfirmationEmail(
    userName: string,
    eventTitle: string,
    eventDate: Date,
    eventLocation: string,
    guestCount: number
  ): string {
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Reservation Confirmed</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #2563eb; margin-bottom: 8px;">🍽️ Family Dinner</h1>
          </div>
          
          <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
            <h2 style="margin: 0;">Reservation Confirmed! ✅</h2>
          </div>
          
          <p>Hi ${userName},</p>
          <p>Your reservation for <strong>${eventTitle}</strong> has been confirmed!</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h3 style="margin-top: 0; color: #2563eb;">Event Details</h3>
            <p><strong>📅 Date:</strong> ${formattedDate}</p>
            <p><strong>🕒 Time:</strong> ${formattedTime}</p>
            <p><strong>📍 Location:</strong> ${eventLocation}</p>
            <p><strong>👥 Guests:</strong> ${guestCount} ${guestCount === 1 ? 'person' : 'people'}</p>
          </div>
          
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0;"><strong>Important:</strong> You'll receive the full address 24 hours before the event. We'll also send you a reminder!</p>
          </div>
          
          <p>We can't wait for you to enjoy this amazing dinner experience!</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/reservations" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View My Reservations</a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px; text-align: center; color: #666; font-size: 14px;">
            <p>The Family Dinner Team</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #2563eb;">familydinner.me</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateEventReminderEmail(
    userName: string,
    eventTitle: string,
    eventDate: Date,
    eventLocation: string,
    hoursUntilEvent: number
  ): string {
    const formattedTime = eventDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Event Reminder</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #2563eb; margin-bottom: 8px;">🍽️ Family Dinner</h1>
          </div>
          
          <div style="background-color: #f59e0b; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
            <h2 style="margin: 0;">Your dinner is in ${hoursUntilEvent} hours! ⏰</h2>
          </div>
          
          <p>Hi ${userName},</p>
          <p>This is a friendly reminder about your upcoming dinner:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h3 style="margin-top: 0; color: #2563eb;">${eventTitle}</h3>
            <p><strong>🕒 Time:</strong> ${formattedTime}</p>
            <p><strong>📍 Address:</strong> ${eventLocation}</p>
          </div>
          
          <div style="background-color: #dbeafe; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <h4 style="margin-top: 0; color: #2563eb;">Don't forget to:</h4>
            <ul style="margin-bottom: 0;">
              <li>Arrive on time</li>
              <li>Bring your appetite!</li>
              <li>Be ready to meet amazing people</li>
            </ul>
          </div>
          
          <p>We hope you have a wonderful time at this dinner!</p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px; text-align: center; color: #666; font-size: 14px;">
            <p>The Family Dinner Team</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #2563eb;">familydinner.me</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generatePaymentRequestEmail(
    userName: string,
    eventTitle: string,
    amount: number,
    venmoUrl: string,
    chefName: string
  ): string {
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Payment Request</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #2563eb; margin-bottom: 8px;">🍽️ Family Dinner</h1>
          </div>
          
          <h2>Payment Request from ${chefName}</h2>
          
          <p>Hi ${userName},</p>
          <p>Thank you for attending <strong>${eventTitle}</strong>! Based on the actual ingredient costs, your share comes to:</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; text-align: center; margin: 24px 0; border: 2px solid #2563eb;">
            <h3 style="color: #2563eb; font-size: 32px; margin: 0;">${formattedAmount}</h3>
            <p style="margin: 8px 0 0 0; color: #666;">Your fair share</p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${venmoUrl}" style="background-color: #3d95ce; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 18px; font-weight: bold;">Pay with Venmo</a>
          </div>
          
          <div style="background-color: #fef3c7; padding: 16px; border-radius: 8px; margin: 24px 0;">
            <p style="margin: 0;"><strong>Note:</strong> This amount is based on actual ingredient costs and receipts. We believe in transparent, fair pricing!</p>
          </div>
          
          <p>Thank you for being part of the Family Dinner community!</p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px; text-align: center; color: #666; font-size: 14px;">
            <p>The Family Dinner Team</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #2563eb;">familydinner.me</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateEventUpdateEmail(
    userName: string,
    eventTitle: string,
    updateMessage: string,
    eventDate: Date
  ): string {
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Event Update</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #2563eb; margin-bottom: 8px;">🍽️ Family Dinner</h1>
          </div>
          
          <h2>Update: ${eventTitle}</h2>
          
          <p>Hi ${userName},</p>
          <p>There's an update regarding your upcoming dinner on ${formattedDate}:</p>
          
          <div style="background-color: #dbeafe; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #2563eb;">
            <p style="margin: 0; font-size: 16px;">${updateMessage}</p>
          </div>
          
          <p>If you have any questions about this update, please don't hesitate to reach out.</p>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/reservations" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">View Event Details</a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px; text-align: center; color: #666; font-size: 14px;">
            <p>The Family Dinner Team</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #2563eb;">familydinner.me</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }

  private generateEventCancellationEmail(
    userName: string,
    eventTitle: string,
    reason: string,
    eventDate: Date
  ): string {
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Event Cancelled</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #2563eb; margin-bottom: 8px;">🍽️ Family Dinner</h1>
          </div>
          
          <div style="background-color: #ef4444; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
            <h2 style="margin: 0;">Event Cancelled</h2>
          </div>
          
          <p>Hi ${userName},</p>
          <p>We're sorry to inform you that <strong>${eventTitle}</strong> scheduled for ${formattedDate} has been cancelled.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 24px 0; border-left: 4px solid #ef4444;">
            <h4 style="margin-top: 0; color: #dc2626;">Reason for cancellation:</h4>
            <p style="margin-bottom: 0;">${reason}</p>
          </div>
          
          <p>If you've made any payments, you will receive a full refund within 3-5 business days.</p>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 24px 0;">
            <h4 style="margin-top: 0; color: #2563eb;">Don't let this stop you!</h4>
            <p style="margin-bottom: 0;">There are many other amazing dinners waiting for you. Browse our latest events and find your next culinary adventure!</p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/browse" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Browse Other Dinners</a>
          </div>
          
          <p>We apologize for any inconvenience and look forward to seeing you at future events.</p>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px; text-align: center; color: #666; font-size: 14px;">
            <p>The Family Dinner Team</p>
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="color: #2563eb;">familydinner.me</a>
            </p>
          </div>
        </body>
      </html>
    `;
  }
}

export const emailService = EmailService.getInstance();