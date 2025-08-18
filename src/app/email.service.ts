import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { WaitHold } from './wait-hold';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  from?: string;
}

export interface HoldNotificationData {
  waitHold: {
    name: string;
    email: string;
    tool: string;
    category: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class EmailService {
  constructor(private functions: Functions) {}

  /**
   * Send a general email
   */
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const sendEmailFunction = httpsCallable<EmailData, { success: boolean; messageId?: string }>(
      this.functions,
      'sendEmailHttp'
    );
    
    try {
      const result = await sendEmailFunction(emailData);
      return result.data;
    } catch (error: any) {
      
      // Handle different error types
      let errorMessage = 'Failed to send email';
      
      if (error.code === 'unauthenticated') {
        errorMessage = 'You must be signed in to send emails. Please sign in and try again.';
      } else if (error.code === 'permission-denied') {
        errorMessage = 'You do not have permission to send emails.';
      } else if (error.code === 'internal') {
        errorMessage = 'Email service is temporarily unavailable. Please try again later.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  }
} 