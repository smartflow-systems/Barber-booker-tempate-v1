import { useState, useEffect } from "react";

export type TimeOfDay = 'dawn' | 'morning' | 'midday' | 'afternoon' | 'evening' | 'night' | 'late-night';

interface TimeConfig {
  period: TimeOfDay;
  className: string;
  textColor: string;
  overlayOpacity: string;
}

const TIME_PERIODS: TimeConfig[] = [
  { period: 'late-night', className: 'late-night-bg', textColor: 'text-white', overlayOpacity: 'bg-black/20' }, // 0-5
  { period: 'dawn', className: 'dawn-bg', textColor: 'text-slate-800', overlayOpacity: 'bg-white/10' }, // 5-7
  { period: 'morning', className: 'morning-bg', textColor: 'text-slate-800', overlayOpacity: 'bg-white/10' }, // 7-11
  { period: 'midday', className: 'midday-bg', textColor: 'text-white', overlayOpacity: 'bg-black/10' }, // 11-14
  { period: 'afternoon', className: 'afternoon-bg', textColor: 'text-slate-800', overlayOpacity: 'bg-white/10' }, // 14-17
  { period: 'evening', className: 'evening-bg', textColor: 'text-white', overlayOpacity: 'bg-black/10' }, // 17-20
  { period: 'night', className: 'night-bg', textColor: 'text-white', overlayOpacity: 'bg-black/20' }, // 20-24
];

export function useTimeBackground() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeConfig, setTimeConfig] = useState<TimeConfig>(TIME_PERIODS[0]);

  const getTimeOfDay = (date: Date): TimeConfig => {
    const hour = date.getHours();
    
    if (hour >= 0 && hour < 5) return TIME_PERIODS[0]; // late-night
    if (hour >= 5 && hour < 7) return TIME_PERIODS[1]; // dawn
    if (hour >= 7 && hour < 11) return TIME_PERIODS[2]; // morning
    if (hour >= 11 && hour < 14) return TIME_PERIODS[3]; // midday
    if (hour >= 14 && hour < 17) return TIME_PERIODS[4]; // afternoon
    if (hour >= 17 && hour < 20) return TIME_PERIODS[5]; // evening
    return TIME_PERIODS[6]; // night (20-24)
  };

  const getTimeGreeting = (period: TimeOfDay): string => {
    switch (period) {
      case 'dawn':
        return 'Good Dawn';
      case 'morning':
        return 'Good Morning';
      case 'midday':
        return 'Good Day';
      case 'afternoon':
        return 'Good Afternoon';
      case 'evening':
        return 'Good Evening';
      case 'night':
        return 'Good Night';
      case 'late-night':
        return 'Good Late Night';
      default:
        return 'Welcome';
    }
  };

  const getBusinessHoursStatus = (date: Date): { isOpen: boolean; message: string } => {
    const hour = date.getHours();
    const day = date.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Barbershop hours: Monday-Saturday 8AM-8PM, Sunday 10AM-6PM
    if (day === 0) { // Sunday
      if (hour >= 10 && hour < 18) {
        return { isOpen: true, message: 'Open Today (Sunday Hours)' };
      }
      return { isOpen: false, message: 'Closed (Opens 10 AM Sunday)' };
    } else if (day >= 1 && day <= 6) { // Monday-Saturday
      if (hour >= 8 && hour < 20) {
        return { isOpen: true, message: 'Open Today' };
      }
      return { isOpen: false, message: 'Closed (Opens 8 AM)' };
    }
    
    return { isOpen: false, message: 'Closed' };
  };

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now);
      setTimeConfig(getTimeOfDay(now));
    };

    // Update immediately
    updateTime();

    // Update every minute
    const interval = setInterval(updateTime, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    currentTime,
    timeOfDay: timeConfig.period,
    backgroundClassName: timeConfig.className,
    textColor: timeConfig.textColor,
    overlayOpacity: timeConfig.overlayOpacity,
    greeting: getTimeGreeting(timeConfig.period),
    businessHours: getBusinessHoursStatus(currentTime),
    timeConfig,
    // Helper function to get background class with transition
    getBackgroundClasses: () => `time-background ${timeConfig.className}`,
  };
}