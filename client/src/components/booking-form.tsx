import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, CalendarCheck, Star, MessageCircle } from "lucide-react";
import { SuccessModal } from "@/components/success-modal";
import { useToast } from "@/hooks/use-toast";
import type { Barber, Service } from "@shared/schema";

const bookingSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  customerPhone: z.string().min(10, "Please enter a valid phone number"),
  barberId: z.number().min(1, "Please select a barber"),
  serviceId: z.number().min(1, "Please select a service"),
  date: z.string().min(1, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export function BookingForm() {
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      barberId: 0,
      serviceId: 0,
      date: "",
      time: "",
    },
  });

  // Fetch barbers
  const { data: barbers = [] } = useQuery({
    queryKey: ["/api/barbers"],
    queryFn: api.getBarbers,
  });

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    queryFn: api.getServices,
  });

  // Fetch available time slots
  const { data: availableSlots = [] } = useQuery({
    queryKey: ["/api/availability", selectedBarber, selectedDate],
    queryFn: () => api.getAvailability(selectedBarber!, selectedDate),
    enabled: !!selectedBarber && !!selectedDate,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: api.createBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/availability"] });
      
      const selectedBarberData = barbers.find(b => b.id === data.barberId);
      const selectedServiceData = services.find(s => s.id === data.serviceId);
      
      setBookingDetails({
        ...data,
        barberName: selectedBarberData?.name || "",
        serviceName: selectedServiceData?.name || "",
        servicePrice: selectedServiceData?.price || 0,
      });
      setShowSuccessModal(true);
      form.reset();
      setSelectedBarber(null);
      setSelectedDate("");
      setSelectedTime("");
      setSelectedService(null);
    },
    onError: (error: any) => {
      toast({
        title: "Booking failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: BookingFormData) => {
    createBookingMutation.mutate({
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      barberId: data.barberId,
      serviceId: data.serviceId,
      date: data.date,
      time: data.time,
      status: "confirmed",
    });
  };

  // Update form when selections change
  useEffect(() => {
    if (selectedBarber) {
      form.setValue("barberId", selectedBarber);
    }
  }, [selectedBarber, form]);

  useEffect(() => {
    if (selectedDate) {
      form.setValue("date", selectedDate);
    }
  }, [selectedDate, form]);

  useEffect(() => {
    if (selectedTime) {
      form.setValue("time", selectedTime);
    }
  }, [selectedTime, form]);

  useEffect(() => {
    if (selectedService) {
      form.setValue("serviceId", selectedService);
    }
  }, [selectedService, form]);

  // Set minimum date to today
  const today = new Date().toISOString().split('T')[0];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  const openWhatsApp = () => {
    const phoneNumber = "1234567890"; // Replace with your actual WhatsApp number
    const message = "Hi, I'd like to book an appointment at BarberShop Pro. Can you help me with scheduling?";
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      {/* Booking Form */}
      <div className="lg:col-span-2">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 rounded-t-lg">
            <CardTitle className="text-2xl text-slate-900 flex items-center">
              <CalendarCheck className="text-blue-600 mr-3" />
              Book Your Appointment
            </CardTitle>
            <p className="text-slate-700 font-medium">Select your preferred barber, date, and time slot</p>
          </CardHeader>
          
          <CardContent className="p-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Barber Selection */}
              <div className="space-y-3" data-tour="barber-selection">
                <Label className="text-sm font-semibold text-slate-700 flex items-center">
                  <User className="text-primary mr-2 w-4 h-4" />
                  Choose Your Barber
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {barbers.map((barber) => (
                    <div key={barber.id} className="relative">
                      <input
                        type="radio"
                        id={`barber-${barber.id}`}
                        name="barber"
                        value={barber.id}
                        className="sr-only peer"
                        checked={selectedBarber === barber.id}
                        onChange={() => setSelectedBarber(barber.id)}
                      />
                      <label
                        htmlFor={`barber-${barber.id}`}
                        className="flex items-center p-5 bg-gradient-to-r from-white to-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer peer-checked:border-blue-500 peer-checked:bg-gradient-to-r peer-checked:from-blue-50 peer-checked:to-indigo-50 peer-checked:shadow-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4 shadow-lg">
                          {barber.avatar}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">{barber.name}</div>
                          <div className="text-sm text-slate-500">{barber.title} • {barber.experience}</div>
                          <div className="flex items-center mt-1">
                            <div className="flex text-yellow-400 mr-2">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                            <span className="text-xs text-slate-500">{barber.rating}</span>
                          </div>
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.barberId && (
                  <p className="text-sm text-red-500">{form.formState.errors.barberId.message}</p>
                )}
              </div>

              {/* Date Selection */}
              <div className="space-y-3" data-tour="date-selection">
                <Label htmlFor="date" className="text-sm font-semibold text-slate-700 flex items-center">
                  <Calendar className="text-primary mr-2 w-4 h-4" />
                  Select Date
                </Label>
                <Input
                  type="date"
                  id="date"
                  min={today}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full"
                />
                {form.formState.errors.date && (
                  <p className="text-sm text-red-500">{form.formState.errors.date.message}</p>
                )}
              </div>

              {/* Time Slots */}
              {selectedBarber && selectedDate && (
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-slate-700 flex items-center">
                    <Clock className="text-primary mr-2 w-4 h-4" />
                    Available Time Slots
                  </Label>
                  {availableSlots.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`p-3 text-center border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                            selectedTime === slot
                              ? "border-blue-500 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105"
                              : "border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50 hover:shadow-md"
                          }`}
                        >
                          <span className="font-semibold">{formatTime(slot)}</span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-slate-500 bg-slate-50 rounded-lg border-2 border-dashed border-slate-200">
                      <Clock className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                      <p>No available slots for this date</p>
                    </div>
                  )}
                  {form.formState.errors.time && (
                    <p className="text-sm text-red-500">{form.formState.errors.time.message}</p>
                  )}
                </div>
              )}

              {/* Customer Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-tour="customer-info">
                <div className="space-y-2">
                  <Label htmlFor="customerName" className="text-sm font-semibold text-slate-700 flex items-center">
                    <User className="text-primary mr-2 w-4 h-4" />
                    Your Name
                  </Label>
                  <Input
                    id="customerName"
                    placeholder="Enter your full name"
                    {...form.register("customerName")}
                  />
                  {form.formState.errors.customerName && (
                    <p className="text-sm text-red-500">{form.formState.errors.customerName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerPhone" className="text-sm font-semibold text-slate-700 flex items-center">
                    <Phone className="text-primary mr-2 w-4 h-4" />
                    Phone Number
                  </Label>
                  <Input
                    id="customerPhone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    {...form.register("customerPhone")}
                  />
                  {form.formState.errors.customerPhone && (
                    <p className="text-sm text-red-500">{form.formState.errors.customerPhone.message}</p>
                  )}
                </div>
              </div>

              {/* Service Selection */}
              <div className="space-y-3" data-tour="service-selection">
                <Label className="text-sm font-semibold text-slate-700 flex items-center">
                  <i className="fas fa-scissors text-primary mr-2"></i>
                  Select Service
                </Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((service) => (
                    <div key={service.id} className="relative">
                      <input
                        type="radio"
                        id={`service-${service.id}`}
                        name="service"
                        value={service.id}
                        className="sr-only peer"
                        checked={selectedService === service.id}
                        onChange={() => setSelectedService(service.id)}
                      />
                      <label
                        htmlFor={`service-${service.id}`}
                        className="flex items-center justify-between p-4 bg-gradient-to-r from-white to-slate-50 border-2 border-slate-200 rounded-xl cursor-pointer peer-checked:border-blue-500 peer-checked:bg-gradient-to-r peer-checked:from-blue-50 peer-checked:to-indigo-50 peer-checked:shadow-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                      >
                        <div>
                          <div className="font-medium text-slate-900">{service.name}</div>
                          <div className="text-sm text-slate-500">{service.duration} min</div>
                        </div>
                        <div className="text-lg font-bold text-primary">{formatPrice(service.price)}</div>
                      </label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.serviceId && (
                  <p className="text-sm text-red-500">{form.formState.errors.serviceId.message}</p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={createBookingMutation.isPending}
                  className="w-full py-4 text-lg font-semibold"
                >
                  {createBookingMutation.isPending ? (
                    <>
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                      Booking...
                    </>
                  ) : (
                    <>
                      <CalendarCheck className="mr-2" />
                      Book Appointment
                    </>
                  )}
                </Button>
              </div>

              {/* WhatsApp Button */}
              <div className="pt-4 border-t border-slate-200">
                <div className="text-center mb-3">
                  <p className="text-sm text-slate-600">Need help or have questions?</p>
                </div>
                <Button
                  type="button"
                  onClick={openWhatsApp}
                  className="w-full py-4 text-lg font-semibold bg-green-500 hover:bg-green-600 text-white border-0"
                  variant="outline"
                >
                  <MessageCircle className="mr-2" />
                  Chat on WhatsApp
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Booking Summary */}
      <div className="space-y-6" data-tour="booking-summary">
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b border-indigo-100/50 rounded-t-lg">
            <CardTitle className="text-lg text-slate-900 flex items-center">
              <i className="fas fa-clipboard-list text-indigo-600 mr-2"></i>
              Booking Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-600">Barber:</span>
              <span className="font-medium text-slate-900">
                {selectedBarber ? barbers.find(b => b.id === selectedBarber)?.name : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Date:</span>
              <span className="font-medium text-slate-900">
                {selectedDate ? new Date(selectedDate).toLocaleDateString() : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Time:</span>
              <span className="font-medium text-slate-900">
                {selectedTime ? formatTime(selectedTime) : "Not selected"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Service:</span>
              <span className="font-medium text-slate-900">
                {selectedService ? services.find(s => s.id === selectedService)?.name : "Not selected"}
              </span>
            </div>
            <hr className="border-slate-200" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-slate-900">Total:</span>
              <span className="text-primary">
                {selectedService ? formatPrice(services.find(s => s.id === selectedService)?.price || 0) : "$0.00"}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Store Information */}
        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-green-100/50 rounded-t-lg">
            <CardTitle className="text-lg text-slate-900 flex items-center">
              <i className="fas fa-store text-emerald-600 mr-2"></i>
              Store Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <i className="fas fa-map-marker-alt text-slate-400 mt-1"></i>
              <div>
                <div className="font-medium text-slate-900">BarberShop Pro</div>
                <div className="text-slate-600">123 Main Street<br />Downtown, NY 10001</div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-phone text-slate-400"></i>
              <span className="text-slate-600">(555) 123-CUTS</span>
            </div>
            <div className="flex items-center space-x-3">
              <i className="fas fa-clock text-slate-400"></i>
              <div className="text-slate-600">
                <div>Mon-Fri: 9:00 AM - 8:00 PM</div>
                <div>Sat-Sun: 9:00 AM - 6:00 PM</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        bookingDetails={bookingDetails}
      />
    </div>
  );
}
