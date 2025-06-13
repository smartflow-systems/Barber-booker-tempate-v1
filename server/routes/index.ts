import express, { type Express } from "express";
import session from "express-session";
import bcrypt from "bcrypt";
import { createServer } from "http";
import { storage } from "../storage";
import { googleAuthService } from "../auth/google";
import { insertBookingSchema, insertClientSchema, insertServiceSchema, insertBarberSchema, insertAdminUserSchema } from "../../shared/schema";
import connectPgSimple from "connect-pg-simple";

export async function registerRoutes(app: Express) {
  const server = createServer(app);

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

      // Update last login
      await storage.updateAdminUser(user.id, { lastLogin: new Date() });

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

  app.post("/api/bookings", async (req, res) => {
    try {
      const booking = insertBookingSchema.parse(req.body);
      const newBooking = await storage.createBooking(booking);
      res.status(201).json(newBooking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ error: "Failed to create booking" });
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
        expiryDate: new Date(tokens.expiry_date),
        scope: 'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events'
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