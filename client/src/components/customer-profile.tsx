import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Star, Gift, Calendar, Phone, Mail, User, History, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Client, ClientPhoto, Booking, Payment, ClientPackage } from "@shared/schema";

interface CustomerProfileProps {
  client: Client;
  onUpdate?: () => void;
}

export function CustomerProfile({ client, onUpdate }: CustomerProfileProps) {
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name,
    phone: client.phone,
    email: client.email || "",
    birthday: client.birthday || "",
    anniversary: client.anniversary || "",
    notes: client.notes || "",
    preferences: client.preferences || ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch customer photos
  const { data: photos = [] } = useQuery<ClientPhoto[]>({
    queryKey: [`/api/clients/${client.id}/photos`],
  });

  // Fetch customer booking history
  const { data: bookings = [] } = useQuery<Booking[]>({
    queryKey: [`/api/clients/${client.id}/bookings`],
  });

  // Fetch customer payments
  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: [`/api/clients/${client.id}/payments`],
  });

  // Fetch customer packages
  const { data: packages = [] } = useQuery<ClientPackage[]>({
    queryKey: [`/api/clients/${client.id}/packages`],
  });

  const updateClientMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to update client");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Customer updated successfully" });
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: [`/api/clients`] });
      onUpdate?.();
    }
  });

  const addPhotoMutation = useMutation({
    mutationFn: async (data: { photoUrl: string; description: string; serviceId?: number }) => {
      const response = await fetch(`/api/clients/${client.id}/photos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to add photo");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Photo added successfully" });
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${client.id}/photos`] });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClientMutation.mutate(formData);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  };

  const totalSpent = payments.reduce((sum, payment) => sum + payment.amount + payment.tip, 0);
  const averageTicket = bookings.length > 0 ? totalSpent / bookings.length : 0;

  return (
    <div className="space-y-6">
      {/* Customer Header */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-teal-50 to-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {client.name.charAt(0)}
              </div>
              <div>
                <CardTitle className="text-2xl text-slate-800">{client.name}</CardTitle>
                <div className="flex items-center space-x-4 text-slate-600 mt-1">
                  <span className="flex items-center"><Phone className="w-4 h-4 mr-1" />{client.phone}</span>
                  {client.email && <span className="flex items-center"><Mail className="w-4 h-4 mr-1" />{client.email}</span>}
                </div>
              </div>
            </div>
            <Button onClick={() => setEditMode(true)} variant="outline">
              <User className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{client.totalVisits}</div>
              <div className="text-sm text-slate-600">Total Visits</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{client.loyaltyPoints}</div>
              <div className="text-sm text-slate-600">Loyalty Points</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{formatPrice(totalSpent)}</div>
              <div className="text-sm text-slate-600">Total Spent</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{formatPrice(averageTicket)}</div>
              <div className="text-sm text-slate-600">Avg. Ticket</div>
            </div>
          </div>

          {client.birthday && (
            <div className="mt-4 p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center text-orange-700">
                <Gift className="w-4 h-4 mr-2" />
                <span>Birthday: {formatDate(client.birthday)}</span>
              </div>
            </div>
          )}

          {client.preferences && (
            <div className="mt-4">
              <Label className="text-sm font-semibold text-slate-700">Preferences</Label>
              <p className="text-slate-600 mt-1">{client.preferences}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Photo Gallery */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Camera className="w-5 h-5 mr-2 text-teal-600" />
              Photo Gallery
            </CardTitle>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Camera className="w-4 h-4 mr-2" />
                  Add Photo
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Customer Photo</DialogTitle>
                </DialogHeader>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  addPhotoMutation.mutate({
                    photoUrl: formData.get("photoUrl") as string,
                    description: formData.get("description") as string
                  });
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="photoUrl">Photo URL</Label>
                    <Input name="photoUrl" placeholder="https://..." required />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea name="description" placeholder="Haircut style, notes..." />
                  </div>
                  <Button type="submit" className="w-full">Add Photo</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="group relative">
                <img 
                  src={photo.photoUrl} 
                  alt={photo.description || "Customer photo"}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-end">
                  <div className="text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {photos.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No photos yet. Add some to track style preferences!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Booking History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="w-5 h-5 mr-2 text-teal-600" />
            Booking History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {bookings.slice(0, 5).map((booking) => (
              <div key={booking.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <div>
                  <div className="font-medium">{booking.date} at {booking.time}</div>
                  <div className="text-sm text-slate-600">Service ID: {booking.serviceId}</div>
                </div>
                <Badge variant={booking.status === "completed" ? "default" : "secondary"}>
                  {booking.status}
                </Badge>
              </div>
            ))}
          </div>
          {bookings.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No bookings yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Profile Dialog */}
      <Dialog open={editMode} onOpenChange={setEditMode}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Customer Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input 
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <Label htmlFor="birthday">Birthday</Label>
                <Input 
                  id="birthday"
                  type="date"
                  value={formData.birthday}
                  onChange={(e) => setFormData({...formData, birthday: e.target.value})}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="preferences">Preferences</Label>
              <Textarea 
                id="preferences"
                value={formData.preferences}
                onChange={(e) => setFormData({...formData, preferences: e.target.value})}
                placeholder="Preferred styles, allergies, special requests..."
              />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea 
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Internal notes about the customer..."
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateClientMutation.isPending}>
                {updateClientMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}