import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Phone, Star, MapPin, Mail } from "lucide-react";
import type { Booking, Barber, Service } from "@shared/schema";

interface BookingConfirmationProps {
  booking: Booking;
  barber: Barber;
  service: Service;
  onNewBooking: () => void;
  onAddToCalendar: () => void;
}

export function BookingConfirmation({ 
  booking, 
  barber, 
  service, 
  onNewBooking, 
  onAddToCalendar 
}: BookingConfirmationProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
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

  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  return (
    <div className="space-y-6">
      {/* Success Header */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-green-500 to-emerald-600">
        <CardContent className="p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Booking Confirmed!</h2>
          <p className="text-green-100 text-lg">Your appointment has been successfully scheduled</p>
        </CardContent>
      </Card>

      {/* Booking Details */}
      <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600/50 rounded-t-lg">
          <CardTitle className="text-xl text-white">Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="flex items-center text-slate-300 mb-2">
                <Calendar className="w-5 h-5 mr-2 text-blue-400" />
                <span className="font-medium">Date</span>
              </div>
              <p className="text-xl text-white font-semibold">{formatDate(booking.date)}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center text-slate-300 mb-2">
                <Clock className="w-5 h-5 mr-2 text-blue-400" />
                <span className="font-medium">Time</span>
              </div>
              <p className="text-xl text-white font-semibold">{formatTime(booking.time)}</p>
            </div>
          </div>

          {/* Barber Info */}
          <div className="space-y-3">
            <div className="flex items-center text-slate-300 mb-2">
              <User className="w-5 h-5 mr-2 text-blue-400" />
              <span className="font-medium">Your Barber</span>
            </div>
            <div className="flex items-center space-x-4 p-4 bg-slate-700/50 rounded-lg">
              <img
                src={barber.avatar}
                alt={barber.name}
                className="w-12 h-12 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&size=48&background=3b82f6&color=ffffff`;
                }}
              />
              <div>
                <p className="text-white font-semibold">{barber.name}</p>
                <p className="text-slate-300 text-sm">{barber.title}</p>
                <div className="flex items-center mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 mr-1" />
                  <span className="text-sm text-slate-300">{barber.rating}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Service Info */}
          <div className="space-y-3">
            <div className="flex items-center text-slate-300 mb-2">
              <Star className="w-5 h-5 mr-2 text-blue-400" />
              <span className="font-medium">Service</span>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white font-semibold">{service.name}</p>
                  <p className="text-slate-300 text-sm">{service.duration} minutes</p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {formatPrice(service.price)}
                </Badge>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="space-y-3">
            <div className="flex items-center text-slate-300 mb-2">
              <Phone className="w-5 h-5 mr-2 text-blue-400" />
              <span className="font-medium">Contact Information</span>
            </div>
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <p className="text-white font-semibold">{booking.customerName}</p>
              <p className="text-slate-300 text-sm">{booking.customerPhone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Important Information</h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <p className="text-slate-300">Please arrive 5 minutes early for your appointment</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <p className="text-slate-300">To cancel or reschedule, please give us 24 hours notice</p>
            </div>
            <div className="flex items-start space-x-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
              <p className="text-slate-300">You will receive a reminder 24 hours before your appointment</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={onAddToCalendar}
          variant="outline"
          className="flex-1 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
        >
          <Calendar className="w-4 h-4 mr-2" />
          Add to Calendar
        </Button>
        <Button 
          onClick={onNewBooking}
          className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          Book Another Appointment
        </Button>
      </div>
    </div>
  );
}