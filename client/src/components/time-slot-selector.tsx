import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Clock, User, Calendar, X } from "lucide-react";
import type { Booking, Barber, Service } from "@shared/schema";

interface TimeSlotSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  selectedBarber?: number | null;
  onTimeSelect: (time: string) => void;
  onQuickBook?: (date: string, time: string, barberId?: number) => void;
}

export function TimeSlotSelector({ 
  isOpen, 
  onClose, 
  selectedDate, 
  selectedBarber, 
  onTimeSelect,
  onQuickBook 
}: TimeSlotSelectorProps) {
  const [selectedTime, setSelectedTime] = useState<string>("");

  // Fetch bookings
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: api.getBookings,
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getBarberName = (barberId: number) => {
    const barber = barbers.find(b => b.id === barberId);
    return barber?.name || 'Unknown';
  };

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || 'Unknown';
  };

  // Get bookings for the selected date
  const dayBookings = bookings.filter(booking => booking.date === selectedDate);
  const bookedSlots = dayBookings.map(booking => booking.time);

  // All available time slots
  const allSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    onTimeSelect(time);
  };

  const handleQuickBook = (time: string) => {
    onQuickBook?.(selectedDate, time, selectedBarber || undefined);
    onClose();
  };

  const getBarberForBooking = (booking: Booking) => {
    return barbers.find(b => b.id === booking.barberId);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-800/95 via-slate-700/90 to-slate-800/95 border-slate-700 transition-all duration-500">
        <DialogHeader>
          <DialogTitle className="text-xl text-white flex items-center">
            <Calendar className="text-blue-400 mr-2" />
            {formatDate(selectedDate)}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
          {/* Existing Bookings */}
          <Card className="bg-gradient-to-br from-slate-700/50 via-slate-600/40 to-slate-700/50 border-slate-600 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center">
                <User className="text-orange-400 mr-2" />
                Existing Bookings ({dayBookings.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dayBookings.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No bookings for this date</p>
              ) : (
                dayBookings
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map((booking) => {
                    const barber = getBarberForBooking(booking);
                    return (
                      <div
                        key={booking.id}
                        className="p-4 bg-slate-600/50 rounded-lg border border-slate-500"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-white font-semibold text-lg">
                              {formatTime(booking.time)}
                            </span>
                          </div>
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Customer:</span>
                            <span className="text-white font-medium">{booking.customerName}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Barber:</span>
                            <span className="text-white">{getBarberName(booking.barberId)}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-300">Service:</span>
                            <span className="text-white">{getServiceName(booking.serviceId)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
              )}
            </CardContent>
          </Card>

          {/* Available Time Slots */}
          <Card className="bg-gradient-to-br from-slate-700/50 via-slate-600/40 to-slate-700/50 border-slate-600 transition-all duration-300 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="text-lg text-white flex items-center">
                <Clock className="text-green-400 mr-2" />
                Available Times ({availableSlots.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {availableSlots.length === 0 ? (
                <p className="text-slate-400 text-center py-4">No available slots for this date</p>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {availableSlots.map((time) => (
                    <div key={time} className="space-y-2">
                      <Button
                        variant={selectedTime === time ? "default" : "outline"}
                        className={`w-full h-12 text-sm font-medium ${
                          selectedTime === time
                            ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                            : "bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                        }`}
                        onClick={() => handleTimeSelect(time)}
                      >
                        <Clock className="w-4 h-4 mr-2" />
                        {formatTime(time)}
                      </Button>
                      
                      {/* Quick Book Button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full bg-green-600 hover:bg-green-700 text-white border-green-500"
                        onClick={() => handleQuickBook(time)}
                      >
                        Quick Book
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-slate-600">
          <div className="text-slate-400 text-sm">
            {selectedTime && `Selected: ${formatTime(selectedTime)}`}
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
              className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </Button>
            {selectedTime && (
              <Button
                onClick={() => {
                  onTimeSelect(selectedTime);
                  onClose();
                }}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Select {formatTime(selectedTime)}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}