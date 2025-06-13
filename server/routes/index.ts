import express, { type Express } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { createServer } from "http";
import { storage } from "../storage";
import { googleAuthService } from "../auth/google";
import { insertBookingSchema, insertClientSchema, insertServiceSchema, insertBarberSchema, insertAdminUserSchema, type Booking } from "../../shared/schema";
import connectPgSimple from "connect-pg-simple";

export async function registerRoutes(app: Express) {
  const server = createServer(app);

  // Helper function to create Google Calendar events
  async function createCalendarEvent(booking: Booking) {
    try {
      // Get all Google tokens to find an active one
      const allTokens = await storage.getGoogleTokens();
      if (!allTokens || allTokens.length === 0) {
        console.log('No Google tokens found, skipping calendar event creation');
        return;
      }

      // Use the first available token (in a real app, you'd associate tokens with specific users/barbers)
      const googleToken = allTokens[0];
      console.log(`Using Google token for user: ${googleToken.userId}`);

      // Set credentials for the Google API client
      googleAuthService.setCredentials(
        googleToken.accessToken,
        googleToken.refreshToken,
        googleToken.expiryDate.getTime()
      );

      // Get barber and service details
      const barber = await storage.getBarber(booking.barberId);
      const service = await storage.getService(booking.serviceId);

      if (!barber || !service) {
        console.error('Missing barber or service data for calendar event');
        return;
      }

      // Create calendar event
      const calendar = googleAuthService.getCalendarClient();

      // Parse the booking time and create start/end times
      const [hours, minutes] = booking.time.split(':').map(Number);
      const startDate = new Date(booking.date);
      startDate.setHours(hours, minutes, 0, 0);

      const endDate = new Date(startDate);
      endDate.setMinutes(endDate.getMinutes() + service.duration);

      const event = {
        summary: `${service.name} - ${booking.customerName}`,
        description: `Barbershop appointment\nBarber: ${barber.name}\nService: ${service.name}\nClient: ${booking.customerName}\nPhone: ${booking.customerPhone || 'N/A'}`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'America/New_York', // Adjust timezone as needed
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'America/New_York',
        },
        attendees: [
          {
            email: googleToken.userId, // The barber's email
            displayName: barber.name,
          },
        ],
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 24 hours before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const response = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
      });

      console.log('Calendar event created:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('Error creating calendar event:', error);
      throw error;
    }
  }

  // Session configuration
  const pgSession = connectPgSimple(session);
  app.use(session({
    store: new pgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Auth middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.adminUser) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    next();
  };

  // Admin Authentication Routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await storage.getAdminUserByUsername(username);
      if (!user || !user.isActive) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Update last login (skip for now due to type constraints)

      // Store user in session
      req.session.adminUser = user;

      res.json({ success: true, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/admin/logout", requireAuth, async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/admin/user", requireAuth, async (req, res) => {
    const user = req.session.adminUser;
    if (!user) {
      return res.status(401).json({ error: "User not found in session" });
    }
    res.json({
      id: user.id,
      username: user.username,
      role: user.role,
      barberId: user.barberId,
      isActive: user.isActive,
      lastLogin: user.lastLogin
    });
  });

  app.get("/api/admin/google-token", requireAuth, async (req, res) => {
    try {
      const user = req.session.adminUser;
      if (!user) {
        return res.status(401).json({ error: "User not found in session" });
      }
      const token = await storage.getGoogleToken(user.id.toString());
      res.json(token);
    } catch (error) {
      console.error("Error fetching Google token:", error);
      res.status(500).json({ error: "Failed to fetch Google token" });
    }
  });

  app.delete("/api/admin/google-disconnect", requireAuth, async (req, res) => {
    try {
      const user = req.session.adminUser;
      if (!user) {
        return res.status(401).json({ error: "User not found in session" });
      }
      await storage.deleteGoogleToken(user.id.toString());
      res.json({ success: true });
    } catch (error) {
      console.error("Error disconnecting Google:", error);
      res.status(500).json({ error: "Failed to disconnect Google" });
    }
  });

  // Barbers
  app.get("/api/barbers", async (_req, res) => {
    try {
      const barbers = await storage.getBarbers();
      res.json(barbers);
    } catch (error) {
      console.error("Error fetching barbers:", error);
      res.status(500).json({ error: "Failed to fetch barbers" });
    }
  });

  app.post("/api/barbers", async (req, res) => {
    try {
      const barber = insertBarberSchema.parse(req.body);
      const newBarber = await storage.createBarber(barber);
      res.status(201).json(newBarber);
    } catch (error) {
      console.error("Error creating barber:", error);
      res.status(500).json({ error: "Failed to create barber" });
    }
  });

  // Services
  app.get("/api/services", async (_req, res) => {
    try {
      const services = await storage.getServices();
      res.json(services);
    } catch (error) {
      console.error("Error fetching services:", error);
      res.status(500).json({ error: "Failed to fetch services" });
    }
  });

  app.post("/api/services", async (req, res) => {
    try {
      const service = insertServiceSchema.parse(req.body);
      const newService = await storage.createService(service);
      res.status(201).json(newService);
    } catch (error) {
      console.error("Error creating service:", error);
      res.status(500).json({ error: "Failed to create service" });
    }
  });

  // Bookings
  app.get("/api/bookings", async (_req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/date/:date", async (req, res) => {
    try {
      const { date } = req.params;
      const bookings = await storage.getBookingsByDate(date);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings by date:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  app.get("/api/bookings/barber/:barberId/date/:date", async (req, res) => {
    try {
      const { barberId, date } = req.params;
      const bookings = await storage.getBookingsByBarberAndDate(parseInt(barberId), date);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching barber bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // POST /api/bookings - Create a new booking
  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);

      // Create Google Calendar event after successful booking creation
      await createCalendarEvent(booking);

      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(400).json({ error: "Failed to create booking" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;

      const booking = await storage.updateBooking(id, updates);
      if (!booking) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json(booking);
    } catch (error) {
      console.error("Error updating booking:", error);
      res.status(500).json({ error: "Failed to update booking" });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteBooking(id);

      if (!success) {
        return res.status(404).json({ error: "Booking not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting booking:", error);
      res.status(500).json({ error: "Failed to delete booking" });
    }
  });

  // Availability - Get available time slots for a barber on a specific date
  app.get("/api/availability", async (req, res) => {
    try {
      const { barberId, date } = req.query;

      if (!barberId || !date) {
        return res.status(400).json({ error: "barberId and date are required" });
      }

      // All possible time slots
      const allSlots = [
        "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
        "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
        "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
      ];

      // Get existing bookings for the date and barber
      const bookings = await storage.getBookingsByBarberAndDate(parseInt(barberId as string), date as string);
      const bookedSlots = bookings.map(booking => booking.time);

      // Filter out booked slots
      const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

      res.json(availableSlots);
    } catch (error) {
      console.error("Error fetching availability:", error);
      res.status(500).json({ error: "Failed to fetch availability" });
    }
  });

  // Clients
  app.get("/api/clients", async (_req, res) => {
    try {
      const clients = await storage.getClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const client = insertClientSchema.parse(req.body);
      const newClient = await storage.createClient(client);
      res.status(201).json(newClient);
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

  // Health check for external connectivity
  app.get("/health", (req, res) => {
    res.json({ 
      status: "healthy", 
      timestamp: new Date().toISOString(),
      domain: req.hostname,
      port: process.env.PORT || (process.env.NODE_ENV === "production" ? 3000 : 5000)
    });
  });

  // Simple connectivity test
  app.get("/test", (req, res) => {
    res.send(`<h1>Server is running!</h1><p>Domain: ${req.hostname}</p><p>Time: ${new Date().toISOString()}</p>`);
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
        return res.redirect('/connected?error=' + encodeURIComponent(error));
      }

      if (!code) {
        console.error("[OAuth] No authorization code received");
        return res.redirect('/connected?error=' + encodeURIComponent('No authorization code received'));
      }

      if (!state) {
        console.error("[OAuth] No state parameter received");
        return res.redirect('/connected?error=' + encodeURIComponent('Invalid state parameter'));
      }

      // Exchange code for tokens
      const tokens = await googleAuthService.exchangeCodeForTokens(code);
      console.log("[OAuth] Token exchange successful");

      // Store tokens in database
      const savedToken = await storage.createGoogleToken({
        userId: state,
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiryDate: new Date(tokens.expiry_date)
      });

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

      // Redirect to success page instead of returning JSON
      res.redirect('/connected?success=true');

    } catch (error) {
      console.error("[OAuth] Callback error:", error);
      res.redirect('/connected?error=' + encodeURIComponent(
        error instanceof Error ? error.message : "Unknown error occurred"
      ));
    }
  });

  // Test endpoint for stored tokens
  app.get("/auth/google/test/:userId", async (req, res) => {
    try {
      const { userId } = req.params;

      const token = await storage.getGoogleToken(userId);
      if (!token) {
        return res.status(404).json({ error: "No token found for user" });
      }

      // Test if token is still valid
      googleAuthService.setCredentials(
        token.accessToken, 
        token.refreshToken, 
        token.expiryDate.getTime()
      );

      const calendarAccess = await googleAuthService.testCalendarAccess();

      res.json({
        success: true,
        tokenId: token.id,
        calendarAccess,
        expiryDate: token.expiryDate.toISOString()
      });

    } catch (error) {
      console.error("[OAuth] Test error:", error);
      res.status(500).json({ 
        error: "Failed to test token",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return server;
}