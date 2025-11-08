import { useState, useEffect } from "react";
import { BookingForm } from "@/components/booking-form";
import { AdminDashboard } from "@/components/admin-dashboard";
import { OnboardingTour } from "@/components/onboarding-tour";
import { LoyaltyProgram } from "@/components/loyalty-program";
import { NotificationSettings } from "@/components/notification-settings";
import { CancellationPolicy } from "@/components/cancellation-policy";
import { GoogleOAuthSetup } from "@/components/google-oauth-setup";
import { BookingAssistant } from "@/components/booking-assistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTimeBackground } from "@/hooks/use-time-background";
import { CalendarPlus, Settings, HelpCircle, Gift, Bell, Shield, Star, Calendar, Menu, X, Sunrise, Sun, Sunset, Moon, Layout } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const [activeView, setActiveView] = useState<"booking" | "admin" | "features" | "oauth">("booking");
  const [aiMessage, setAiMessage] = useState<string>("");
  const [showTour, setShowTour] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [showLoyalty, setShowLoyalty] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  const {
    backgroundClassName,
    textColor,
    overlayOpacity,
    greeting,
    businessHours,
    timeOfDay,
    currentTime,
    getBackgroundClasses
  } = useTimeBackground();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('barbershop-tour-completed');
    if (!hasSeenTour) {
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

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'dawn': return <Sunrise className="w-5 h-5" />;
      case 'morning': return <Sun className="w-5 h-5" />;
      case 'midday': return <Sun className="w-5 h-5" />;
      case 'afternoon': return <Sun className="w-5 h-5" />;
      case 'evening': return <Sunset className="w-5 h-5" />;
      case 'night': return <Moon className="w-5 h-5" />;
      case 'late-night': return <Moon className="w-5 h-5" />;
      default: return <Sun className="w-5 h-5" />;
    }
  };

  return (
    <div className={`min-h-screen ${getBackgroundClasses()}`}>
      <div className={`absolute inset-0 ${overlayOpacity} transition-all duration-1000 pointer-events-none`}></div>

      {/* Header with SFS Glassmorphism */}
      <header className="panel-overlay shadow-lg border-b border-gold-800/50 relative overflow-hidden transition-all duration-500 z-20">
        <div className="absolute top-0 left-0 w-full h-full opacity-5">
          <div className="absolute top-2 left-20 text-4xl">⚡</div>
          <div className="absolute top-3 right-32 text-3xl">🎯</div>
          <div className="absolute bottom-2 left-1/3 text-2xl">✨</div>
          <div className="absolute top-1 right-1/4 text-3xl">🚀</div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-gold-700 via-gold-600 to-gold-800 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden border border-gold-500/20">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 text-black-900" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v8m-4-4h8" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-gold-400 to-gold-500 rounded-full animate-pulse"></div>
              </div>
              <div className="ml-4 sm:ml-6">
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-3xl font-bold text-gold-shine">
                    SmartFlow Booking
                  </h1>
                  <div className="flex items-center gap-2 px-3 py-1 glass-card rounded-full shadow-sm">
                    {getTimeIcon()}
                    <span className="text-sm font-medium text-gold-100">
                      {greeting}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <p className="text-sm sm:text-base text-gold-300 font-medium hidden sm:block">
                    Professional Booking Management Platform
                  </p>
                  <div className={`flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium ${
                    businessHours.isOpen
                      ? 'bg-gold-700/20 text-gold-100 border border-gold-600/50'
                      : 'bg-red-900/20 text-red-300 border border-red-600/50'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${
                      businessHours.isOpen ? 'bg-gold-500 animate-pulse' : 'bg-red-500'
                    }`}></div>
                    {businessHours.message}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              <Button
                variant={activeView === "booking" ? "default" : "ghost"}
                onClick={() => setActiveView("booking")}
                className={`btn-gold flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeView !== "booking" && "bg-transparent border border-gold-700 hover:bg-gold-700/10 text-gold-100"
                }`}
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Book Appointment</span>
              </Button>
              <Link href="/dashboard">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 border border-gold-700 hover:bg-gold-700/10 text-gold-100"
                >
                  <Layout className="w-4 h-4" />
                  <span>Dashboard</span>
                </Button>
              </Link>
              <Button
                variant={activeView === "features" ? "default" : "ghost"}
                onClick={() => setActiveView("features")}
                className={`btn-gold flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeView !== "features" && "bg-transparent border border-gold-700 hover:bg-gold-700/10 text-gold-100"
                }`}
              >
                <Star className="w-4 h-4" />
                <span>Features</span>
              </Button>
              <Button
                variant={activeView === "admin" ? "default" : "ghost"}
                onClick={() => setActiveView("admin")}
                className={`btn-gold flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeView !== "admin" && "bg-transparent border border-gold-700 hover:bg-gold-700/10 text-gold-100"
                }`}
                data-tour="admin-button"
              >
                <Settings className="w-4 h-4" />
                <span>Admin Panel</span>
              </Button>
              <Button
                variant={activeView === "oauth" ? "default" : "ghost"}
                onClick={() => setActiveView("oauth")}
                className={`btn-gold flex items-center space-x-2 px-6 py-3 rounded-lg transition-all duration-300 ${
                  activeView !== "oauth" && "bg-transparent border border-gold-700 hover:bg-gold-700/10 text-gold-100"
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Calendar Setup</span>
              </Button>
              <Button
                variant="ghost"
                onClick={startTour}
                className="flex items-center space-x-2 px-6 py-3 rounded-lg border border-gold-800 text-gold-300 hover:text-gold-100 hover:bg-gold-800/20 transition-all duration-300"
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
              className="lg:hidden text-gold-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-6 border-t border-gold-800/50 panel-dark">
              <nav className="flex flex-col space-y-3">
                <Button
                  variant={activeView === "booking" ? "default" : "ghost"}
                  onClick={() => {
                    setActiveView("booking");
                    setMobileMenuOpen(false);
                  }}
                  className={`justify-start px-4 py-3 transition-all duration-300 ${
                    activeView === "booking"
                      ? "btn-gold"
                      : "border border-gold-700 hover:bg-gold-700/10 text-gold-100"
                  }`}
                >
                  <CalendarPlus className="w-4 h-4 mr-3" />
                  Book Appointment
                </Button>
                <Link href="/dashboard">
                  <Button
                    variant="ghost"
                    onClick={() => setMobileMenuOpen(false)}
                    className="justify-start px-4 py-3 w-full border border-gold-700 hover:bg-gold-700/10 text-gold-100 transition-all duration-300"
                  >
                    <Layout className="w-4 h-4 mr-3" />
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant={activeView === "features" ? "default" : "ghost"}
                  onClick={() => {
                    setActiveView("features");
                    setMobileMenuOpen(false);
                  }}
                  className={`justify-start px-4 py-3 transition-all duration-300 ${
                    activeView === "features"
                      ? "btn-gold"
                      : "border border-gold-700 hover:bg-gold-700/10 text-gold-100"
                  }`}
                >
                  <Star className="w-4 h-4 mr-3" />
                  Features
                </Button>
                <Button
                  variant={activeView === "admin" ? "default" : "ghost"}
                  onClick={() => {
                    setActiveView("admin");
                    setMobileMenuOpen(false);
                  }}
                  className={`justify-start px-4 py-3 transition-all duration-300 ${
                    activeView === "admin"
                      ? "btn-gold"
                      : "border border-gold-700 hover:bg-gold-700/10 text-gold-100"
                  }`}
                >
                  <Settings className="w-4 h-4 mr-3" />
                  Admin Panel
                </Button>
                <Button
                  variant={activeView === "oauth" ? "default" : "ghost"}
                  onClick={() => {
                    setActiveView("oauth");
                    setMobileMenuOpen(false);
                  }}
                  className={`justify-start px-4 py-3 transition-all duration-300 ${
                    activeView === "oauth"
                      ? "btn-gold"
                      : "border border-gold-700 hover:bg-gold-700/10 text-gold-100"
                  }`}
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  Calendar Setup
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    startTour();
                    setMobileMenuOpen(false);
                  }}
                  className="justify-start px-4 py-3 border border-gold-800 hover:bg-gold-800/20 text-gold-100 transition-all duration-300"
                >
                  <HelpCircle className="w-4 h-4 mr-3" />
                  Help
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <div className={`absolute inset-0 pointer-events-none transition-opacity duration-1000 ${
          timeOfDay === 'night' || timeOfDay === 'late-night' ? 'opacity-3' : 'opacity-8'
        }`}>
          <div className="absolute top-10 left-10 text-6xl animate-bounce opacity-10">⚡</div>
          <div className="absolute top-20 right-20 text-4xl animate-pulse opacity-10">✨</div>
          <div className="absolute bottom-20 left-1/4 text-5xl animate-bounce delay-1000 opacity-10">🎯</div>
          <div className="absolute top-1/3 right-1/3 text-3xl animate-pulse delay-500 opacity-10">🚀</div>
          <div className="absolute bottom-10 right-10 text-4xl animate-bounce delay-700 opacity-10">💫</div>
        </div>

        {/* Dynamic time indicator */}
        <div className="fixed top-20 right-4 z-40 glass-card rounded-lg px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            {getTimeIcon()}
            <span className="font-medium text-gold-100">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="text-xs text-gold-300 capitalize">{timeOfDay}</span>
          </div>
        </div>

        {activeView === "booking" && (
          <div className="relative z-10">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gold-shine mb-2 flex items-center justify-center">
                <span className="mr-3">✨</span>
                Book Your Appointment
                <span className="ml-3">🎯</span>
              </h2>
              <p className="text-gold-300 flex items-center justify-center">
                <span className="mr-2">⚡</span>
                Experience professional booking at its finest
                <span className="ml-2">🚀</span>
              </p>
            </div>
            <BookingForm onBookingComplete={result => {
              if (result.aiMessage) setAiMessage(result.aiMessage);
            }} />
            {aiMessage && (
              <div className="mt-6 p-6 glass-card rounded-lg border border-gold-700 relative overflow-hidden">
                <div className="absolute top-2 right-2 text-2xl opacity-20">✨</div>
                <div className="absolute bottom-2 left-2 text-xl opacity-20">🎯</div>
                <h3 className="font-semibold mb-3 text-gold-500 flex items-center">
                  <span className="mr-2">📝</span>
                  Your Personalized Confirmation
                </h3>
                <p className="text-gold-100 leading-relaxed">{aiMessage}</p>
              </div>
            )}
          </div>
        )}
        {activeView === "admin" && <AdminDashboard />}
        {activeView === "oauth" && <GoogleOAuthSetup />}
        {activeView === "features" && (
          <div className="space-y-8">
            {/* Features Header */}
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-gold-shine mb-4">
                Enhanced Booking Features
              </h2>
              <p className="text-xl text-gold-300 max-w-3xl mx-auto">
                Discover our comprehensive booking system with advanced features designed to improve customer experience and reduce no-shows.
              </p>
            </div>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card className="glass-card border border-gold-700 hover:transform hover:scale-105 transition-all duration-200 cursor-pointer shadow-xl"
                    onClick={() => setShowLoyalty(true)}>
                <CardHeader className="bg-gradient-to-r from-gold-800 to-gold-700 text-black-900 rounded-t-lg">
                  <CardTitle className="flex items-center font-bold">
                    <Gift className="mr-2" />
                    Loyalty Program
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gold-100 mb-4">
                    Reward returning customers with points, free services, and exclusive member benefits.
                  </p>
                  <ul className="text-sm text-gold-300 space-y-1">
                    <li>• Points for every visit</li>
                    <li>• Tier-based rewards</li>
                    <li>• Referral bonuses</li>
                    <li>• Exclusive promotions</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card border border-gold-700 hover:transform hover:scale-105 transition-all duration-200 cursor-pointer shadow-xl"
                    onClick={() => setShowNotifications(true)}>
                <CardHeader className="bg-gradient-to-r from-gold-700 to-gold-600 text-black-900 rounded-t-lg">
                  <CardTitle className="flex items-center font-bold">
                    <Bell className="mr-2" />
                    Smart Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gold-100 mb-4">
                    Automated SMS and email reminders to reduce no-shows by up to 90%.
                  </p>
                  <ul className="text-sm text-gold-300 space-y-1">
                    <li>• 24-hour reminders</li>
                    <li>• Confirmation messages</li>
                    <li>• Customizable timing</li>
                    <li>• Two-way communication</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="glass-card border border-gold-700 hover:transform hover:scale-105 transition-all duration-200 cursor-pointer shadow-xl"
                    onClick={() => setShowPolicy(true)}>
                <CardHeader className="bg-gradient-to-r from-gold-600 to-gold-500 text-black-900 rounded-t-lg">
                  <CardTitle className="flex items-center font-bold">
                    <Shield className="mr-2" />
                    Cancellation Policy
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-gold-100 mb-4">
                    Clear policies with security deposits to protect against no-shows and last-minute cancellations.
                  </p>
                  <ul className="text-sm text-gold-300 space-y-1">
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
                  <h3 className="text-2xl font-bold text-gold-100">Loyalty Program Demo</h3>
                  <Button onClick={() => setShowLoyalty(false)} variant="outline" className="glass-card border-gold-700 text-gold-100">
                    Close Demo
                  </Button>
                </div>
                <LoyaltyProgram totalVisits={15} loyaltyPoints={250} />
              </div>
            )}

            {showNotifications && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gold-100">Notification Settings Demo</h3>
                  <Button onClick={() => setShowNotifications(false)} variant="outline" className="glass-card border-gold-700 text-gold-100">
                    Close Demo
                  </Button>
                </div>
                <NotificationSettings onSave={handleNotificationSave} />
              </div>
            )}

            {showPolicy && (
              <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gold-100">Cancellation Policy Demo</h3>
                  <Button onClick={() => setShowPolicy(false)} variant="outline" className="glass-card border-gold-700 text-gold-100">
                    Close Demo
                  </Button>
                </div>
                <CancellationPolicy onAccept={handlePolicyAccept} showDeposit={true} depositAmount={1000} />
              </div>
            )}

            {/* Benefits Summary */}
            <Card className="glass-card border border-gold-700 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-gold-100 text-center">System Benefits</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gold-500">90%</div>
                    <div className="text-gold-300">Reduction in no-shows</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gold-500">50%</div>
                    <div className="text-gold-300">Increase in rebookings</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gold-500">35%</div>
                    <div className="text-gold-300">Higher customer retention</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gold-500">25%</div>
                    <div className="text-gold-300">Revenue increase</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {/* Onboarding Tour */}
      <OnboardingTour isVisible={showTour} onComplete={handleTourComplete} />

      {/* Booking Assistant Chat */}
      <BookingAssistant />
    </div>
  );
}
