import { google } from 'googleapis';
import type { OAuth2Client } from 'google-auth-library';

// Google OAuth2 configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
// Use dynamic redirect URI based on environment
const getRedirectUri = () => {
  // Use environment variable if available, otherwise construct from REPLIT_DOMAINS
  if (process.env.REDIRECT_URI) {
    return process.env.REDIRECT_URI;
  }
  
  // For Replit deployment, use the first domain from REPLIT_DOMAINS
  if (process.env.REPLIT_DOMAINS) {
    const domain = process.env.REPLIT_DOMAINS.split(',')[0];
    return `https://${domain}/auth/google/callback`;
  }
  
  // Fallback for local development
  return 'http://localhost:5000/auth/google/callback';
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
      console.log('[OAuth] Attempting to exchange code for tokens');
      console.log('[OAuth] Redirect URI being used:', REDIRECT_URI);
      console.log('[OAuth] Client ID configured:', GOOGLE_CLIENT_ID ? 'Yes' : 'No');
      console.log('[OAuth] Client Secret configured:', GOOGLE_CLIENT_SECRET ? 'Yes' : 'No');
      
      const { tokens } = await this.oauth2Client.getToken(code);
      
      console.log('[OAuth] Token exchange response:', {
        has_access_token: !!tokens.access_token,
        has_refresh_token: !!tokens.refresh_token,
        has_expiry_date: !!tokens.expiry_date,
        token_type: tokens.token_type,
        scope: tokens.scope
      });
      
      if (!tokens.access_token || !tokens.expiry_date) {
        throw new Error('Missing required tokens in Google response');
      }

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token || '',
        expiry_date: tokens.expiry_date
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('[OAuth] Detailed token exchange error:', error);
      throw new Error(`Token exchange failed: ${errorMessage}`);
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