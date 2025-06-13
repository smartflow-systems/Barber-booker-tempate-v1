import { useState, useEffect } from "react";
import { BookingForm } from "@/components/booking-form";
import { AdminDashboard } from "@/components/admin-dashboard";
import { OnboardingTour } from "@/components/onboarding-tour";
import { LoyaltyProgram } from "@/components/loyalty-program";
import { NotificationSettings } from "@/components/notification-settings";
import { CancellationPolicy } from "@/components/cancellation-policy";
import { GoogleOAuthSetup } from "@/components/google-oauth-setup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { CalendarPlus, Settings, HelpCircle, Gift, Bell, Shield, Star, Calendar, Menu, X } from "lucide-react";

export default function Home() {
  const [activeView, setActiveView] = useState<"booking" | "admin" | "features" | "oauth">("booking");
  const [showTour, setShowTour] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();

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

  const handleNotificationSave = (settings: any) => {
    console.log('Notification settings saved:', settings);
    setShowNotifications(false);
  };

  const handlePolicyAccept = () => {
    console.log('Cancellation policy accepted');
    setShowPolicy(false);
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center shadow-lg">
                <i className="fas fa-cut text-white text-sm sm:text-xl"></i>
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent">BarberShop Pro</h1>
                <p className="text-xs sm:text-sm text-slate-600 font-medium hidden sm:block">Professional Booking System</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Button
                variant={activeView === "booking" ? "default" : "ghost"}
                onClick={() => setActiveView("booking")}
                className="flex items-center space-x-2"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Book Appointment</span>
              </Button>
              <Button
                variant={activeView === "features" ? "default" : "ghost"}
                onClick={() => setActiveView("features")}
                className="flex items-center space-x-2"
              >
                <Star className="w-4 h-4" />
                <span>Features</span>
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
                variant={activeView === "oauth" ? "default" : "ghost"}
                onClick={() => setActiveView("oauth")}
                className="flex items-center space-x-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar Setup</span>
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

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-200">
              <nav className="flex flex-col space-y-2">
                <Button
                  variant={activeView === "booking" ? "default" : "ghost"}
                  onClick={() => {
                    setActiveView("booking");
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <CalendarPlus className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
                <Button
                  variant={activeView === "features" ? "default" : "ghost"}
                  onClick={() => {
                    setActiveView("features");
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <Star className="w-4 h-4 mr-2" />
                  Features
                </Button>
                <Button
                  variant={activeView === "admin" ? "default" : "ghost"}
                  onClick={() => {
                    setActiveView("admin");
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
                <Button
                  variant={activeView === "oauth" ? "default" : "ghost"}
                  onClick={() => {
                    setActiveView("oauth");
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Calendar Setup
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    startTour();
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  Help
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeView === "booking" && <BookingForm />}
        {activeView === "admin" && <AdminDashboard />}
        {activeView === "oauth" && <GoogleOAuthSetup />}
        {activeView === "features" && (
          <div className="space-y-8">
            {/* Features Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
                Enhanced Booking Features
              </h2>
              <p className="text-xl text-slate-600 max-w-3xl mx-auto">
                Discover our comprehensive booking system with advanced features designed to improve customer experience and reduce no-shows.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
                    onClick={() => setShowLoyalty(true)}>
                <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Gift className="mr-2" />
                    Loyalty Program
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-300 mb-4">
                    Reward returning customers with points, free services, and exclusive member benefits.
                  </p>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• Points for every visit</li>
                    <li>• Tier-based rewards</li>
                    <li>• Referral bonuses</li>
                    <li>• Exclusive promotions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
                    onClick={() => setShowNotifications(true)}>
                <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Bell className="mr-2" />
                    Smart Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-300 mb-4">
                    Automated SMS and email reminders to reduce no-shows by up to 90%.
                  </p>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• 24-hour reminders</li>
                    <li>• Confirmation messages</li>
                    <li>• Customizable timing</li>
                    <li>• Two-way communication</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm hover:transform hover:scale-105 transition-all duration-200 cursor-pointer"
                    onClick={() => setShowPolicy(true)}>
                <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2" />
                    Cancellation Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-slate-300 mb-4">
                    Clear policies with security deposits to protect against no-shows and last-minute cancellations.
                  </p>
                  <ul className="text-sm text-slate-400 space-y-1">
                    <li>• 24-hour notice required</li>
                    <li>• Security deposit system</li>
                    <li>• Clear penalty structure</li>
                    <li>• Easy rescheduling</li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            {/* Feature Demonstrations */}
            {showLoyalty && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-white">Loyalty Program Demo</h3>
                  <Button onClick={() => setShowLoyalty(false)} variant="outline" className="bg-slate-700 border-slate-600 text-white">
                    Close Demo
                  </Button>
                </div>
                <LoyaltyProgram totalVisits={15} loyaltyPoints={250} />
              </div>
            )}

            {showNotifications && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-white">Notification Settings Demo</h3>
                  <Button onClick={() => setShowNotifications(false)} variant="outline" className="bg-slate-700 border-slate-600 text-white">
                    Close Demo
                  </Button>
                </div>
                <NotificationSettings onSave={handleNotificationSave} />
              </div>
            )}

            {showPolicy && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-white">Cancellation Policy Demo</h3>
                  <Button onClick={() => setShowPolicy(false)} variant="outline" className="bg-slate-700 border-slate-600 text-white">
                    Close Demo
                  </Button>
                </div>
                <CancellationPolicy onAccept={handlePolicyAccept} showDeposit={true} depositAmount={1000} />
              </div>
            )}

            {/* Benefits Summary */}
            <Card className="shadow-xl border-0 bg-gradient-to-r from-slate-800 to-slate-700 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-white text-center">System Benefits</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-green-400">90%</div>
                    <div className="text-slate-300">Reduction in no-shows</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-blue-400">50%</div>
                    <div className="text-slate-300">Increase in rebookings</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-purple-400">35%</div>
                    <div className="text-slate-300">Higher customer retention</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-yellow-400">25%</div>
                    <div className="text-slate-300">Revenue increase</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Onboarding Tour */}
      <OnboardingTour isVisible={showTour} onComplete={handleTourComplete} />
    </div>
  );
}
