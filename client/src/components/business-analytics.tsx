import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { apiRequest } from "@/lib/queryClient";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar as CalendarIcon, 
  Clock, 
  Star,
  Target,
  Percent,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  RefreshCw,
  TrendingDown
} from "lucide-react";
import type { Booking, Payment, Client, Service, Barber } from "@shared/schema";

interface AnalyticsData {
  totalRevenue: number;
  totalBookings: number;
  newClients: number;
  averageTicket: number;
  popularServices: Array<{ serviceId: number; serviceName: string; count: number; revenue: number }>;
  peakHours: Array<{ hour: string; bookings: number }>;
  dailyRevenue: Array<{ date: string; revenue: number; bookings: number }>;
  conversionRate: number;
  revenueGrowth: number;
  clientRetention: number;
  averageSessionValue: number;
  topBarbers: Array<{ barberId: number; barberName: string; revenue: number; bookings: number }>;
}

export function BusinessAnalytics() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "1y">("30d");
  const [selectedBarber, setSelectedBarber] = useState<string>("all");
  const [refreshing, setRefreshing] = useState(false);

  // Fetch analytics data
  const { data: analytics, isLoading, refetch } = useQuery({
    queryKey: ["/api/analytics", dateRange, selectedBarber],
    queryFn: async () => {
      const params = new URLSearchParams({
        range: dateRange,
        ...(selectedBarber !== "all" && { barberId: selectedBarber }),
      });
      const response = await apiRequest("GET", `/api/analytics?${params}`);
      return response.json() as Promise<AnalyticsData>;
    },
  });

  // Fetch barbers for filtering
  const { data: barbers = [] } = useQuery({
    queryKey: ["/api/barbers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/barbers");
      return response.json();
    },
  });

  // Fetch booking data for charts
  const { data: bookingData = [] } = useQuery({
    queryKey: ["/api/bookings", dateRange],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/bookings?range=${dateRange}`);
      return response.json();
    },
  });

  // Fetch payment data
  const { data: paymentData = [] } = useQuery({
    queryKey: ["/api/payments", dateRange],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/payments?range=${dateRange}`);
      return response.json();
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Process data for charts
  const chartData = useMemo(() => {
    if (!analytics) return {};

    // Revenue forecast based on current trends
    const forecastData = analytics.dailyRevenue.map((day, index) => ({
      ...day,
      forecast: index > analytics.dailyRevenue.length - 8 ? 
        day.revenue * (1 + analytics.revenueGrowth / 100) : undefined
    }));

    // Service performance data
    const servicePerformance = analytics.popularServices.map(service => ({
      name: service.serviceName,
      bookings: service.count,
      revenue: service.revenue,
      avgValue: service.revenue / service.count
    }));

    // Hour distribution for peak time analysis
    const hourlyData = Array.from({ length: 24 }, (_, hour) => {
      const hourStr = `${hour.toString().padStart(2, '0')}:00`;
      const existing = analytics.peakHours.find(h => h.hour === hourStr);
      return {
        hour: hourStr,
        bookings: existing?.bookings || 0
      };
    }).filter(h => h.hour >= '08:00' && h.hour <= '18:00'); // Business hours only

    return {
      forecast: forecastData,
      services: servicePerformance,
      hourly: hourlyData
    };
  }, [analytics]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Business Analytics</h2>
          <p className="text-gray-600">Track performance and identify growth opportunities</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedBarber} onValueChange={setSelectedBarber}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Barbers</SelectItem>
              {barbers.map((barber: Barber) => (
                <SelectItem key={barber.id} value={barber.id.toString()}>
                  {barber.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </p>
                <div className="flex items-center mt-1">
                  {analytics?.revenueGrowth && analytics.revenueGrowth > 0 ? (
                    <ArrowUp className="w-4 h-4 text-green-500 mr-1" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm ${
                    analytics?.revenueGrowth && analytics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(analytics?.revenueGrowth || 0)} vs last period
                  </span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.totalBookings || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Avg: {formatCurrency(analytics?.averageTicket || 0)} per booking
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CalendarIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">New Clients</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics?.newClients || 0}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatPercentage(analytics?.conversionRate || 0)} conversion rate
                </p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Client Retention</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatPercentage(analytics?.clientRetention || 0)}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Returning customers
                </p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <Tabs defaultValue="revenue" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="revenue">Revenue Trends</TabsTrigger>
          <TabsTrigger value="services">Service Performance</TabsTrigger>
          <TabsTrigger value="peak-times">Peak Hours</TabsTrigger>
          <TabsTrigger value="barber-performance">Barber Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Revenue Forecast & Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.forecast}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      labelFormatter={(label) => `Date: ${label}`}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#0ea5e9" 
                      fill="#0ea5e9" 
                      fillOpacity={0.3}
                      name="Actual Revenue"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="forecast" 
                      stroke="#f59e0b" 
                      fill="#f59e0b" 
                      fillOpacity={0.2}
                      strokeDasharray="5 5"
                      name="Forecast"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Bookings vs Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analytics?.dailyRevenue}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis yAxisId="left" tickFormatter={(value) => formatCurrency(value)} />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Line 
                        yAxisId="left"
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#0ea5e9" 
                        strokeWidth={2}
                        name="Revenue"
                      />
                      <Line 
                        yAxisId="right"
                        type="monotone" 
                        dataKey="bookings" 
                        stroke="#10b981" 
                        strokeWidth={2}
                        name="Bookings"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Performance Indicators</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Average Session Value</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(analytics?.averageSessionValue || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Conversion Rate</span>
                  <span className="font-bold text-blue-600">
                    {formatPercentage(analytics?.conversionRate || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Client Retention</span>
                  <span className="font-bold text-purple-600">
                    {formatPercentage(analytics?.clientRetention || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium">Revenue Growth</span>
                  <span className={`font-bold ${
                    analytics?.revenueGrowth && analytics.revenueGrowth > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatPercentage(analytics?.revenueGrowth || 0)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="services" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Popular Services</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics?.popularServices}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ serviceName, count }) => `${serviceName}: ${count}`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {analytics?.popularServices.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Revenue Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.services}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis tickFormatter={(value) => formatCurrency(value)} />
                      <Tooltip 
                        formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                      />
                      <Bar dataKey="revenue" fill="#0ea5e9" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Service Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.popularServices.map((service, index) => (
                  <div key={service.serviceId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <div>
                        <h4 className="font-medium">{service.serviceName}</h4>
                        <p className="text-sm text-gray-600">{service.count} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(service.revenue)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(service.revenue / service.count)} avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="peak-times" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Peak Hours Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData.hourly}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {chartData.hourly?.reduce((max, hour) => 
                    hour.bookings > max.bookings ? hour : max, 
                    { hour: '', bookings: 0 }
                  )?.hour || 'N/A'}
                </div>
                <p className="text-sm text-gray-600">Peak Hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {Math.round(
                    (chartData.hourly?.reduce((sum, hour) => sum + hour.bookings, 0) || 0) / 
                    (chartData.hourly?.length || 1)
                  )}
                </div>
                <p className="text-sm text-gray-600">Avg Bookings/Hour</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {chartData.hourly?.filter(hour => hour.bookings > 0).length || 0}
                </div>
                <p className="text-sm text-gray-600">Active Hours</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="barber-performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Barber Performance Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.topBarbers.map((barber, index) => (
                  <div key={barber.barberId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-medium">{barber.barberName}</h4>
                        <p className="text-sm text-gray-600">{barber.bookings} bookings</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-green-600">
                        {formatCurrency(barber.revenue)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formatCurrency(barber.revenue / barber.bookings)} avg
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Barber Revenue Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics?.topBarbers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="barberName" />
                    <YAxis tickFormatter={(value) => formatCurrency(value)} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                    />
                    <Bar dataKey="revenue" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}