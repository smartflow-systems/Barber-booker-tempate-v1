import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, DollarSign, Users, Clock, Edit, Trash2, Search, Mail, BarChart3, CreditCard, Package, UserCheck, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { EmailSetup } from "./email-setup";
import { AnalyticsDashboard } from "./analytics-dashboard";
import { CustomerProfile } from "./customer-profile";
import { PaymentProcessing } from "./payment-processing";
import { CustomerManagement } from "./customer-management";
import { StripePayment } from "./stripe-payment";
import { BusinessAnalytics } from "./business-analytics";
import { MarketingTools } from "./marketing-tools";
import { StaffManagement } from "./staff-management";
import { InventoryManagement } from "./inventory-management";
import type { Booking, Barber, Service, Client } from "@shared/schema";

export function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: bookings = [], isLoading } = useQuery({
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

  // Update booking mutation
  const updateBookingMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      api.updateBooking(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking updated",
        description: "Booking status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Update failed",
        description: "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });

  // Delete booking mutation
  const deleteBookingMutation = useMutation({
    mutationFn: api.deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Booking deleted",
        description: "Booking has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Delete failed",
        description: "Failed to delete booking.",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const getBarberName = (barberId: number) => {
    const barber = barbers.find(b => b.id === barberId);
    return barber?.name || "Unknown";
  };

  const getServiceInfo = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return {
      name: service?.name || "Unknown",
      price: service?.price || 0,
    };
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone.includes(searchTerm) ||
      getBarberName(booking.barberId).toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate stats
  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(b => b.date === today);
  const thisWeekStart = new Date();
  thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
  const thisWeekBookings = bookings.filter(b => {
    const bookingDate = new Date(b.date);
    return bookingDate >= thisWeekStart;
  });
  const todayRevenue = todayBookings.reduce((total, booking) => {
    const service = getServiceInfo(booking.serviceId);
    return total + service.price;
  }, 0);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-100 text-green-800">Confirmed</Badge>;
      case "completed":
        return <Badge className="bg-gray-100 text-gray-800">Completed</Badge>;
      case "cancelled":
        return <Badge className="bg-red-100 text-red-800">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-800 to-indigo-700 bg-clip-text text-transparent flex items-center">
                <i className="fas fa-tachometer-alt text-blue-600 mr-3"></i>
                Admin Dashboard
              </h2>
              <p className="text-slate-700 mt-2 font-medium">Manage bookings and monitor daily operations</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-slate-500">Today's Date</div>
                <div className="text-lg font-semibold text-slate-900">
                  {new Date().toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Today's Bookings</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{todayBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Today's Revenue</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">{formatPrice(todayRevenue)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">This Week</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">{thisWeekBookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-300">Total Bookings</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">{bookings.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Clock className="text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Google Calendar Integration */}
      <Card className="shadow-xl border-0 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
        <CardHeader className="border-b border-green-200 bg-gradient-to-r from-green-100 to-emerald-100 rounded-t-lg">
          <CardTitle className="text-xl text-green-800 flex items-center">
            <Calendar className="w-6 h-6 mr-3 text-green-600" />
            Google Calendar Integration
          </CardTitle>
          <p className="text-green-700 text-sm">Connect your Google Calendar to automatically sync bookings</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-green-800">Calendar Sync Status</h3>
                <p className="text-sm text-green-600">Sync bookings to your Google Calendar automatically</p>
              </div>
              <Button 
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => window.open('/auth/google', '_blank')}
              >
                Connect Google Calendar
              </Button>
            </div>
            <div className="bg-blue-100 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Setup Instructions:</h4>
              <ol className="text-sm text-blue-700 space-y-1">
                <li>1. Go to Google Cloud Console {'->'} APIs & Services {'->'} Credentials</li>
                <li>2. Update your OAuth redirect URI to:</li>
                <li className="font-mono text-xs bg-blue-50 p-1 rounded break-all">
                  https://6c123100-69fa-459d-ab79-27598b38ceb3-00-jozcq38yiyhf.worf.replit.dev/auth/google/callback
                </li>
                <li>3. Click "Connect Google Calendar" after updating</li>
              </ol>
            </div>
            <div className="bg-green-100 border border-green-200 rounded-lg p-4">
              <h4 className="font-medium text-green-800 mb-2">Benefits of Calendar Integration:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Automatic booking synchronization</li>
                <li>• Real-time calendar updates</li>
                <li>• Prevent double bookings</li>
                <li>• Mobile calendar access</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm">
        <CardHeader className="border-b border-slate-600/50 bg-gradient-to-r from-slate-700 to-slate-600 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl text-white">All Bookings</CardTitle>
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search bookings..."
                  className="pl-10 w-64"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-slate-600">Loading bookings...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Barber</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                      No bookings found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => {
                    const serviceInfo = getServiceInfo(booking.serviceId);
                    return (
                      <TableRow key={booking.id} className="hover:bg-slate-50">
                        <TableCell>
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3">
                              {booking.customerName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-slate-900">{booking.customerName}</div>
                              <div className="text-sm text-slate-500">{booking.customerPhone}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{getBarberName(booking.barberId)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{serviceInfo.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{formatDate(booking.date)}</div>
                          <div className="text-sm text-slate-500">{formatTime(booking.time)}</div>
                        </TableCell>
                        <TableCell>
                          <div className="font-bold text-slate-900">{formatPrice(serviceInfo.price)}</div>
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Select
                              value={booking.status}
                              onValueChange={(status) => 
                                updateBookingMutation.mutate({ id: booking.id, status })
                              }
                            >
                              <SelectTrigger className="w-32 h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="confirmed">Confirmed</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteBookingMutation.mutate(booking.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Main Business Management Tabs */}
      <Tabs defaultValue="bookings" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="bookings" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Bookings
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Marketing
          </TabsTrigger>
          <TabsTrigger value="staff" className="flex items-center gap-2">
            <UserCheck className="w-4 h-4" />
            Staff
          </TabsTrigger>
          <TabsTrigger value="inventory" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bookings" className="mt-6">
          {/* Existing bookings table content */}
          <div className="space-y-6">
            {/* Bookings Table */}
            <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm">
              <CardHeader className="border-b border-slate-600/50 bg-gradient-to-r from-slate-700 to-slate-600 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl text-white">All Bookings</CardTitle>
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      <Input
                        placeholder="Search bookings..."
                        className="pl-10 w-64"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-slate-600">Loading bookings...</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Barber</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-slate-500">
                            No bookings found
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredBookings.map((booking) => {
                          const serviceInfo = getServiceInfo(booking.serviceId);
                          return (
                            <TableRow key={booking.id} className="hover:bg-slate-50">
                              <TableCell>
                                <div className="flex items-center">
                                  <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                                    <span className="text-teal-600 font-medium text-sm">
                                      {booking.customerName.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div>
                                    <div className="font-medium">{booking.customerName}</div>
                                    <div className="text-sm text-slate-500">{booking.customerPhone}</div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium">{getBarberName(booking.barberId)}</span>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{serviceInfo.name}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{booking.date}</div>
                                  <div className="text-sm text-slate-500">{formatTime(booking.time)}</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className="font-medium text-green-600">
                                  ${(serviceInfo.price / 100).toFixed(2)}
                                </span>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(booking.status)}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center space-x-2">
                                  <Select
                                    value={booking.status}
                                    onValueChange={(status) =>
                                      updateBookingMutation.mutate({ id: booking.id, status })
                                    }
                                  >
                                    <SelectTrigger className="w-28">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="confirmed">Confirm</SelectItem>
                                      <SelectItem value="completed">Complete</SelectItem>
                                      <SelectItem value="cancelled">Cancel</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => deleteBookingMutation.mutate(booking.id)}
                                    disabled={deleteBookingMutation.isPending}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="mt-6">
          <CustomerManagement />
        </TabsContent>

        <TabsContent value="payments" className="mt-6">
          <div className="space-y-6">
            <PaymentProcessing />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Stripe Payment Demo</CardTitle>
                </CardHeader>
                <CardContent>
                  <StripePayment />
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <BusinessAnalytics />
        </TabsContent>

        <TabsContent value="marketing" className="mt-6">
          <MarketingTools />
        </TabsContent>

        <TabsContent value="staff" className="mt-6">
          <StaffManagement />
        </TabsContent>

        <TabsContent value="inventory" className="mt-6">
          <InventoryManagement />
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <div className="space-y-6">
            <EmailSetup />
            <AnalyticsDashboard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
