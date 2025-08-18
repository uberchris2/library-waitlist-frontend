import { Injectable } from '@angular/core';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../environments/environment';
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
  constructor(private functions: Functions, private http: HttpClient) {}

  /**
   * Send a general email
   */
  async sendEmail(emailData: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const functionUrl = `https://us-central1-${environment.firebase.projectId}.cloudfunctions.net/sendEmailHttp`;

    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    try {
      const result = await this.http.post(functionUrl, emailData, { headers }).toPromise();
      return result as { success: boolean; messageId?: string };
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