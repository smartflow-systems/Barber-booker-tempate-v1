import { pgTable, text, serial, integer, timestamp, numeric, jsonb, index, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for authentication
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Admin users table for barber authentication
export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(), // hashed
  barberId: integer("barber_id").references(() => barbers.id),
  role: text("role").notNull().default("barber"), // barber, admin
  isActive: boolean("is_active").notNull().default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
});

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
  password: text("password"), // hashed password for customer login
  emailVerified: boolean("email_verified").default(false),
  preferredBarberId: integer("preferred_barber_id"),
  preferences: text("preferences"),
  notes: text("notes"),
  totalVisits: integer("total_visits").default(0),
  loyaltyPoints: integer("loyalty_points").default(0),
  birthday: text("birthday"), // YYYY-MM-DD format
  anniversary: text("anniversary"), // YYYY-MM-DD format
  referredBy: integer("referred_by").references(() => clients.id),
  profilePhoto: text("profile_photo"),
  lastVisit: timestamp("last_visit"),
  totalSpent: integer("total_spent").default(0), // in cents
  notificationPreferences: jsonb("notification_preferences"), // email, sms preferences
  createdAt: timestamp("created_at").defaultNow(),
});

export const clientPhotos = pgTable("client_photos", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  photoUrl: text("photo_url").notNull(),
  serviceId: integer("service_id").references(() => services.id),
  description: text("description"),
  takenAt: timestamp("taken_at").defaultNow(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "cascade" }).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  barberId: integer("barber_id").references(() => barbers.id).notNull(),
  amount: integer("amount").notNull(), // in cents
  tip: integer("tip").default(0), // in cents
  method: text("method").notNull(), // "stripe", "cash", "card"
  stripePaymentId: text("stripe_payment_id"),
  status: text("status").notNull().default("pending"), // "pending", "completed", "failed", "refunded"
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const packages = pgTable("packages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  serviceIds: text("service_ids").array(), // service IDs
  totalSessions: integer("total_sessions").notNull(),
  price: integer("price").notNull(), // in cents
  validityDays: integer("validity_days").default(365),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clientPackages = pgTable("client_packages", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id, { onDelete: "cascade" }).notNull(),
  packageId: integer("package_id").references(() => packages.id).notNull(),
  sessionsUsed: integer("sessions_used").default(0),
  purchasedAt: timestamp("purchased_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(), // YYYY-MM-DD format
  revenue: integer("revenue").default(0), // in cents
  bookings: integer("bookings").default(0),
  newClients: integer("new_clients").default(0),
  mostPopularService: integer("most_popular_service"),
  averageTicket: integer("average_ticket").default(0), // in cents
  data: jsonb("data"), // flexible analytics data
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketingCampaigns = pgTable("marketing_campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "birthday", "anniversary", "referral", "review_follow_up"
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true),
  sentCount: integer("sent_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const marketingLogs = pgTable("marketing_logs", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => marketingCampaigns.id).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
  opened: boolean("opened").default(false),
  clicked: boolean("clicked").default(false),
});

export const staffSchedule = pgTable("staff_schedule", {
  id: serial("id").primaryKey(),
  barberId: integer("barber_id").references(() => barbers.id, { onDelete: "cascade" }).notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  isAvailable: boolean("is_available").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const timeOffRequests = pgTable("time_off_requests", {
  id: serial("id").primaryKey(),
  barberId: integer("barber_id").references(() => barbers.id, { onDelete: "cascade" }).notNull(),
  startDate: text("start_date").notNull(), // YYYY-MM-DD format
  endDate: text("end_date").notNull(), // YYYY-MM-DD format
  reason: text("reason"),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  approvedBy: integer("approved_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // "product", "supply", "tool"
  currentStock: integer("current_stock").default(0),
  minimumStock: integer("minimum_stock").default(5),
  unitCost: integer("unit_cost").default(0), // in cents
  retailPrice: integer("retail_price").default(0), // in cents
  supplier: text("supplier"),
  lastRestocked: timestamp("last_restocked"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventoryUsage = pgTable("inventory_usage", {
  id: serial("id").primaryKey(),
  inventoryId: integer("inventory_id").references(() => inventory.id, { onDelete: "cascade" }).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id),
  quantity: integer("quantity").notNull(),
  usedAt: timestamp("used_at").defaultNow(),
});

export const retailSales = pgTable("retail_sales", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id),
  barberId: integer("barber_id").references(() => barbers.id).notNull(),
  inventoryId: integer("inventory_id").references(() => inventory.id, { onDelete: "cascade" }).notNull(),
  quantity: integer("quantity").notNull(),
  unitPrice: integer("unit_price").notNull(), // in cents
  totalAmount: integer("total_amount").notNull(), // in cents
  paymentMethod: text("payment_method").notNull(),
  soldAt: timestamp("sold_at").defaultNow(),
});

export const googleTokens = pgTable("google_tokens", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token").notNull(),
  expiryDate: timestamp("expiry_date").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id"),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  customerEmail: text("customer_email"),
  barberId: integer("barber_id").notNull(),
  serviceId: integer("service_id").notNull(),
  date: text("date").notNull(), // YYYY-MM-DD format
  time: text("time").notNull(), // HH:MM format
  status: text("status").notNull().default("confirmed"), // confirmed, completed, cancelled
  notes: text("notes"),
  reminderSent: timestamp("reminder_sent"),
  depositAmount: integer("deposit_amount").default(0),
  googleEventId: text("google_event_id"), // For calendar sync
  discountCode: text("discount_code"), // applied discount code
  discountAmount: integer("discount_amount").default(0), // discount amount in cents
  finalAmount: integer("final_amount"), // final amount after discount in cents
  createdAt: timestamp("created_at").defaultNow(),
});

// Reviews table for customer feedback
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  barberId: integer("barber_id").references(() => barbers.id, { onDelete: "cascade" }).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
  serviceId: integer("service_id").references(() => services.id),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  isAnonymous: boolean("is_anonymous").default(false),
  isApproved: boolean("is_approved").default(true),
  isPublished: boolean("is_published").default(true),
  adminResponse: text("admin_response"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Discount codes and promotions
export const discountCodes = pgTable("discount_codes", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  description: text("description"),
  type: text("type").notNull(), // "percentage", "fixed_amount", "service_discount"
  value: integer("value").notNull(), // percentage (0-100) or amount in cents
  minPurchase: integer("min_purchase").default(0), // minimum purchase amount in cents
  maxDiscount: integer("max_discount"), // max discount amount for percentage type
  usageLimit: integer("usage_limit"), // total usage limit
  usageCount: integer("usage_count").default(0),
  perClientLimit: integer("per_client_limit").default(1), // usage limit per client
  validFrom: timestamp("valid_from").defaultNow(),
  validUntil: timestamp("valid_until"),
  isActive: boolean("is_active").default(true),
  applicableServices: text("applicable_services").array(), // service IDs
  firstTimeOnly: boolean("first_time_only").default(false), // only for new clients
  createdBy: integer("created_by").references(() => adminUsers.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Track discount code usage
export const discountUsage = pgTable("discount_usage", {
  id: serial("id").primaryKey(),
  discountCodeId: integer("discount_code_id").references(() => discountCodes.id, { onDelete: "cascade" }).notNull(),
  clientId: integer("client_id").references(() => clients.id).notNull(),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "cascade" }),
  discountAmount: integer("discount_amount").notNull(), // in cents
  usedAt: timestamp("used_at").defaultNow(),
});

// Reminder settings and templates
export const reminderTemplates = pgTable("reminder_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // "email", "sms"
  triggerHours: integer("trigger_hours").notNull(), // hours before appointment (e.g., 24, 48)
  subject: text("subject"), // for email
  message: text("message").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Log of sent reminders
export const reminderLogs = pgTable("reminder_logs", {
  id: serial("id").primaryKey(),
  bookingId: integer("booking_id").references(() => bookings.id, { onDelete: "cascade" }).notNull(),
  templateId: integer("template_id").references(() => reminderTemplates.id),
  type: text("type").notNull(), // "email", "sms"
  recipient: text("recipient").notNull(), // email or phone
  status: text("status").notNull().default("pending"), // "pending", "sent", "failed", "delivered"
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Staff break times
export const staffBreaks = pgTable("staff_breaks", {
  id: serial("id").primaryKey(),
  barberId: integer("barber_id").references(() => barbers.id, { onDelete: "cascade" }).notNull(),
  scheduleId: integer("schedule_id").references(() => staffSchedule.id, { onDelete: "cascade" }),
  date: text("date").notNull(), // YYYY-MM-DD format
  startTime: text("start_time").notNull(), // HH:MM format
  endTime: text("end_time").notNull(), // HH:MM format
  breakType: text("break_type").notNull(), // "lunch", "break", "custom"
  notes: text("notes"),
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

export const insertGoogleTokenSchema = createInsertSchema(googleTokens).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertAdminUserSchema = createInsertSchema(adminUsers).omit({
  id: true,
  createdAt: true,
  lastLogin: true,
});

export const insertClientPhotoSchema = createInsertSchema(clientPhotos).omit({
  id: true,
  takenAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
  processedAt: true,
});

export const insertPackageSchema = createInsertSchema(packages).omit({
  id: true,
  createdAt: true,
});

export const insertClientPackageSchema = createInsertSchema(clientPackages).omit({
  id: true,
  purchasedAt: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).omit({
  id: true,
  createdAt: true,
});

export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
});

export const insertStaffScheduleSchema = createInsertSchema(staffSchedule).omit({
  id: true,
  createdAt: true,
});

export const insertTimeOffRequestSchema = createInsertSchema(timeOffRequests).omit({
  id: true,
  createdAt: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  createdAt: true,
  lastRestocked: true,
});

export const insertRetailSaleSchema = createInsertSchema(retailSales).omit({
  id: true,
  soldAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({
  id: true,
  createdAt: true,
});

export const insertDiscountUsageSchema = createInsertSchema(discountUsage).omit({
  id: true,
  usedAt: true,
});

export const insertReminderTemplateSchema = createInsertSchema(reminderTemplates).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertReminderLogSchema = createInsertSchema(reminderLogs).omit({
  id: true,
  createdAt: true,
  sentAt: true,
  deliveredAt: true,
});

export const insertStaffBreakSchema = createInsertSchema(staffBreaks).omit({
  id: true,
  createdAt: true,
});

export type InsertBarber = z.infer<typeof insertBarberSchema>;
export type Barber = typeof barbers.$inferSelect;

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertGoogleToken = z.infer<typeof insertGoogleTokenSchema>;
export type GoogleToken = typeof googleTokens.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertAdminUser = z.infer<typeof insertAdminUserSchema>;
export type AdminUser = typeof adminUsers.$inferSelect;

export type InsertClientPhoto = z.infer<typeof insertClientPhotoSchema>;
export type ClientPhoto = typeof clientPhotos.$inferSelect;

export type InsertPayment = z.infer<typeof insertPaymentSchema>;
export type Payment = typeof payments.$inferSelect;

export type InsertPackage = z.infer<typeof insertPackageSchema>;
export type Package = typeof packages.$inferSelect;

export type InsertClientPackage = z.infer<typeof insertClientPackageSchema>;
export type ClientPackage = typeof clientPackages.$inferSelect;

export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;

export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;

export type InsertStaffSchedule = z.infer<typeof insertStaffScheduleSchema>;
export type StaffSchedule = typeof staffSchedule.$inferSelect;

export type InsertTimeOffRequest = z.infer<typeof insertTimeOffRequestSchema>;
export type TimeOffRequest = typeof timeOffRequests.$inferSelect;

export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Inventory = typeof inventory.$inferSelect;

export type InsertRetailSale = z.infer<typeof insertRetailSaleSchema>;
export type RetailSale = typeof retailSales.$inferSelect;

export type InsertReview = z.infer<typeof insertReviewSchema>;
export type Review = typeof reviews.$inferSelect;

export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type DiscountCode = typeof discountCodes.$inferSelect;

export type InsertDiscountUsage = z.infer<typeof insertDiscountUsageSchema>;
export type DiscountUsage = typeof discountUsage.$inferSelect;

export type InsertReminderTemplate = z.infer<typeof insertReminderTemplateSchema>;
export type ReminderTemplate = typeof reminderTemplates.$inferSelect;

export type InsertReminderLog = z.infer<typeof insertReminderLogSchema>;
export type ReminderLog = typeof reminderLogs.$inferSelect;

export type InsertStaffBreak = z.infer<typeof insertStaffBreakSchema>;
export type StaffBreak = typeof staffBreaks.$inferSelect;
