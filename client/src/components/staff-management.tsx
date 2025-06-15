import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, DollarSign, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Barber, StaffSchedule, TimeOffRequest, Payment } from "@shared/schema";

export function StaffManagement() {
  const [selectedBarber, setSelectedBarber] = useState<number | null>(null);
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [showTimeOffDialog, setShowTimeOffDialog] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch barbers
  const { data: barbers = [] } = useQuery<Barber[]>({
    queryKey: ["/api/barbers"],
  });

  // Fetch staff schedules
  const { data: schedules = [] } = useQuery<StaffSchedule[]>({
    queryKey: ["/api/staff/schedules"],
  });

  // Fetch time off requests
  const { data: timeOffRequests = [] } = useQuery<TimeOffRequest[]>({
    queryKey: ["/api/staff/time-off"],
  });

  // Fetch staff performance (payments/commissions)
  const { data: staffPerformance = [] } = useQuery<Array<{
    barberId: number;
    totalRevenue: number;
    totalBookings: number;
    averageRating: number;
    commissionEarned: number;
  }>>({
    queryKey: ["/api/staff/performance"],
  });

  const createScheduleMutation = useMutation({
    mutationFn: async (data: {
      barberId: number;
      date: string;
      startTime: string;
      endTime: string;
      notes?: string;
    }) => {
      const response = await fetch("/api/staff/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to create schedule");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Schedule created successfully" });
      setShowScheduleDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/staff/schedules"] });
    }
  });

  const submitTimeOffMutation = useMutation({
    mutationFn: async (data: {
      barberId: number;
      startDate: string;
      endDate: string;
      reason: string;
    }) => {
      const response = await fetch("/api/staff/time-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to submit time off request");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Time off request submitted successfully" });
      setShowTimeOffDialog(false);
      queryClient.invalidateQueries({ queryKey: ["/api/staff/time-off"] });
    }
  });

  const approveTimeOffMutation = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: number; status: "approved" | "rejected" }) => {
      const response = await fetch(`/api/staff/time-off/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error("Failed to update time off request");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Time off request updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/staff/time-off"] });
    }
  });

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  };

  const getWeekDays = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - date.getDay());

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      week.push(day);
    }
    return week;
  };

  const weekDays = getWeekDays(selectedWeek);
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const getScheduleForDay = (barberId: number, date: string) => {
    return schedules.filter(s => s.barberId === barberId && s.date === date);
  };

  const getBarberPerformance = (barberId: number) => {
    return staffPerformance.find(p => p.barberId === barberId) || {
      totalRevenue: 0,
      totalBookings: 0,
      averageRating: 0,
      commissionEarned: 0
    };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Staff Management</h2>
          <p className="text-slate-600 mt-1">Manage schedules, time-off requests, and performance</p>
        </div>
        <div className="flex space-x-3">
          <Dialog open={showScheduleDialog} onOpenChange={setShowScheduleDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Calendar className="w-4 h-4 mr-2" />
                Add Schedule
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Staff Schedule</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createScheduleMutation.mutate({
                  barberId: Number(formData.get("barberId")),
                  date: formData.get("date") as string,
                  startTime: formData.get("startTime") as string,
                  endTime: formData.get("endTime") as string,
                  notes: formData.get("notes") as string
                });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="barberId">Barber</Label>
                  <Select name="barberId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select barber" />
                    </SelectTrigger>
                    <SelectContent>
                      {barbers.map((barber) => (
                        <SelectItem key={barber.id} value={barber.id.toString()}>
                          {barber.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input name="date" type="date" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startTime">Start Time</Label>
                    <Input name="startTime" type="time" required />
                  </div>
                  <div>
                    <Label htmlFor="endTime">End Time</Label>
                    <Input name="endTime" type="time" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea name="notes" placeholder="Special instructions or notes..." />
                </div>
                <Button type="submit" className="w-full" disabled={createScheduleMutation.isPending}>
                  {createScheduleMutation.isPending ? "Creating..." : "Create Schedule"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={showTimeOffDialog} onOpenChange={setShowTimeOffDialog}>
            <DialogTrigger asChild>
              <Button>
                <Clock className="w-4 h-4 mr-2" />
                Request Time Off
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit Time Off Request</DialogTitle>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                submitTimeOffMutation.mutate({
                  barberId: Number(formData.get("barberId")),
                  startDate: formData.get("startDate") as string,
                  endDate: formData.get("endDate") as string,
                  reason: formData.get("reason") as string
                });
              }} className="space-y-4">
                <div>
                  <Label htmlFor="barberId">Barber</Label>
                  <Select name="barberId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select barber" />
                    </SelectTrigger>
                    <SelectContent>
                      {barbers.map((barber) => (
                        <SelectItem key={barber.id} value={barber.id.toString()}>
                          {barber.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input name="startDate" type="date" required />
                  </div>
                  <div>
                    <Label htmlFor="endDate">End Date</Label>
                    <Input name="endDate" type="date" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reason">Reason</Label>
                  <Textarea name="reason" placeholder="Vacation, sick leave, personal..." required />
                </div>
                <Button type="submit" className="w-full" disabled={submitTimeOffMutation.isPending}>
                  {submitTimeOffMutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Staff Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {barbers.map((barber) => {
          const performance = getBarberPerformance(barber.id);
          return (
            <Card key={barber.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                    {barber.name.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{barber.name}</CardTitle>
                    <p className="text-sm text-slate-600">{barber.title}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Revenue</span>
                  <span className="font-bold text-teal-600">{formatPrice(performance.totalRevenue)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Bookings</span>
                  <span className="font-bold">{performance.totalBookings}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Commission</span>
                  <span className="font-bold text-green-600">{formatPrice(performance.commissionEarned)}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-teal-600" />
              Weekly Schedule
            </CardTitle>
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newWeek = new Date(selectedWeek);
                  newWeek.setDate(selectedWeek.getDate() - 7);
                  setSelectedWeek(newWeek);
                }}
              >
                Previous Week
              </Button>
              <span className="text-sm font-medium">
                {selectedWeek.toLocaleDateString()}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const newWeek = new Date(selectedWeek);
                  newWeek.setDate(selectedWeek.getDate() + 7);
                  setSelectedWeek(newWeek);
                }}
              >
                Next Week
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left p-3 border-b font-medium text-slate-700">Staff</th>
                  {weekDays.map((day, index) => (
                    <th key={index} className="text-center p-3 border-b font-medium text-slate-700 min-w-32">
                      {dayNames[index]}
                      <br />
                      <span className="text-xs text-slate-500">
                        {day.toLocaleDateString()}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {barbers.map((barber) => (
                  <tr key={barber.id}>
                    <td className="p-3 border-b">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {barber.name.charAt(0)}
                        </div>
                        <span className="font-medium">{barber.name}</span>
                      </div>
                    </td>
                    {weekDays.map((day, dayIndex) => {
                      const dateString = day.toISOString().split('T')[0];
                      const daySchedules = getScheduleForDay(barber.id, dateString);
                      
                      return (
                        <td key={dayIndex} className="p-2 border-b text-center">
                          {daySchedules.length > 0 ? (
                            <div className="space-y-1">
                              {daySchedules.map((schedule) => (
                                <div
                                  key={schedule.id}
                                  className={`text-xs p-1 rounded ${
                                    schedule.isAvailable
                                      ? "bg-green-100 text-green-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {schedule.startTime} - {schedule.endTime}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 text-xs">Off</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Time Off Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2 text-teal-600" />
            Time Off Requests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeOffRequests.length > 0 ? (
              timeOffRequests.map((request) => {
                const barber = barbers.find(b => b.id === request.barberId);
                return (
                  <div key={request.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-slate-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                          {barber?.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{barber?.name}</div>
                          <div className="text-sm text-slate-600">
                            {request.startDate} to {request.endDate}
                          </div>
                          <div className="text-sm text-slate-500">{request.reason}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge
                        variant={
                          request.status === "approved" ? "default" :
                          request.status === "rejected" ? "destructive" : "secondary"
                        }
                      >
                        {request.status}
                      </Badge>
                      {request.status === "pending" && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveTimeOffMutation.mutate({ 
                              requestId: request.id, 
                              status: "approved" 
                            })}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => approveTimeOffMutation.mutate({ 
                              requestId: request.id, 
                              status: "rejected" 
                            })}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-slate-500">
                <Clock className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No time off requests</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}