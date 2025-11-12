import { apiRequest } from "@/lib/queryClient";
import type {
  Barber,
  Service,
  Booking,
  InsertBooking,
  Review,
  InsertReview,
  DiscountCode,
  InsertDiscountCode,
  ReminderTemplate,
  InsertReminderTemplate,
  ReminderLog,
  StaffBreak,
  InsertStaffBreak,
  Client
} from "@shared/schema";

export const api = {
  // Barbers
  getBarbers: async (): Promise<Barber[]> => {
    const response = await apiRequest("GET", "/api/barbers");
    return response.json();
  },

  // Services
  getServices: async (): Promise<Service[]> => {
    const response = await apiRequest("GET", "/api/services");
    return response.json();
  },

  // Availability
  getAvailability: async (barberId: number, date: string, serviceId?: number): Promise<string[]> => {
    const url = serviceId
      ? `/api/availability?barberId=${barberId}&date=${date}&serviceId=${serviceId}`
      : `/api/availability?barberId=${barberId}&date=${date}`;
    const response = await apiRequest("GET", url);
    return response.json();
  },

  // Bookings
  getBookings: async (): Promise<Booking[]> => {
    const response = await apiRequest("GET", "/api/bookings");
    return response.json();
  },

  createBooking: async (booking: InsertBooking): Promise<Booking> => {
    const response = await apiRequest("POST", "/api/bookings", booking);
    return response.json();
  },

  updateBooking: async (id: number, updates: { status: string }): Promise<Booking> => {
    const response = await apiRequest("PATCH", `/api/bookings/${id}`, updates);
    return response.json();
  },

  deleteBooking: async (id: number): Promise<void> => {
    await apiRequest("DELETE", `/api/bookings/${id}`);
  },

  // Customer Authentication
  customerRegister: async (data: { name: string; email: string; phone: string; password: string }) => {
    const response = await apiRequest("POST", "/api/customer/register", data);
    return response.json();
  },

  customerLogin: async (data: { identifier: string; password: string }) => {
    const response = await apiRequest("POST", "/api/customer/login", data);
    return response.json();
  },

  customerLogout: async () => {
    const response = await apiRequest("POST", "/api/customer/logout");
    return response.json();
  },

  getCustomerProfile: async () => {
    const response = await apiRequest("GET", "/api/customer/me");
    return response.json();
  },

  updateCustomerProfile: async (updates: Partial<Client>) => {
    const response = await apiRequest("PATCH", "/api/customer/profile", updates);
    return response.json();
  },

  // Reviews
  getReviews: async (barberId?: number): Promise<Review[]> => {
    const url = barberId ? `/api/reviews?barberId=${barberId}` : "/api/reviews";
    const response = await apiRequest("GET", url);
    return response.json();
  },

  getCustomerReviews: async (): Promise<Review[]> => {
    const response = await apiRequest("GET", "/api/customer/reviews");
    return response.json();
  },

  createReview: async (review: InsertReview) => {
    const response = await apiRequest("POST", "/api/reviews", review);
    return response.json();
  },

  updateReview: async (id: number, updates: Partial<InsertReview>) => {
    const response = await apiRequest("PATCH", `/api/reviews/${id}`, updates);
    return response.json();
  },

  deleteReview: async (id: number) => {
    const response = await apiRequest("DELETE", `/api/reviews/${id}`);
    return response.json();
  },

  // Discount Codes
  validateDiscount: async (code: string, serviceId?: number, clientId?: number) => {
    const response = await apiRequest("POST", "/api/discounts/validate", {
      code,
      serviceId,
      clientId
    });
    return response.json();
  },

  getDiscountCodes: async (): Promise<DiscountCode[]> => {
    const response = await apiRequest("GET", "/api/discounts");
    return response.json();
  },

  createDiscountCode: async (discount: InsertDiscountCode) => {
    const response = await apiRequest("POST", "/api/discounts", discount);
    return response.json();
  },

  updateDiscountCode: async (id: number, updates: Partial<InsertDiscountCode>) => {
    const response = await apiRequest("PATCH", `/api/discounts/${id}`, updates);
    return response.json();
  },

  deleteDiscountCode: async (id: number) => {
    const response = await apiRequest("DELETE", `/api/discounts/${id}`);
    return response.json();
  },

  // Reminder Templates
  getReminderTemplates: async (): Promise<ReminderTemplate[]> => {
    const response = await apiRequest("GET", "/api/reminder-templates");
    return response.json();
  },

  createReminderTemplate: async (template: InsertReminderTemplate) => {
    const response = await apiRequest("POST", "/api/reminder-templates", template);
    return response.json();
  },

  updateReminderTemplate: async (id: number, updates: Partial<InsertReminderTemplate>) => {
    const response = await apiRequest("PATCH", `/api/reminder-templates/${id}`, updates);
    return response.json();
  },

  deleteReminderTemplate: async (id: number) => {
    const response = await apiRequest("DELETE", `/api/reminder-templates/${id}`);
    return response.json();
  },

  // Reminder Logs
  getReminderLogs: async (): Promise<ReminderLog[]> => {
    const response = await apiRequest("GET", "/api/reminder-logs");
    return response.json();
  },

  triggerReminderCheck: async () => {
    const response = await apiRequest("POST", "/api/reminders/trigger");
    return response.json();
  },

  getReminderStatus: async () => {
    const response = await apiRequest("GET", "/api/reminders/status");
    return response.json();
  },

  // Staff Breaks
  getStaffBreaks: async (barberId?: number, date?: string): Promise<StaffBreak[]> => {
    let url = "/api/staff-breaks";
    const params = [];
    if (barberId) params.push(`barberId=${barberId}`);
    if (date) params.push(`date=${date}`);
    if (params.length > 0) url += `?${params.join('&')}`;

    const response = await apiRequest("GET", url);
    return response.json();
  },

  createStaffBreak: async (staffBreak: InsertStaffBreak) => {
    const response = await apiRequest("POST", "/api/staff-breaks", staffBreak);
    return response.json();
  },

  updateStaffBreak: async (id: number, updates: Partial<InsertStaffBreak>) => {
    const response = await apiRequest("PATCH", `/api/staff-breaks/${id}`, updates);
    return response.json();
  },

  deleteStaffBreak: async (id: number) => {
    const response = await apiRequest("DELETE", `/api/staff-breaks/${id}`);
    return response.json();
  },
};
