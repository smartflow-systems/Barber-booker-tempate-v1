import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Calendar, 
  CheckCircle, 
  AlertCircle, 
  LogOut, 
  RotateCw, 
  Settings,
  Users,
  Clock,
  Shield
} from "lucide-react";

interface AdminUser {
  id: number;
  username: string;
  barberId: number | null;
  role: string;
  isActive: boolean;
  lastLogin: Date | null;
}

interface GoogleToken {
  id: number;
  userId: string;
  expiryDate: Date;
}

export default function Admin() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current admin user
  const { data: adminUser, isLoading: userLoading } = useQuery<AdminUser>({
    queryKey: ["/api/admin/user"],
    retry: false,
  });

  // Get Google Calendar connection status
  const { data: googleToken, isLoading: tokenLoading } = useQuery<GoogleToken>({
    queryKey: ["/api/admin/google-token"],
    retry: false,
  });

  // Get recent bookings
  const { data: bookings = [] } = useQuery<any[]>({
    queryKey: ["/api/bookings"],
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/admin/logout", { method: "POST" });
      if (!response.ok) throw new Error("Logout failed");
      return response.json();
    },
    onSuccess: () => {
      window.location.href = "/admin/login";
    },
  });

  const handleGoogleConnect = () => {
    if (!(adminUser as any)?.id) return;
    setIsConnecting(true);
    window.location.href = `/auth/google?userId=${(adminUser as any).id}`;
  };

  const handleDisconnectGoogle = async () => {
    try {
      const response = await fetch("/api/admin/google-disconnect", { method: "DELETE" });
      if (!response.ok) throw new Error("Failed to disconnect");
      
      toast({
        title: "Calendar disconnected",
        description: "Google Calendar has been disconnected from your account",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/google-token"] });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to disconnect Google Calendar",
        variant: "destructive",
      });
    }
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    window.location.href = "/admin/login";
    return null;
  }

  const isCalendarConnected = !!googleToken;
  const todayBookings = Array.isArray(bookings) ? bookings.filter((booking: any) => 
    booking.date === new Date().toISOString().split('T')[0]
  ) : [];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Barber Admin Panel</h1>
                <p className="text-sm text-muted-foreground">Welcome back, {adminUser.username}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          
          {/* Google Calendar Connection */}
          <Card className="md:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                <CardTitle>Google Calendar Integration</CardTitle>
              </div>
              <CardDescription>
                Connect your Google Calendar to automatically sync bookings and prevent double bookings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {isCalendarConnected ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium">
                      {isCalendarConnected ? "Calendar Connected" : "Calendar Not Connected"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {isCalendarConnected 
                        ? "Your bookings are syncing with Google Calendar"
                        : "Connect to enable automatic calendar sync"
                      }
                    </p>
                  </div>
                  <Badge variant={isCalendarConnected ? "default" : "secondary"}>
                    {isCalendarConnected ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <Separator />

                <div className="flex gap-2">
                  {!isCalendarConnected ? (
                    <Button 
                      onClick={handleGoogleConnect}
                      disabled={isConnecting}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      {isConnecting ? "Connecting..." : "Connect Google Calendar"}
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleDisconnectGoogle}>
                        Disconnect
                      </Button>
                      <Button variant="outline">
                        <RotateCw className="h-4 w-4 mr-2" />
                        Sync Now
                      </Button>
                    </div>
                  )}
                </div>

                {isCalendarConnected && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      New bookings will automatically appear in your Google Calendar. 
                      Calendar events will prevent double bookings during those times.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Today's Stats */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                <CardTitle>Today's Overview</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{todayBookings.length}</div>
                  <p className="text-sm text-muted-foreground">Bookings Today</p>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Total Bookings</span>
                    <span className="font-medium">{bookings.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Calendar Sync</span>
                    <Badge variant={isCalendarConnected ? "default" : "secondary"} className="text-xs">
                      {isCalendarConnected ? "On" : "Off"}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="md:col-span-2 lg:col-span-3">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                <CardTitle>Account Information</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Username</span>
                    <span className="text-sm font-medium">{adminUser.username}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Role</span>
                    <Badge variant="outline">{adminUser.role}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge variant={adminUser.isActive ? "default" : "secondary"}>
                      {adminUser.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Login</span>
                    <span className="text-sm font-medium">
                      {adminUser.lastLogin 
                        ? new Date(adminUser.lastLogin).toLocaleDateString()
                        : "Never"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Barber ID</span>
                    <span className="text-sm font-medium">{adminUser.barberId || "Not assigned"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}