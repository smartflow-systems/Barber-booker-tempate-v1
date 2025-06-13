import { 
  barbers, 
  services, 
  clients,
  bookings,
  googleTokens,
  adminUsers,
  type Barber, 
  type Service, 
  type Client,
  type Booking,
  type GoogleToken,
  type AdminUser,
  type InsertBarber, 
  type InsertService, 
  type InsertClient,
  type InsertBooking,
  type InsertGoogleToken,
  type InsertAdminUser
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Barbers
  getBarbers(): Promise<Barber[]>;
  getBarber(id: number): Promise<Barber | undefined>;
  createBarber(barber: InsertBarber): Promise<Barber>;

  // Services
  getServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;

  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientByPhone(phone: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined>;

  // Google Tokens
  getGoogleToken(userId: string): Promise<GoogleToken | undefined>;
  createGoogleToken(token: InsertGoogleToken): Promise<GoogleToken>;
  updateGoogleToken(userId: string, updates: Partial<InsertGoogleToken>): Promise<GoogleToken | undefined>;
  deleteGoogleToken(userId: string): Promise<boolean>;

  // Admin Users
  getAdminUser(id: number): Promise<AdminUser | undefined>;
  getAdminUserByUsername(username: string): Promise<AdminUser | undefined>;
  createAdminUser(user: InsertAdminUser): Promise<AdminUser>;
  updateAdminUser(id: number, updates: Partial<InsertAdminUser>): Promise<AdminUser | undefined>;

  // Bookings
  getBookings(): Promise<Booking[]>;
  getBooking(id: number): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: number, updates: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: number): Promise<boolean>;
  getBookingsByDate(date: string): Promise<Booking[]>;
  getBookingsByBarberAndDate(barberId: number, date: string): Promise<Booking[]>;
  getBookingsByClient(clientId: number): Promise<Booking[]>;
}

export class MemStorage implements IStorage {
  private barbers: Map<number, Barber>;
  private services: Map<number, Service>;
  private clients: Map<number, Client>;
  private bookings: Map<number, Booking>;
  private adminUsers: Map<number, AdminUser>;
  private currentBarberId: number;
  private currentServiceId: number;
  private currentClientId: number;
  private currentBookingId: number;
  private currentAdminUserId: number;

  constructor() {
    this.barbers = new Map();
    this.services = new Map();
    this.clients = new Map();
    this.bookings = new Map();
    this.adminUsers = new Map();
    this.currentBarberId = 1;
    this.currentServiceId = 1;
    this.currentClientId = 1;
    this.currentBookingId = 1;
    this.currentAdminUserId = 1;
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default barbers
    const defaultBarbers: InsertBarber[] = [
      {
        name: "John Doe",
        title: "Senior Barber",
        experience: "8 years exp",
        rating: "4.9 (127 reviews)",
        avatar: "JD"
      },
      {
        name: "Mike Smith",
        title: "Master Barber",
        experience: "12 years exp",
        rating: "4.8 (203 reviews)",
        avatar: "MS"
      },
      {
        name: "Alex Johnson",
        title: "Specialist",
        experience: "6 years exp",
        rating: "4.7 (89 reviews)",
        avatar: "AJ"
      },
      {
        name: "Carlos Rivera",
        title: "Style Expert",
        experience: "10 years exp",
        rating: "4.9 (156 reviews)",
        avatar: "CR"
      }
    ];

    // Create default services
    const defaultServices: InsertService[] = [
      {
        name: "Classic Haircut",
        duration: 30,
        price: 2500 // $25.00
      },
      {
        name: "Haircut + Beard",
        duration: 45,
        price: 4000 // $40.00
      },
      {
        name: "Premium Package",
        duration: 60,
        price: 6000 // $60.00
      },
      {
        name: "Beard Trim",
        duration: 20,
        price: 1500 // $15.00
      }
    ];

    // Initialize barbers
    defaultBarbers.forEach(barber => {
      const id = this.currentBarberId++;
      const fullBarber: Barber = { 
        ...barber, 
        id,
        bio: barber.bio || null,
        specialties: barber.specialties || null,
        phone: barber.phone || null,
        instagram: barber.instagram || null
      };
      this.barbers.set(id, fullBarber);
    });

    // Initialize services
    defaultServices.forEach(service => {
      const id = this.currentServiceId++;
      this.services.set(id, { ...service, id });
    });
  }

  // Barber methods
  async getBarbers(): Promise<Barber[]> {
    return Array.from(this.barbers.values());
  }

  async getBarber(id: number): Promise<Barber | undefined> {
    return this.barbers.get(id);
  }

