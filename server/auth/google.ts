import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Use Replit preview URL for development to match OAuth configuration
const getRedirectUri = () => {
  // Always use the permanent production domain for consistency
  return 'https://barber-booker-boweazy123.replit.app/auth/google/callback';
};

const REDIRECT_URI = getRedirectUri();

// OAuth2 scopes for Google Calendar access
const SCOPES = [
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events'
];

export class GoogleAuthService {
  private oauth2Client: OAuth2Client;

  constructor() {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
      console.warn('⚠️  Google OAuth2 credentials not configured. Calendar integration will be disabled until GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set.');
      // Initialize with dummy values to prevent crashes
      this.oauth2Client = new google.auth.OAuth2('dummy', 'dummy', 'dummy');
      return;
    }

    this.oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      REDIRECT_URI
    );
  }

  /**
   * Generate Google OAuth2 authorization URL
   */
  getAuthUrl(userId: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
      state: userId, // Pass user ID as state parameter
      prompt: 'consent' // Force consent screen to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<{
    access_token: string;
    refresh_token: string;
    expiry_date: number;
  }> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
        throw new Error('Invalid token response from Google');
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date
      };
    } catch (error) {
      console.error('Error exchanging code for tokens:', error);
      throw new Error('Failed to exchange authorization code for tokens');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string;
    expiry_date: number;
  }> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken
      });

      const { credentials } = await this.oauth2Client.refreshAccessToken();
      
      if (!credentials.access_token || !credentials.expiry_date) {
        throw new Error('Invalid refresh token response from Google');
      }

      return {
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date
      };
    } catch (error) {
      console.error('Error refreshing access token:', error);
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Set credentials for authenticated requests
   */
  setCredentials(accessToken: string, refreshToken: string, expiryDate: number) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
      expiry_date: expiryDate
    });
  }

  /**
   * Get authenticated Google Calendar client
   */
  getCalendarClient() {
    return google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  /**
   * Test calendar access
   */
  async testCalendarAccess(): Promise<boolean> {
    try {
      const calendar = this.getCalendarClient();
      await calendar.calendarList.list();
      return true;
    } catch (error) {
      console.error('Calendar access test failed:', error);
      return false;
    }
  }
}

export const googleAuthService = new GoogleAuthService();