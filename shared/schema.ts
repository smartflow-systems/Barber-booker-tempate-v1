import { pgTable, text, serial, integer, timestamp, numeric } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const barbers = pgTable("barbers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio"),
  experience: text("experience").notNull(),
  rating: text("rating").notNull(),
  avatar: text("avatar").notNull(),
  specialties: text("specialties").array(),
  phone: text("phone"),
  instagram: text("instagram"),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  duration: integer("duration").notNull(), // in minutes
  price: integer("price").notNull(), // in cents
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull().unique(),
  email: text("email"),
  preferredBarberId: integer("preferred_barber_id"),
  preferences: text("preferences"),
  notes: text("notes"),
  totalVisits: integer("total_visits").default(0),
  loyaltyPoints: integer("loyalty_points").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  barberId: integer("barber_id").notNull(),
  serviceId: integer("service_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  status: text("status").notNull().default("confirmed"), // confirmed, completed, cancelled
  notes: text("notes"),
  reminderSent: timestamp("reminder_sent"),
  depositAmount: integer("deposit_amount").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBarberSchema = createInsertSchema(barbers).omit({
  id: true,
});

export const insertServiceSchema = createInsertSchema(services).omit({
  id: true,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export type InsertBarber = z.infer<typeof insertBarberSchema>;
export type Barber = typeof barbers.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;