  async createBarber(insertBarber: InsertBarber): Promise<Barber> {
    const id = this.currentBarberId++;
    const barber: Barber = { 
      ...insertBarber, 
      id,
      bio: insertBarber.bio || null,
      specialties: insertBarber.specialties || null,
      phone: insertBarber.phone || null,
      instagram: insertBarber.instagram || null
    };
    this.barbers.set(id, barber);
    return barber;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }

  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.currentServiceId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values()).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateB.getTime() - dateA.getTime();
    });
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = this.currentBookingId++;
    const booking: Booking = { 
      ...insertBooking,
      id,
      clientId: insertBooking.clientId || null,
      status: insertBooking.status || "confirmed",
      notes: insertBooking.notes || null,
      reminderSent: null,
      depositAmount: insertBooking.depositAmount || null,
      googleEventId: insertBooking.googleEventId || null,
      createdAt: new Date()
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: number, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { ...booking, ...updates };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: number): Promise<boolean> {
    return this.bookings.delete(id);
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(booking => booking.date === date);
  }

  async getBookingsByBarberAndDate(barberId: number, date: string): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.barberId === barberId && booking.date === date
    );
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async getClientByPhone(phone: string): Promise<Client | undefined> {
    return Array.from(this.clients.values()).find(client => client.phone === phone);
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const id = this.currentClientId++;
    const client: Client = { 
      ...insertClient,
      id,
      email: insertClient.email || null,
      preferredBarberId: insertClient.preferredBarberId || null,
      preferences: insertClient.preferences || null,
      notes: insertClient.notes || null,
      totalVisits: insertClient.totalVisits || 0,
      loyaltyPoints: insertClient.loyaltyPoints || 0,
      createdAt: new Date()
    };
    this.clients.set(id, client);
    return client;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const client = this.clients.get(id);
    if (!client) return undefined;
    
    const updatedClient: Client = { ...client, ...updates };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async getBookingsByClient(clientId: number): Promise<Booking[]> {
    return Array.from(this.bookings.values()).filter(
      booking => booking.clientId === clientId
    );
  }

  // Google Token methods (not implemented for MemStorage)
  async getGoogleToken(userId: string): Promise<GoogleToken | undefined> {
    throw new Error("Google tokens not supported in memory storage");
  }

  async createGoogleToken(insertToken: InsertGoogleToken): Promise<GoogleToken> {
    throw new Error("Google tokens not supported in memory storage");
  }

  async updateGoogleToken(userId: string, updates: Partial<InsertGoogleToken>): Promise<GoogleToken | undefined> {
    throw new Error("Google tokens not supported in memory storage");
  }

  async deleteGoogleToken(userId: string): Promise<boolean> {
    throw new Error("Google tokens not supported in memory storage");
  }

  // Admin User methods (not implemented for MemStorage)
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    return this.adminUsers.get(id);
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    return Array.from(this.adminUsers.values()).find(user => user.username === username);
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const id = this.currentAdminUserId++;
    const user: AdminUser = { 
      ...insertUser,
      id,
      barberId: insertUser.barberId ?? null,
      role: insertUser.role ?? 'barber',
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
      lastLogin: null
    };
    this.adminUsers.set(id, user);
    return user;
  }

  async updateAdminUser(id: number, updates: Partial<InsertAdminUser>): Promise<AdminUser | undefined> {
    const user = this.adminUsers.get(id);
    if (!user) return undefined;
    
    const updatedUser: AdminUser = { ...user, ...updates };
    this.adminUsers.set(id, updatedUser);
    return updatedUser;
  }
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize data asynchronously to avoid blocking server startup
    this.initializeDefaultData().catch(console.error);
  }

  private async initializeDefaultData() {
    // Check if barbers already exist
    const existingBarbers = await this.getBarbers();
    if (existingBarbers.length > 0) return;

    // Initialize default admin users first
    try {
      const existingAdmin = await this.getAdminUserByUsername('john_barber');
      if (!existingAdmin) {
        const hashedPassword = await require('bcrypt').hash('barber123', 10);
        await this.createAdminUser({
          username: 'john_barber',
          password: hashedPassword,
          barberId: 1,
          role: 'barber',
          isActive: true
        });
      }
    } catch (error) {
      console.error('Error creating default admin user:', error);
    }

    // Create default barbers
    const defaultBarbers: InsertBarber[] = [
      {
        name: "John Doe",
        title: "Senior Barber",
        experience: "8 years exp",
        rating: "4.9 (127 reviews)",
        avatar: "JD"
      },
      {
        name: "Mike Smith",
        title: "Master Barber",
        experience: "12 years exp",
        rating: "4.8 (203 reviews)",
        avatar: "MS"
      },
      {
        name: "Alex Johnson",
        title: "Specialist",
        experience: "6 years exp",
        rating: "4.7 (89 reviews)",
        avatar: "AJ"
      },
      {
        name: "Carlos Rivera",
        title: "Style Expert",
        experience: "10 years exp",
        rating: "4.9 (156 reviews)",
        avatar: "CR"
      }
    ];

    // Create default services
    const defaultServices: InsertService[] = [
      {
        name: "Classic Haircut",
        duration: 30,
        price: 2500 // $25.00
      },
      {
        name: "Haircut + Beard",
        duration: 45,
        price: 4000 // $40.00
      },
      {
        name: "Premium Package",
        duration: 60,
        price: 6000 // $60.00
      },
      {
        name: "Beard Trim",
        duration: 20,
        price: 1500 // $15.00
      }
    ];

    // Initialize barbers
    for (const barber of defaultBarbers) {
      await this.createBarber(barber);
    }

    // Initialize services
    for (const service of defaultServices) {
      await this.createService(service);
    }
  }

  // Barber methods
  async getBarbers(): Promise<Barber[]> {
    return await db.select().from(barbers);
  }

  async getBarber(id: number): Promise<Barber | undefined> {
    const [barber] = await db.select().from(barbers).where(eq(barbers.id, id));
    return barber || undefined;
  }

  async createBarber(insertBarber: InsertBarber): Promise<Barber> {
    const [barber] = await db
      .insert(barbers)
      .values(insertBarber)
      .returning();
    return barber;
  }

  // Service methods
  async getServices(): Promise<Service[]> {
    return await db.select().from(services);
  }

  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service || undefined;
  }

  async createService(insertService: InsertService): Promise<Service> {
    const [service] = await db
      .insert(services)
      .values(insertService)
      .returning();
    return service;
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return await db.select().from(bookings).orderBy(bookings.createdAt);
  }

  async getBooking(id: number): Promise<Booking | undefined> {
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    return booking || undefined;
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const [booking] = await db
      .insert(bookings)
      .values(insertBooking)
      .returning();
    return booking;
  }

  async updateBooking(id: number, updates: Partial<InsertBooking>): Promise<Booking | undefined> {
    const [booking] = await db
      .update(bookings)
      .set(updates)
      .where(eq(bookings.id, id))
      .returning();
    return booking || undefined;
  }

  async deleteBooking(id: number): Promise<boolean> {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getBookingsByDate(date: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.date, date));
  }

  async getBookingsByBarberAndDate(barberId: number, date: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(
      and(eq(bookings.barberId, barberId), eq(bookings.date, date))
    );
  }

  // Client methods
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients);
  }

  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client || undefined;
  }

  async getClientByPhone(phone: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.phone, phone));
    return client || undefined;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db
      .insert(clients)
      .values(insertClient)
      .returning();
    return client;
  }

  async updateClient(id: number, updates: Partial<InsertClient>): Promise<Client | undefined> {
    const [client] = await db
      .update(clients)
      .set(updates)
      .where(eq(clients.id, id))
      .returning();
    return client || undefined;
  }

  async getBookingsByClient(clientId: number): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.clientId, clientId));
  }

  // Google Token methods
  async getGoogleToken(userId: string): Promise<GoogleToken | undefined> {
    const [token] = await db.select().from(googleTokens).where(eq(googleTokens.userId, userId));
    return token || undefined;
  }

  async createGoogleToken(insertToken: InsertGoogleToken): Promise<GoogleToken> {
    const [token] = await db
      .insert(googleTokens)
      .values(insertToken)
      .returning();
    return token;
  }

  async updateGoogleToken(userId: string, updates: Partial<InsertGoogleToken>): Promise<GoogleToken | undefined> {
    const [token] = await db
      .update(googleTokens)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(googleTokens.userId, userId))
      .returning();
    return token || undefined;
  }

  async deleteGoogleToken(userId: string): Promise<boolean> {
    const result = await db.delete(googleTokens).where(eq(googleTokens.userId, userId));
    return (result.rowCount || 0) > 0;
  }

  // Admin User methods
  async getAdminUser(id: number): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.id, id));
    return user || undefined;
  }

  async getAdminUserByUsername(username: string): Promise<AdminUser | undefined> {
    const [user] = await db.select().from(adminUsers).where(eq(adminUsers.username, username));
    return user || undefined;
  }

  async createAdminUser(insertUser: InsertAdminUser): Promise<AdminUser> {
    const [user] = await db
      .insert(adminUsers)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateAdminUser(id: number, updates: Partial<InsertAdminUser>): Promise<AdminUser | undefined> {
    const [user] = await db
      .update(adminUsers)
      .set(updates)
      .where(eq(adminUsers.id, id))
      .returning();
    return user || undefined;
  }
}

export const storage = new DatabaseStorage();
