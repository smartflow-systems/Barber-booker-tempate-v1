import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";

interface SimpleTimeSelectorProps {
  selectedDate: string;
  onTimeSelect: (time: string) => void;
  selectedTime?: string;
}

export function SimpleTimeSelector({ selectedDate, onTimeSelect, selectedTime }: SimpleTimeSelectorProps) {
  const timeSlots = [
    "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
    "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
    "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
  ];

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="bg-white border-slate-200">
      <CardHeader>
        <CardTitle className="text-lg text-slate-800 flex items-center">
          <Clock className="text-teal-600 mr-2 w-5 h-5" />
          Select Time for {formatDate(selectedDate)}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {timeSlots.map((time) => (
            <Button
              key={time}
              variant={selectedTime === time ? "default" : "outline"}
              className={`h-12 text-sm transition-all duration-200 ${
                selectedTime === time
                  ? "bg-teal-600 hover:bg-teal-700 text-white border-teal-500"
                  : "border-slate-300 hover:border-teal-500 hover:bg-teal-50"
              }`}
              onClick={() => onTimeSelect(time)}
            >
              {formatTime(time)}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}