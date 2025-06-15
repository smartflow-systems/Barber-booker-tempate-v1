import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Calendar as CalendarIcon, 
  DollarSign, 
  Clock, 
  TrendingUp,
  PlusCircle,
  Settings,
  Award,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Briefcase
} from "lucide-react";
import type { Barber, Booking, StaffSchedule, TimeOffRequest } from "@shared/schema";

export function StaffManagement() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedBarber, setSelectedBarber] = useState<Barber | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showTimeOffDialog, setShowTimeOffDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch barbers
  const { data: barbers = [], isLoading } = useQuery({
    queryKey: ["/api/barbers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/barbers");
      return response.json();
    },
  });

  // Fetch staff schedules
  const { data: schedules = [] } = useQuery({
    queryKey: ["/api/staff-schedule"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/staff-schedule");
      return response.json();
    },
  });

  // Fetch time off requests
  const { data: timeOffRequests = [] } = useQuery({
    queryKey: ["/api/time-off-requests"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/time-off-requests");
      return response.json();
    },
  });

  // Fetch bookings for commission calculation
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/bookings");
      return response.json();
    },
  });

  // Create schedule mutation
  const createScheduleMutation = useMutation({
    mutationFn: async (scheduleData: any) => {
      const response = await apiRequest("POST", "/api/staff-schedule", scheduleData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/staff-schedule"] });
      setShowScheduleDialog(false);
      toast({
        title: "Schedule Updated",
        description: "Staff schedule has been successfully updated.",
      });
    },
  });

  // Create time off request mutation
  const createTimeOffMutation = useMutation({
    mutationFn: async (timeOffData: any) => {
      const response = await apiRequest("POST", "/api/time-off-requests", timeOffData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
      setShowTimeOffDialog(false);
      toast({
        title: "Time Off Requested",
        description: "Time off request has been submitted for approval.",
      });
    },
  });

  // Approve/deny time off request mutation
  const updateTimeOffMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PUT", `/api/time-off-requests/${id}`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-off-requests"] });
      toast({
        title: "Request Updated",
        description: "Time off request status has been updated.",
      });
    },
  });

  // Calculate commission data for each barber
  const getBarberCommissionData = (barberId: number) => {
    const barberBookings = bookings.filter((booking: Booking) => 
      booking.barberId === barberId && booking.status === 'completed'
    );
    
    const totalRevenue = barberBookings.reduce((sum: number, booking: Booking) => {
      // Assuming service prices are stored somewhere accessible
      return sum + (booking.servicePrice || 5000); // Default $50 if price not available
    }, 0);
    
    const commissionRate = 0.6; // 60% commission rate
    const commission = totalRevenue * commissionRate;
    
    return {
      bookingsCount: barberBookings.length,
      totalRevenue,
      commission,
      averageTicket: barberBookings.length > 0 ? totalRevenue / barberBookings.length : 0
    };
  };

  // Get upcoming time off for a barber
  const getUpcomingTimeOff = (barberId: number) => {
    return timeOffRequests.filter((request: TimeOffRequest) => 
      request.barberId === barberId && 
      request.status === 'approved' &&
      new Date(request.startDate) >= new Date()
    );
  };

  // Get barber availability for today
  const getTodayAvailability = (barberId: number) => {
    const today = new Date().toISOString().split('T')[0];
    const todaySchedule = schedules.find((schedule: StaffSchedule) => 
      schedule.barberId === barberId && schedule.date === today
    );
    
    if (!todaySchedule) return "Not scheduled";
    return `${todaySchedule.startTime} - ${todaySchedule.endTime}`;
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getDayOfWeek = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
          <p className="text-gray-600">Manage schedules, track performance, and handle time-off requests</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="w-4 h-4 mr-2" />
                Schedule
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Update Schedule</DialogTitle>
              </DialogHeader>
              <ScheduleForm 
                barbers={barbers}
                onSubmit={createScheduleMutation.mutate}
                isLoading={createScheduleMutation.isPending}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={showTimeOffDialog} onOpenChange={setShowTimeOffDialog}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="w-4 h-4 mr-2" />
                Time Off Request
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Request Time Off</DialogTitle>
              </DialogHeader>
              <TimeOffForm 
                barbers={barbers}
                onSubmit={createTimeOffMutation.mutate}
                isLoading={createTimeOffMutation.isPending}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Staff Overview</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
          <TabsTrigger value="time-off">Time Off</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {barbers.map((barber: Barber) => {
              const commissionData = getBarberCommissionData(barber.id);
              const upcomingTimeOff = getUpcomingTimeOff(barber.id);
              const todayAvailability = getTodayAvailability(barber.id);
              
              return (
                <Card key={barber.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                          {barber.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{barber.name}</h3>
                          <p className="text-sm text-gray-500">{barber.specialties || "Barber"}</p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedBarber(barber)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="font-semibold text-green-600">
                          {commissionData.bookingsCount}
                        </div>
                        <div className="text-gray-600">Bookings</div>
                      </div>
                      <div className="text-center p-2 bg-blue-50 rounded">
                        <div className="font-semibold text-blue-600">
                          {formatCurrency(commissionData.commission)}
                        </div>
                        <div className="text-gray-600">Commission</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Today:</span>
                        <span className="font-medium">{todayAvailability}</span>
                      </div>
                      
                      {barber.phone && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="w-3 h-3" />
                          {barber.phone}
                        </div>
                      )}
                      
                      {barber.email && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {barber.email}
                        </div>
                      )}
                    </div>
                    
                    {upcomingTimeOff.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-orange-600 font-medium">
                          Upcoming time off: {upcomingTimeOff.length} request(s)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="w-5 h-5" />
                Weekly Schedule Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {barbers.map((barber: Barber) => {
                  const barberSchedules = schedules.filter((s: StaffSchedule) => s.barberId === barber.id);
                  
                  return (
                    <div key={barber.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{barber.name}</h4>
                        <Badge variant="outline">
                          {barberSchedules.length} days scheduled
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-7 gap-2">
                        {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, index) => {
                          const daySchedule = barberSchedules.find((s: StaffSchedule) => {
                            const scheduleDay = new Date(s.date).getDay();
                            return scheduleDay === index;
                          });
                          
                          return (
                            <div key={day} className="text-center p-2 border rounded text-sm">
                              <div className="font-medium text-gray-700 mb-1">{day.slice(0, 3)}</div>
                              {daySchedule ? (
                                <div className="text-xs">
                                  <div className="text-green-600 font-medium">
                                    {daySchedule.startTime} - {daySchedule.endTime}
                                  </div>
                                  {daySchedule.breakStart && daySchedule.breakEnd && (
                                    <div className="text-orange-600">
                                      Break: {daySchedule.breakStart} - {daySchedule.breakEnd}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-xs text-gray-400">Off</div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {formatCurrency(
                    barbers.reduce((total: number, barber: Barber) => 
                      total + getBarberCommissionData(barber.id).commission, 0
                    )
                  )}
                </div>
                <p className="text-sm text-gray-600">Total Commissions</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {barbers.reduce((total: number, barber: Barber) => 
                    total + getBarberCommissionData(barber.id).bookingsCount, 0
                  )}
                </div>
                <p className="text-sm text-gray-600">Total Services</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {formatCurrency(
                    Math.round(
                      barbers.reduce((total: number, barber: Barber) => 
                        total + getBarberCommissionData(barber.id).averageTicket, 0
                      ) / Math.max(barbers.length, 1)
                    )
                  )}
                </div>
                <p className="text-sm text-gray-600">Avg Ticket</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">60%</div>
                <p className="text-sm text-gray-600">Commission Rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Individual Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {barbers.map((barber: Barber) => {
                  const data = getBarberCommissionData(barber.id);
                  
                  return (
                    <div key={barber.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                          {barber.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-medium">{barber.name}</h4>
                          <p className="text-sm text-gray-600">{data.bookingsCount} services completed</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <div className="font-semibold text-green-600">
                            {formatCurrency(data.totalRevenue)}
                          </div>
                          <div className="text-xs text-gray-500">Revenue</div>
                        </div>
                        <div>
                          <div className="font-semibold text-blue-600">
                            {formatCurrency(data.commission)}
                          </div>
                          <div className="text-xs text-gray-500">Commission</div>
                        </div>
                        <div>
                          <div className="font-semibold text-purple-600">
                            {formatCurrency(data.averageTicket)}
                          </div>
                          <div className="text-xs text-gray-500">Avg Ticket</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time-off" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {timeOffRequests.filter((r: TimeOffRequest) => r.status === 'pending').length}
                </div>
                <p className="text-sm text-gray-600">Pending Requests</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {timeOffRequests.filter((r: TimeOffRequest) => r.status === 'approved').length}
                </div>
                <p className="text-sm text-gray-600">Approved</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {timeOffRequests.filter((r: TimeOffRequest) => r.status === 'denied').length}
                </div>
                <p className="text-sm text-gray-600">Denied</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Time Off Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              {timeOffRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No time off requests</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {timeOffRequests.map((request: TimeOffRequest) => {
                    const barber = barbers.find((b: Barber) => b.id === request.barberId);
                    
                    return (
                      <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium">{barber?.name || 'Unknown Barber'}</h4>
                            <Badge 
                              className={
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }
                            >
                              {request.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">
                            {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">Type: {request.type}</p>
                          {request.reason && (
                            <p className="text-sm text-gray-500 mt-1">Reason: {request.reason}</p>
                          )}
                        </div>
                        
                        {request.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => updateTimeOffMutation.mutate({ id: request.id, status: 'approved' })}
                              disabled={updateTimeOffMutation.isPending}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => updateTimeOffMutation.mutate({ id: request.id, status: 'denied' })}
                              disabled={updateTimeOffMutation.isPending}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Deny
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Schedule Form Component
function ScheduleForm({ barbers, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    barberId: "",
    date: "",
    startTime: "",
    endTime: "",
    breakStart: "",
    breakEnd: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      barberId: parseInt(formData.barberId),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="barberId">Barber *</Label>
        <Select value={formData.barberId} onValueChange={(value) => setFormData({ ...formData, barberId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select barber" />
          </SelectTrigger>
          <SelectContent>
            {barbers.map((barber: Barber) => (
              <SelectItem key={barber.id} value={barber.id.toString()}>
                {barber.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="date">Date *</Label>
        <Input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startTime">Start Time *</Label>
          <Input
            id="startTime"
            type="time"
            value={formData.startTime}
            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endTime">End Time *</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="breakStart">Break Start</Label>
          <Input
            id="breakStart"
            type="time"
            value={formData.breakStart}
            onChange={(e) => setFormData({ ...formData, breakStart: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="breakEnd">Break End</Label>
          <Input
            id="breakEnd"
            type="time"
            value={formData.breakEnd}
            onChange={(e) => setFormData({ ...formData, breakEnd: e.target.value })}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Any special notes for this schedule"
        />
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Creating Schedule..." : "Create Schedule"}
      </Button>
    </form>
  );
}

// Time Off Form Component
function TimeOffForm({ barbers, onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    barberId: "",
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      barberId: parseInt(formData.barberId),
      status: 'pending',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="barberId">Barber *</Label>
        <Select value={formData.barberId} onValueChange={(value) => setFormData({ ...formData, barberId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select barber" />
          </SelectTrigger>
          <SelectContent>
            {barbers.map((barber: Barber) => (
              <SelectItem key={barber.id} value={barber.id.toString()}>
                {barber.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <Label htmlFor="type">Type *</Label>
        <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="vacation">Vacation</SelectItem>
            <SelectItem value="sick">Sick Leave</SelectItem>
            <SelectItem value="personal">Personal</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
            <SelectItem value="training">Training</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="reason">Reason</Label>
        <Textarea
          id="reason"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Optional reason for time off request"
        />
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Submitting Request..." : "Submit Request"}
      </Button>
    </form>
  );
}