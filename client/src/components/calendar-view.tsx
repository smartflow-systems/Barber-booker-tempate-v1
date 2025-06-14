import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeSlotSelector } from "@/components/time-slot-selector";
import { useIsMobile } from "@/hooks/use-mobile";
import { ChevronLeft, ChevronRight, Calendar, Clock, User } from "lucide-react";
import type { Booking, Barber, Service } from "@shared/schema";

interface CalendarViewProps {
  onDateSelect?: (date: string) => void;
  selectedBarber?: number | null;
  onQuickBook?: (date: string, barberId?: number) => void;
}

export function CalendarView({ onDateSelect, selectedBarber, onQuickBook }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showTimeSelector, setShowTimeSelector] = useState(false);
  const [timeSelectorDate, setTimeSelectorDate] = useState<string>("");
  const isMobile = useIsMobile();

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

  // Get current month info
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  // Create calendar grid
  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const getDateString = (day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getBookingsForDate = (day: number) => {
    const dateString = getDateString(day);
    return bookings.filter(booking => 
      booking.date === dateString && 
      (!selectedBarber || booking.barberId === selectedBarber)
    );
  };

  const getBarberName = (barberId: number) => {
    const barber = barbers.find(b => b.id === barberId);
    return barber?.name || "Unknown";
  };

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || "Unknown";
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && 
           month === today.getMonth() && 
           year === today.getFullYear();
  };

  const isPastDate = (day: number) => {
    const today = new Date();
    const dateToCheck = new Date(year, month, day);
    return dateToCheck < new Date(today.getFullYear(), today.getMonth(), today.getDate());
  };

  const handleDateClick = (day: number) => {
    if (isPastDate(day)) return;
    
    const dateString = getDateString(day);
    const dayBookings = getBookingsForDate(day);
    
    // If there are bookings or limited available slots, show the detailed time selector
    if (dayBookings.length > 0 || getAvailableSlots(day).length <= 6) {
      setTimeSelectorDate(dateString);
      setShowTimeSelector(true);
    } else {
      setSelectedDate(dateString);
      onDateSelect?.(dateString);
    }
  };

  const getAvailableSlots = (day: number) => {
    const dayBookings = getBookingsForDate(day);
    const allSlots = [
      "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
      "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
      "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
    ];
    
    const bookedSlots = dayBookings.map(booking => booking.time);
    return allSlots.filter(slot => !bookedSlots.includes(slot));
  };

  const handleQuickBook = (date: string, time: string, barberId?: number) => {
    onQuickBook?.(date, barberId);
    // Scroll to booking form and auto-fill
    const bookingForm = document.querySelector('[data-booking-form]');
    if (bookingForm) {
      bookingForm.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(year, month + direction, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Card className="shadow-xl border-0 bg-card backdrop-blur-sm w-full max-w-full overflow-hidden">
      <CardHeader className="bg-muted border-b border-border rounded-t-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <CardTitle className="text-lg sm:text-xl text-card-foreground flex items-center">
            <Calendar className="text-primary mr-2 h-4 w-4 sm:h-5 sm:w-5" />
            <span className="truncate">Booking Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-1 sm:space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateMonth(-1)}
              className="hover:bg-accent text-card-foreground h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm sm:text-lg font-semibold text-card-foreground min-w-[120px] sm:min-w-[160px] text-center px-1">
              {monthNames[month]} {year}
            </span>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigateMonth(1)}
              className="hover:bg-accent text-card-foreground h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        {selectedBarber && (
          <p className="text-sm text-muted-foreground">
            Showing bookings for: {getBarberName(selectedBarber)}
          </p>
        )}
      </CardHeader>
      
      <CardContent className="p-2 sm:p-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="p-1 sm:p-2 text-center text-xs sm:text-sm font-medium text-card-foreground">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="p-2 h-24"></div>;
            }
            
            const dayBookings = getBookingsForDate(day);
            const dateString = getDateString(day);
            const isSelectedDate = selectedDate === dateString;
            const todayClass = isToday(day);
            const pastDate = isPastDate(day);
            
            return (
              <div
                key={day}
                onClick={() => handleDateClick(day)}
                className={`
                  p-1 sm:p-3 min-h-16 sm:min-h-32 border border-border rounded-lg cursor-pointer transition-all duration-200 overflow-hidden
                  ${isSelectedDate 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white border-blue-500 shadow-lg' 
                    : pastDate
                    ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                    : todayClass
                    ? 'bg-gradient-to-br from-green-200 to-emerald-200 border-green-400 hover:bg-gradient-to-br hover:from-green-300 hover:to-emerald-300 text-foreground'
                    : dayBookings.length > 0
                    ? 'bg-gradient-to-br from-orange-200 to-amber-200 border-orange-300 hover:bg-gradient-to-br hover:from-orange-300 hover:to-amber-300 text-foreground'
                    : 'bg-muted hover:bg-secondary hover:border-primary/50 text-card-foreground'
                  }
                `}
              >
                <div className={`text-sm font-semibold ${isSelectedDate ? 'text-white' : todayClass ? 'text-green-800' : 'text-card-foreground'}`}>
                  {day}
                </div>
                
                {/* Booking indicators - improved layout */}
                <div className="mt-1 sm:mt-2 space-y-1">
                  {dayBookings.slice(0, isMobile ? 1 : 2).map((booking, idx) => (
                    <div
                      key={booking.id}
                      className={`text-xs px-1 sm:px-2 py-1 rounded-md truncate ${
                        isSelectedDate 
                          ? 'bg-white/20 text-white' 
                          : 'bg-blue-600 text-white'
                      }`}
                      title={`${formatTime(booking.time)} - ${booking.customerName} (${getServiceName(booking.serviceId)})`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-xs">{formatTime(booking.time)}</span>
                        <User className="w-2 h-2 sm:w-3 sm:h-3" />
                      </div>
                    </div>
                  ))}
                  
                  {dayBookings.length > 2 && (
                    <div className={`text-xs px-2 py-1 rounded-md text-center font-medium ${
                      isSelectedDate 
                        ? 'bg-white/20 text-white' 
                        : 'bg-orange-600 text-white'
                    }`}>
                      +{dayBookings.length - 2} more bookings
                    </div>
                  )}
                  
                  {/* Available slots or quick book button */}
                  {!pastDate && (() => {
                    const availableSlots = getAvailableSlots(day);
                    const hasAvailableSlots = availableSlots.length > 0;
                    
                    if (hasAvailableSlots) {
                      const nextSlot = availableSlots[0];
                      return (
                        <Button
                          size="sm"
                          variant="outline"
                          className={`text-xs w-full h-8 px-2 py-1 font-medium ${
                            isSelectedDate 
                              ? 'bg-white/20 text-white border-white/30 hover:bg-white/30' 
                              : 'bg-green-600 text-white border-green-600 hover:bg-green-700 hover:border-green-700'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickBook(dateString, nextSlot, selectedBarber || undefined);
                          }}
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Book {formatTime(nextSlot)}
                        </Button>
                      );
                    } else if (dayBookings.length === 0) {
                      return (
                        <div className={`text-xs p-1 rounded text-center ${
                          isSelectedDate 
                            ? 'bg-white/20 text-white' 
                            : 'bg-green-100 text-green-600'
                        }`}>
                          Available
                        </div>
                      );
                    } else {
                      return (
                        <div className={`text-xs p-1 rounded text-center ${
                          isSelectedDate 
                            ? 'bg-white/20 text-white' 
                            : 'bg-red-100 text-red-600'
                        }`}>
                          Fully Booked
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-300 rounded"></div>
            <span className="text-slate-600">Today</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-100 rounded"></div>
            <span className="text-slate-600">Available</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded"></div>
            <span className="text-slate-600">Has Bookings</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded"></div>
            <span className="text-slate-600">Selected</span>
          </div>
        </div>
      </CardContent>

      {/* Time Slot Selector Modal */}
      <TimeSlotSelector
        isOpen={showTimeSelector}
        onClose={() => setShowTimeSelector(false)}
        selectedDate={timeSelectorDate}
        selectedBarber={selectedBarber}
        onTimeSelect={(time) => {
          setSelectedDate(timeSelectorDate);
          onDateSelect?.(timeSelectorDate);
        }}
        onQuickBook={(date, time, barberId) => {
          onQuickBook?.(date, barberId);
        }}
      />
    </Card>
  );
}