import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, DollarSign, Users, Clock, TrendingUp, Star, Package, AlertTriangle, CheckCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { Booking, Barber, Service, Client } from "@shared/schema";

// Widget Types
export interface Widget {
  id: string;
  type: 'stats' | 'chart' | 'list' | 'calendar';
  title: string;
  component: string;
  size: 'small' | 'medium' | 'large';
  enabled: boolean;
}

// Statistics Widget
export function StatsWidget({ title, value, icon: Icon, trend, color = "blue" }: {
  title: string;
  value: string | number;
  icon: any;
  trend?: string;
  color?: "blue" | "green" | "orange" | "purple";
}) {
  const colorClasses: Record<string, string> = {
    blue: "from-blue-500 to-blue-600 text-blue-600",
    green: "from-green-500 to-green-600 text-green-600",
    orange: "from-orange-500 to-orange-600 text-orange-600",
    purple: "from-purple-500 to-purple-600 text-purple-600"
  };

  return (
    <Card className="h-32 hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            {trend && (
              <p className="text-xs text-slate-500 mt-1">{trend}</p>
            )}
          </div>
          <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="text-white w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Today's Bookings Widget
export function TodayBookingsWidget() {
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: api.getBookings,
  });

  const { data: barbers = [] } = useQuery({
    queryKey: ["/api/barbers"],
    queryFn: api.getBarbers,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    queryFn: api.getServices,
  });

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = bookings.filter(booking => booking.date === today);

  const getBarberName = (barberId: number) => {
    const barber = barbers.find(b => b.id === barberId);
    return barber?.name || "Unknown";
  };

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || "Unknown";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="h-full">
      <div className="flex items-center gap-2 mb-3">
        <Calendar className="w-4 h-4 text-blue-600" />
        <h3 className="font-medium text-sm">Today's Schedule</h3>
      </div>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {todayBookings.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-sm">No bookings today</p>
        ) : (
          todayBookings.map((booking) => (
            <div key={booking.id} className="p-2 bg-white border border-gray-100 rounded-lg shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">{booking.customerName}</div>
                  <div className="text-xs text-gray-600 truncate">
                    {getServiceName(booking.serviceId)}
                  </div>
                  <div className="text-xs text-gray-500">{booking.time}</div>
                </div>
                <div className="flex-shrink-0">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Revenue Widget
export function RevenueWidget() {
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: api.getBookings,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    queryFn: api.getServices,
  });

  const today = new Date().toISOString().split('T')[0];
  const thisMonth = new Date().toISOString().slice(0, 7);

  const completedBookings = bookings.filter(b => b.status === 'completed');
  const todayRevenue = completedBookings
    .filter(b => b.date === today)
    .reduce((sum, booking) => {
      const service = services.find(s => s.id === booking.serviceId);
      return sum + (service?.price || 0);
    }, 0) / 100;

  const monthlyRevenue = completedBookings
    .filter(b => b.date.startsWith(thisMonth))
    .reduce((sum, booking) => {
      const service = services.find(s => s.id === booking.serviceId);
      return sum + (service?.price || 0);
    }, 0) / 100;

  return (
    <Card className="h-40">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Revenue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-slate-600">Today</p>
            <p className="text-xl font-bold text-green-600">${todayRevenue.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">This Month</p>
            <p className="text-xl font-bold text-blue-600">${monthlyRevenue.toFixed(2)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Actions Widget
export function QuickActionsWidget() {
  return (
    <Card className="h-60">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Button className="w-full justify-start" variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          New Booking
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Users className="w-4 h-4 mr-2" />
          Add Customer
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <DollarSign className="w-4 h-4 mr-2" />
          Process Payment
        </Button>
        <Button className="w-full justify-start" variant="outline">
          <Package className="w-4 h-4 mr-2" />
          Inventory Check
        </Button>
      </CardContent>
    </Card>
  );
}

// Recent Activity Widget
export function RecentActivityWidget() {
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: api.getBookings,
  });

  const recentBookings = bookings
    .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
    .slice(0, 5);

  const getActivityIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "cancelled": return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <Card className="h-80">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 max-h-64 overflow-y-auto">
        {recentBookings.map((booking) => (
          <div key={booking.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
            {getActivityIcon(booking.status)}
            <div className="flex-1">
              <p className="text-sm font-medium">{booking.customerName}</p>
              <p className="text-xs text-slate-500">
                {booking.status} • {booking.date}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// Performance Widget
export function PerformanceWidget() {
  const { data: bookings = [] } = useQuery({
    queryKey: ["/api/bookings"],
    queryFn: api.getBookings,
  });

  const totalBookings = bookings.length;
  const completedBookings = bookings.filter(b => b.status === 'completed').length;
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled').length;
  
  const completionRate = totalBookings > 0 ? (completedBookings / totalBookings * 100).toFixed(1) : 0;
  const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings * 100).toFixed(1) : 0;

  return (
    <Card className="h-48">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Performance
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm">
              <span>Completion Rate</span>
              <span className="font-medium">{completionRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm">
              <span>Cancellation Rate</span>
              <span className="font-medium">{cancellationRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${cancellationRate}%` }}
              ></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Widget Registry with proper typing
export const AVAILABLE_WIDGETS: Record<string, {
  id: string;
  title: string;
  component: React.ComponentType;
  size: 'small' | 'medium' | 'large';
  category: string;
}> = {
  'today-bookings': {
    id: 'today-bookings',
    title: "Today's Bookings",
    component: TodayBookingsWidget,
    size: 'medium',
    category: 'schedule'
  },
  'revenue': {
    id: 'revenue',
    title: 'Revenue',
    component: RevenueWidget,
    size: 'medium',
    category: 'finance'
  },
  'quick-actions': {
    id: 'quick-actions',
    title: 'Quick Actions',
    component: QuickActionsWidget,
    size: 'small',
    category: 'actions'
  },
  'recent-activity': {
    id: 'recent-activity',
    title: 'Recent Activity',
    component: RecentActivityWidget,
    size: 'medium',
    category: 'activity'
  },
  'performance': {
    id: 'performance',
    title: 'Performance',
    component: PerformanceWidget,
    size: 'medium',
    category: 'analytics'
  }
};