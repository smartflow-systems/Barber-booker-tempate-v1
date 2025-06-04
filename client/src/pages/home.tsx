import { useState, useEffect } from "react";
import { BookingForm } from "@/components/booking-form";
import { AdminDashboard } from "@/components/admin-dashboard";
import { OnboardingTour } from "@/components/onboarding-tour";
import { Button } from "@/components/ui/button";
import { CalendarPlus, Settings, HelpCircle } from "lucide-react";

export default function Home() {
  const [activeView, setActiveView] = useState<"booking" | "admin">("booking");
  const [showTour, setShowTour] = useState(false);

  useEffect(() => {
    // Check if user has seen the tour before
    const hasSeenTour = localStorage.getItem('barbershop-tour-completed');
    if (!hasSeenTour) {
      // Show tour after a brief delay for better UX
      const timer = setTimeout(() => {
        setShowTour(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleTourComplete = () => {
    localStorage.setItem('barbershop-tour-completed', 'true');
    setShowTour(false);
  };

  const startTour = () => {
    setShowTour(true);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <i className="fas fa-cut text-white text-lg"></i>
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">BarberShop Pro</h1>
                <p className="text-sm text-slate-500">Professional Booking System</p>
              </div>
            </div>
            <nav className="flex items-center space-x-6">
              <Button
                variant={activeView === "booking" ? "default" : "ghost"}
                onClick={() => setActiveView("booking")}
                className="flex items-center space-x-2"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Book Appointment</span>
              </Button>
              <Button
                variant={activeView === "admin" ? "default" : "ghost"}
                onClick={() => setActiveView("admin")}
                className="flex items-center space-x-2"
                data-tour="admin-button"
              >
                <Settings className="w-4 h-4" />
                <span>Admin Panel</span>
              </Button>
              <Button
                variant="ghost"
                onClick={startTour}
                className="flex items-center space-x-2 text-slate-600 hover:text-slate-900"
                title="Take a quick tour"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Help</span>
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "booking" ? <BookingForm /> : <AdminDashboard />}
      </main>

      {/* Onboarding Tour */}
      <OnboardingTour isVisible={showTour} onComplete={handleTourComplete} />
    </div>
  );
}
