import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Camera, 
  Star, 
  TrendingUp, 
  Clock, 
  DollarSign,
  Gift,
  Heart,
  Upload,
  Search,
  Filter,
  MoreVertical,
  Edit,
  Trash2,
  Eye
} from "lucide-react";
import type { Client, Booking, Service, Barber, ClientPhoto } from "@shared/schema";

interface CustomerManagementProps {
  onSelectCustomer?: (customer: Client) => void;
}

export function CustomerManagement({ onSelectCustomer }: CustomerManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Client | null>(null);
  const [showNewCustomerDialog, setShowNewCustomerDialog] = useState(false);
  const [filterBy, setFilterBy] = useState<"all" | "vip" | "new" | "returning">("all");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customers
  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/clients");
      return response.json();
    },
  });

  // Fetch customer bookings
  const { data: customerBookings = [] } = useQuery({
    queryKey: ["/api/bookings", selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      const response = await apiRequest("GET", `/api/bookings/client/${selectedCustomer.id}`);
      return response.json();
    },
    enabled: !!selectedCustomer,
  });

  // Fetch customer photos
  const { data: customerPhotos = [] } = useQuery({
    queryKey: ["/api/client-photos", selectedCustomer?.id],
    queryFn: async () => {
      if (!selectedCustomer) return [];
      const response = await apiRequest("GET", `/api/client-photos/${selectedCustomer.id}`);
      return response.json();
    },
    enabled: !!selectedCustomer,
  });

  // Fetch services for recommendations
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/services");
      return response.json();
    },
  });

  // Fetch barbers
  const { data: barbers = [] } = useQuery({
    queryKey: ["/api/barbers"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/barbers");
      return response.json();
    },
  });

  // Create customer mutation
  const createCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      const response = await apiRequest("POST", "/api/clients", customerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      setShowNewCustomerDialog(false);
      toast({
        title: "Customer Added",
        description: "New customer has been successfully added to the system.",
      });
    },
  });

  // Update customer mutation
  const updateCustomerMutation = useMutation({
    mutationFn: async ({ id, ...customerData }: any) => {
      const response = await apiRequest("PUT", `/api/clients/${id}`, customerData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      toast({
        title: "Customer Updated",
        description: "Customer information has been successfully updated.",
      });
    },
  });

  // Upload photo mutation
  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ clientId, formData }: { clientId: number; formData: FormData }) => {
      const response = await apiRequest("POST", `/api/client-photos/${clientId}`, formData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-photos", selectedCustomer?.id] });
      toast({
        title: "Photo Uploaded",
        description: "Photo has been added to customer's gallery.",
      });
    },
  });

  const filteredCustomers = customers.filter((customer: Client) => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.phone.includes(searchTerm) ||
                         (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (!matchesSearch) return false;
    
    switch (filterBy) {
      case "vip":
        return (customer.totalSpent || 0) > 50000; // $500+
      case "new":
        return (customer.totalVisits || 0) <= 1;
      case "returning":
        return (customer.totalVisits || 0) > 5;
      default:
        return true;
    }
  });

  const getCustomerTier = (customer: Client) => {
    const spent = customer.totalSpent || 0;
    if (spent > 100000) return { tier: "Platinum", color: "bg-purple-100 text-purple-800" };
    if (spent > 50000) return { tier: "Gold", color: "bg-yellow-100 text-yellow-800" };
    if (spent > 25000) return { tier: "Silver", color: "bg-gray-100 text-gray-800" };
    return { tier: "Bronze", color: "bg-amber-100 text-amber-800" };
  };

  const getServiceRecommendations = (customer: Client) => {
    if (!customerBookings.length) return services.slice(0, 3);
    
    // Get frequently booked services
    const serviceCount = customerBookings.reduce((acc: any, booking: Booking) => {
      acc[booking.serviceId] = (acc[booking.serviceId] || 0) + 1;
      return acc;
    }, {});
    
    const frequentServices = Object.entries(serviceCount)
      .sort(([,a], [,b]) => (b as number) - (a as number))
      .slice(0, 2)
      .map(([serviceId]) => services.find(s => s.id === parseInt(serviceId)))
      .filter(Boolean);
    
    // Add complementary services
    const recommendations = [...frequentServices];
    if (recommendations.length < 3) {
      const otherServices = services.filter(s => !recommendations.some(r => r.id === s.id));
      recommendations.push(...otherServices.slice(0, 3 - recommendations.length));
    }
    
    return recommendations;
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedCustomer) {
      const formData = new FormData();
      formData.append("photo", file);
      formData.append("description", "Customer photo");
      uploadPhotoMutation.mutate({ clientId: selectedCustomer.id, formData });
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Customers</SelectItem>
              <SelectItem value="vip">VIP ($500+)</SelectItem>
              <SelectItem value="new">New Customers</SelectItem>
              <SelectItem value="returning">Frequent Visitors</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Dialog open={showNewCustomerDialog} onOpenChange={setShowNewCustomerDialog}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700">
              <User className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
            </DialogHeader>
            <NewCustomerForm 
              onSubmit={createCustomerMutation.mutate}
              isLoading={createCustomerMutation.isPending}
              barbers={barbers}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Customers ({filteredCustomers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-gray-500">Loading customers...</div>
                ) : filteredCustomers.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">No customers found</div>
                ) : (
                  filteredCustomers.map((customer: Client) => {
                    const tier = getCustomerTier(customer);
                    return (
                      <div
                        key={customer.id}
                        onClick={() => setSelectedCustomer(customer)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedCustomer?.id === customer.id ? 'bg-teal-50 border-l-4 border-l-teal-500' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-gray-900 truncate">{customer.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center gap-2">
                              <Phone className="w-3 h-3" />
                              {customer.phone}
                            </p>
                            {customer.email && (
                              <p className="text-sm text-gray-500 flex items-center gap-2">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={tier.color}>{tier.tier}</Badge>
                            <span className="text-xs text-gray-500">
                              {customer.totalVisits || 0} visits
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Details */}
        <div className="lg:col-span-2">
          {selectedCustomer ? (
            <CustomerDetailsView
              customer={selectedCustomer}
              bookings={customerBookings}
              photos={customerPhotos}
              services={services}
              barbers={barbers}
              recommendations={getServiceRecommendations(selectedCustomer)}
              onUpdate={updateCustomerMutation.mutate}
              onPhotoUpload={handlePhotoUpload}
              isUpdating={updateCustomerMutation.isPending}
              formatCurrency={formatCurrency}
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-96">
                <div className="text-center text-gray-500">
                  <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Select a customer to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// New Customer Form Component
function NewCustomerForm({ onSubmit, isLoading, barbers }: any) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    preferredBarberId: "",
    preferences: "",
    notes: "",
    birthday: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      preferredBarberId: formData.preferredBarberId ? parseInt(formData.preferredBarberId) : null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="phone">Phone *</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="preferredBarber">Preferred Barber</Label>
        <Select value={formData.preferredBarberId} onValueChange={(value) => setFormData({ ...formData, preferredBarberId: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select a barber" />
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
        <Label htmlFor="birthday">Birthday</Label>
        <Input
          id="birthday"
          type="date"
          value={formData.birthday}
          onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="preferences">Preferences</Label>
        <Textarea
          id="preferences"
          value={formData.preferences}
          onChange={(e) => setFormData({ ...formData, preferences: e.target.value })}
          placeholder="Hair type, styling preferences, etc."
        />
      </div>
      
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          placeholder="Additional notes about the customer"
        />
      </div>
      
      <Button type="submit" disabled={isLoading} className="w-full">
        {isLoading ? "Adding Customer..." : "Add Customer"}
      </Button>
    </form>
  );
}

// Customer Details View Component
function CustomerDetailsView({ 
  customer, 
  bookings, 
  photos, 
  services, 
  barbers, 
  recommendations, 
  onUpdate, 
  onPhotoUpload, 
  isUpdating, 
  formatCurrency 
}: any) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(customer);

  const tier = customer.totalSpent > 100000 ? "Platinum" : 
               customer.totalSpent > 50000 ? "Gold" : 
               customer.totalSpent > 25000 ? "Silver" : "Bronze";

  const handleSave = () => {
    onUpdate({ id: customer.id, ...editData });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-xl">{customer.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={
                  tier === "Platinum" ? "bg-purple-100 text-purple-800" :
                  tier === "Gold" ? "bg-yellow-100 text-yellow-800" :
                  tier === "Silver" ? "bg-gray-100 text-gray-800" :
                  "bg-amber-100 text-amber-800"
                }>
                  {tier} Member
                </Badge>
                <Badge variant="outline">
                  {customer.loyaltyPoints || 0} points
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Edit className="w-4 h-4 mr-2" />
            {isEditing ? "Cancel" : "Edit"}
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="recommendations">Suggestions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-teal-50 rounded-lg">
                <div className="text-2xl font-bold text-teal-600">{customer.totalVisits || 0}</div>
                <div className="text-sm text-gray-600">Total Visits</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(customer.totalSpent || 0)}
                </div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{customer.loyaltyPoints || 0}</div>
                <div className="text-sm text-gray-600">Loyalty Points</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {customer.lastVisit ? 
                    Math.floor((Date.now() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24))
                    : "N/A"
                  }
                </div>
                <div className="text-sm text-gray-600">Days Since Last Visit</div>
              </div>
            </div>
            
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-phone">Phone</Label>
                    <Input
                      id="edit-phone"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-email">Email</Label>
                    <Input
                      id="edit-email"
                      value={editData.email || ""}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-preferences">Preferences</Label>
                  <Textarea
                    id="edit-preferences"
                    value={editData.preferences || ""}
                    onChange={(e) => setEditData({ ...editData, preferences: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-notes">Notes</Label>
                  <Textarea
                    id="edit-notes"
                    value={editData.notes || ""}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                  />
                </div>
                <Button onClick={handleSave} disabled={isUpdating}>
                  {isUpdating ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Contact Information</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4" />
                      {customer.phone}
                    </div>
                    {customer.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4" />
                        {customer.email}
                      </div>
                    )}
                    {customer.birthday && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        Birthday: {new Date(customer.birthday).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Preferences</h4>
                    <p className="text-sm text-gray-600">
                      {customer.preferences || "No preferences recorded"}
                    </p>
                  </div>
                </div>
                
                {customer.notes && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Notes</h4>
                    <p className="text-sm text-gray-600">{customer.notes}</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history">
            <div className="space-y-4">
              {bookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No booking history available</p>
                </div>
              ) : (
                bookings.map((booking: Booking) => {
                  const service = services.find((s: Service) => s.id === booking.serviceId);
                  const barber = barbers.find((b: Barber) => b.id === booking.barberId);
                  
                  return (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{service?.name || "Unknown Service"}</h4>
                        <p className="text-sm text-gray-600">
                          with {barber?.name || "Unknown Barber"} • {booking.date} at {booking.time}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">Status: {booking.status}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-green-600">
                          {formatCurrency(service?.price || 0)}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="photos">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Photo Gallery</h3>
                <div className="relative">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onPhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload">
                    <Button variant="outline" size="sm" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Add Photo
                    </Button>
                  </label>
                </div>
              </div>
              
              {photos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No photos uploaded yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo: ClientPhoto) => (
                    <div key={photo.id} className="relative group">
                      <img
                        src={photo.photoUrl}
                        alt={photo.description || "Customer photo"}
                        className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition-all duration-200 flex items-center justify-center">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                      {photo.description && (
                        <p className="text-xs text-gray-600 mt-1 truncate">{photo.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="recommendations">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Recommended Services</h3>
              <div className="grid gap-4">
                {recommendations.map((service: Service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-teal-300 transition-colors">
                    <div className="flex-1">
                      <h4 className="font-medium">{service.name}</h4>
                      <p className="text-sm text-gray-600">{service.duration} minutes</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-teal-600">
                        {formatCurrency(service.price)}
                      </span>
                      <Button size="sm">
                        Book Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}