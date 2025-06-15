import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, DollarSign, Users, Calendar, Star, Clock, Target } from "lucide-react";
import type { Analytics, Payment, Booking, Service } from "@shared/schema";

interface AnalyticsSummary {
  totalRevenue: number;
  totalBookings: number;
  newClients: number;
  averageTicket: number;
  popularServices: Array<{ serviceId: number; serviceName: string; count: number }>;
  peakHours: Array<{ hour: string; bookings: number }>;
  dailyRevenue: Array<{ date: string; revenue: number; bookings: number }>;
  conversionRate: number;
}

export function AnalyticsDashboard() {
  const [dateRange, setDateRange] = useState("30"); // days
  const [selectedMetric, setSelectedMetric] = useState("revenue");

  // Fetch analytics data
  const { data: analytics } = useQuery<AnalyticsSummary>({
    queryKey: [`/api/analytics?range=${dateRange}`],
  });

  // Fetch services for mapping
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
  });

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  };

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const getServiceName = (serviceId: number) => {
    const service = services.find(s => s.id === serviceId);
    return service?.name || `Service ${serviceId}`;
  };

  const chartColors = ["#0d9488", "#14b8a6", "#2dd4bf", "#5eead4", "#99f6e4"];

  if (!analytics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-800">Analytics Dashboard</h2>
          <p className="text-slate-600 mt-1">Business performance insights and metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{formatPrice(analytics.totalRevenue)}</div>
            <p className="text-xs text-slate-600 mt-1">
              +12% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <Calendar className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{analytics.totalBookings}</div>
            <p className="text-xs text-slate-600 mt-1">
              +8% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Clients</CardTitle>
            <Users className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{analytics.newClients}</div>
            <p className="text-xs text-slate-600 mt-1">
              +15% from last period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Ticket</CardTitle>
            <Target className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-teal-600">{formatPrice(analytics.averageTicket)}</div>
            <p className="text-xs text-slate-600 mt-1">
              +5% from last period
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-teal-600" />
              Revenue Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analytics.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis tickFormatter={(value) => formatPrice(value)} />
                <Tooltip 
                  formatter={(value: number) => [formatPrice(value), "Revenue"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0d9488" 
                  strokeWidth={2}
                  dot={{ fill: "#0d9488" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Popular Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Star className="w-5 h-5 mr-2 text-teal-600" />
              Popular Services
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.popularServices}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  nameKey="serviceName"
                >
                  {analytics.popularServices.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [`${value} bookings`, name]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {analytics.popularServices.slice(0, 5).map((service, index) => (
                <div key={service.serviceId} className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: chartColors[index % chartColors.length] }}
                    />
                    {getServiceName(service.serviceId)}
                  </div>
                  <span className="font-medium">{service.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Peak Hours */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="w-5 h-5 mr-2 text-teal-600" />
              Peak Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.peakHours}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} bookings`, "Bookings"]}
                  labelFormatter={(label) => `Hour: ${label}`}
                />
                <Bar dataKey="bookings" fill="#0d9488" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Booking Volume */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-teal-600" />
              Daily Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => [`${value} bookings`, "Bookings"]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar dataKey="bookings" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-teal-50 rounded-lg">
              <div className="text-2xl font-bold text-teal-600">{formatPercentage(analytics.conversionRate)}</div>
              <div className="text-sm text-slate-600 mt-1">Conversion Rate</div>
              <div className="text-xs text-slate-500 mt-2">Visitors to bookings</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {analytics.popularServices[0]?.serviceName || "N/A"}
              </div>
              <div className="text-sm text-slate-600 mt-1">Top Service</div>
              <div className="text-xs text-slate-500 mt-2">
                {analytics.popularServices[0]?.count || 0} bookings
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {analytics.peakHours[0]?.hour || "N/A"}
              </div>
              <div className="text-sm text-slate-600 mt-1">Peak Hour</div>
              <div className="text-xs text-slate-500 mt-2">
                {analytics.peakHours[0]?.bookings || 0} bookings
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Business Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 rounded-lg border-l-4 border-green-400">
              <div className="font-medium text-green-800">Staff Optimization</div>
              <div className="text-sm text-green-700 mt-1">
                Consider scheduling more staff during peak hours ({analytics.peakHours[0]?.hour}) to reduce wait times.
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
              <div className="font-medium text-blue-800">Service Promotion</div>
              <div className="text-sm text-blue-700 mt-1">
                Promote less popular services during slow periods to increase average ticket value.
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-400">
              <div className="font-medium text-purple-800">Customer Retention</div>
              <div className="text-sm text-purple-700 mt-1">
                Implement loyalty programs for clients with {analytics.newClients} new customers this period.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}