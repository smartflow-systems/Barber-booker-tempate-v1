import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertBookingSchema, insertClientSchema, insertGoogleTokenSchema } from "@shared/schema";
import { googleAuthService } from "./auth/google";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Get all barbers
  app.get("/api/barbers", async (req, res) => {
    try {
      const barbers = await storage.getBarbers();
      res.json(barbers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch barbers" });
    }
  });

  // Get all services
  app.get("/api/services", async (req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch services" });
    }
  });

  // Client routes
  app.get("/api/clients", async (req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.get("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  app.get("/api/clients/phone/:phone", async (req, res) => {
    try {
      const phone = req.params.phone;
      const client = await storage.getClientByPhone(phone);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error fetching client by phone:", error);
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const result = insertClientSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ 
          error: "Invalid client data", 
          details: result.error.errors 
        });
      }
      
      const client = await storage.createClient(result.data);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      res.status(500).json({ error: "Failed to create client" });
    }
  });

  app.patch("/api/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const client = await storage.updateClient(id, updates);
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      res.status(500).json({ error: "Failed to update client" });
    }
  });

  // Google OAuth2 routes
  app.get("/auth/google", async (req, res) => {
    try {
      const userId = req.query.userId as string || "admin"; // Default user for testing
      console.log(`[OAuth] Initiating Google OAuth for user: ${userId}`);
      
      const authUrl = googleAuthService.getAuthUrl(userId);
      console.log(`[OAuth] Generated auth URL: ${authUrl}`);
      
      res.redirect(authUrl);
    } catch (error) {
      console.error("[OAuth] Error initiating Google auth:", error);
      res.status(500).json({ 
        error: "Failed to initiate Google authentication",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/auth/google/callback", async (req, res) => {
    try {
      const code = req.query.code as string;
      const state = req.query.state as string; // This contains the userId
      const error = req.query.error as string;

      console.log(`[OAuth] Callback received - Code: ${code ? 'present' : 'missing'}, State: ${state}, Error: ${error}`);

      if (error) {
        console.error(`[OAuth] Authorization error: ${error}`);
        return res.status(400).json({ error: `Authorization failed: ${error}` });
      }

      if (!code) {
        console.error("[OAuth] No authorization code received");
        return res.status(400).json({ error: "No authorization code received" });
      }

      if (!state) {
        console.error("[OAuth] No state parameter received");
        return res.status(400).json({ error: "No user ID in state parameter" });
      }

      console.log(`[OAuth] Exchanging code for tokens...`);
      const tokens = await googleAuthService.exchangeCodeForTokens(code);
      console.log(`[OAuth] Token exchange successful - Access token: ${tokens.access_token.substring(0, 20)}...`);

      // Store tokens in database
      const tokenData = {
        userId: state,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date)
      };

      console.log(`[OAuth] Storing tokens for user: ${state}`);
      
      // Check if token already exists
      const existingToken = await storage.getGoogleToken(state);
      let savedToken;
      
      if (existingToken) {
        console.log(`[OAuth] Updating existing token for user: ${state}`);
        savedToken = await storage.updateGoogleToken(state, tokenData);
      } else {
        console.log(`[OAuth] Creating new token for user: ${state}`);
        savedToken = await storage.createGoogleToken(tokenData);
      }

      if (!savedToken) {
        throw new Error("Failed to save token to database");
      }

      console.log(`[OAuth] Token successfully stored with ID: ${savedToken.id}`);

      // Test calendar access
      googleAuthService.setCredentials(
        tokens.access_token, 
        tokens.refresh_token, 
        tokens.expiry_date
      );
      
      const calendarAccessTest = await googleAuthService.testCalendarAccess();
      console.log(`[OAuth] Calendar access test: ${calendarAccessTest ? 'SUCCESS' : 'FAILED'}`);

      res.json({
        success: true,
        message: "Google Calendar integration successful",
        tokenId: savedToken.id,
        calendarAccess: calendarAccessTest,
        expiryDate: new Date(tokens.expiry_date).toISOString()
      });

    } catch (error) {
      console.error("[OAuth] Callback error:", error);
      res.status(500).json({ 
        error: "Failed to complete Google authentication",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Test OAuth credentials setup
  app.get("/auth/google/test-credentials", async (req, res) => {
    try {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      
      if (!clientId || !clientSecret) {
        return res.json({
          success: false,
          error: "Missing OAuth credentials",
          details: {
            hasClientId: !!clientId,
            hasClientSecret: !!clientSecret,
            clientIdLength: clientId ? clientId.length : 0,
            clientSecretLength: clientSecret ? clientSecret.length : 0
          }
        });
      }

      // Test if we can generate an auth URL (this validates the credentials format)
      try {
        const authUrl = googleAuthService.getAuthUrl("test");
        return res.json({
          success: true,
          message: "OAuth credentials are properly configured",
          details: {
            hasClientId: true,
            hasClientSecret: true,
            clientIdLength: clientId.length,
            clientSecretLength: clientSecret.length,
            canGenerateAuthUrl: !!authUrl
          }
        });
      } catch (authError) {
        return res.json({
          success: false,
          error: "Invalid OAuth credentials format",
          details: {
            hasClientId: true,
            hasClientSecret: true,
            authError: authError instanceof Error ? authError.message : "Unknown error"
          }
        });
      }
    } catch (error) {
      console.error("[OAuth] Credentials test error:", error);
      res.status(500).json({ 
        success: false,
        error: "Failed to test OAuth credentials",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Test Google Calendar connection
  app.get("/auth/google/test/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
      console.log(`[OAuth] Testing calendar access for user: ${userId}`);
      
      const token = await storage.getGoogleToken(userId);
      if (!token) {
        return res.status(404).json({ error: "No Google token found for user" });
      }

      console.log(`[OAuth] Found token, expires: ${token.expiryDate}`);
      
      // Check if token is expired
      if (new Date() >= token.expiryDate) {
        console.log(`[OAuth] Token expired, attempting refresh...`);
        
        try {
          const refreshedTokens = await googleAuthService.refreshAccessToken(token.refreshToken);
          
          const updatedToken = await storage.updateGoogleToken(userId, {
            accessToken: refreshedTokens.access_token,
            expiryDate: new Date(refreshedTokens.expiry_date)
          });

          if (updatedToken) {
            token.accessToken = updatedToken.accessToken;
            token.expiryDate = updatedToken.expiryDate;
            console.log(`[OAuth] Token refreshed successfully`);
          }
        } catch (refreshError) {
          console.error(`[OAuth] Token refresh failed:`, refreshError);
          return res.status(401).json({ error: "Token expired and refresh failed" });
        }
      }

      googleAuthService.setCredentials(
        token.accessToken,
        token.refreshToken,
        token.expiryDate.getTime()
      );

      const calendarAccess = await googleAuthService.testCalendarAccess();
      
      res.json({
        success: true,
        calendarAccess,
        tokenExpiry: token.expiryDate.toISOString(),
        userId
      });

    } catch (error) {
      console.error("[OAuth] Test error:", error);
      res.status(500).json({ 
        error: "Failed to test Google Calendar access",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get available time slots for a barber on a specific date
  app.get("/api/availability", async (req, res) => {
    try {
      const { barberId, date } = req.query;
      
      if (!barberId || !date) {
        return res.status(400).json({ message: "barberId and date are required" });
      }

      const existingBookings = await storage.getBookingsByBarberAndDate(
        parseInt(barberId as string), 
        date as string
      );

      // Generate all possible time slots (9:00 AM to 6:00 PM, 30-minute intervals)
      const allSlots = [];
      for (let hour = 9; hour < 18; hour++) {
        allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
        allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
      }

      // Filter out booked slots
      const bookedSlots = existingBookings.map(booking => booking.time);
      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

      res.json(availableSlots);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch availability" });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      
      // Check if the time slot is still available
      const existingBookings = await storage.getBookingsByBarberAndDate(
        validatedData.barberId,
        validatedData.date
      );
      
      const isSlotTaken = existingBookings.some(booking => booking.time === validatedData.time);
      if (isSlotTaken) {
        return res.status(409).json({ message: "This time slot is no longer available" });
      }

      const booking = await storage.createBooking(validatedData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid booking data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  // Get all bookings
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Update booking status
  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["confirmed", "completed", "cancelled"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const updatedBooking = await storage.updateBooking(id, { status });
      if (!updatedBooking) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json(updatedBooking);
    } catch (error) {
      res.status(500).json({ message: "Failed to update booking" });
    }
  });

  // Delete a booking
  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteBooking(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Booking not found" });
      }

      res.json({ message: "Booking deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete booking" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
