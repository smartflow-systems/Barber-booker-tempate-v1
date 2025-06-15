import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, DollarSign, Receipt, Zap, Gift, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Payment, Booking, Client, Package as ServicePackage, ClientPackage } from "@shared/schema";

interface PaymentProcessingProps {
  booking?: Booking;
  client?: Client;
}

export function PaymentProcessing({ booking, client }: PaymentProcessingProps) {
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [tipAmount, setTipAmount] = useState(0);
  const [showPackageDialog, setShowPackageDialog] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch available packages
  const { data: packages = [] } = useQuery<ServicePackage[]>({
    queryKey: ["/api/packages"],
  });

  // Fetch client packages if client is provided
  const { data: clientPackages = [] } = useQuery<ClientPackage[]>({
    queryKey: client ? [`/api/clients/${client.id}/packages`] : [],
    enabled: !!client,
  });

  // Fetch payment history
  const { data: payments = [] } = useQuery<Payment[]>({
    queryKey: booking ? [`/api/bookings/${booking.id}/payments`] : [],
    enabled: !!booking,
  });

  const processPaymentMutation = useMutation({
    mutationFn: async (data: {
      bookingId: number;
      clientId: number;
      barberId: number;
      amount: number;
      tip: number;
      method: string;
    }) => {
      const response = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to process payment");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Payment processed successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
    }
  });

  const purchasePackageMutation = useMutation({
    mutationFn: async (data: {
      clientId: number;
      packageId: number;
      paymentMethod: string;
    }) => {
      const response = await fetch("/api/packages/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error("Failed to purchase package");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Package purchased successfully" });
      setShowPackageDialog(false);
      queryClient.invalidateQueries({ queryKey: [`/api/clients/${client?.id}/packages`] });
    }
  });

  const formatPrice = (cents: number) => {
    return (cents / 100).toLocaleString("en-US", {
      style: "currency",
      currency: "USD"
    });
  };

  const handlePayment = () => {
    if (!booking || !client) return;

    processPaymentMutation.mutate({
      bookingId: booking.id,
      clientId: client.id,
      barberId: booking.barberId,
      amount: booking.depositAmount || 0,
      tip: tipAmount * 100, // convert to cents
      method: paymentMethod
    });
  };

  const handlePackagePurchase = () => {
    if (!client || !selectedPackage) return;

    purchasePackageMutation.mutate({
      clientId: client.id,
      packageId: selectedPackage,
      paymentMethod: paymentMethod
    });
  };

  const getTipPresets = (baseAmount: number) => {
    return [
      { percentage: 15, amount: Math.round(baseAmount * 0.15) },
      { percentage: 18, amount: Math.round(baseAmount * 0.18) },
      { percentage: 20, amount: Math.round(baseAmount * 0.20) },
      { percentage: 25, amount: Math.round(baseAmount * 0.25) }
    ];
  };

  const baseAmount = booking?.depositAmount ? booking.depositAmount / 100 : 0;
  const tipPresets = getTipPresets(baseAmount);

  return (
    <div className="space-y-6">
      {/* Payment Processing */}
      {booking && (
        <Card>
          <CardHeader className="bg-gradient-to-r from-teal-50 to-slate-50">
            <CardTitle className="flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-teal-600" />
              Process Payment
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              {/* Service Amount */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Service Amount</span>
                  <span className="text-xl font-bold text-teal-600">
                    {formatPrice(booking.depositAmount || 0)}
                  </span>
                </div>
                <div className="text-sm text-slate-600">
                  Booking #{booking.id} - {booking.date} at {booking.time}
                </div>
              </div>

              {/* Tip Selection */}
              <div>
                <Label className="text-sm font-semibold text-slate-700">Add Tip</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {tipPresets.map((preset) => (
                    <Button
                      key={preset.percentage}
                      variant={tipAmount === preset.amount ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTipAmount(preset.amount)}
                      className="text-xs"
                    >
                      {preset.percentage}%
                      <br />
                      ${preset.amount}
                    </Button>
                  ))}
                </div>
                <div className="mt-2">
                  <Input
                    type="number"
                    placeholder="Custom tip amount"
                    value={tipAmount}
                    onChange={(e) => setTipAmount(Number(e.target.value))}
                    className="text-center"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <Label className="text-sm font-semibold text-slate-700">Payment Method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger className="mt-2">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="card">Credit/Debit Card</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="stripe">Stripe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Total */}
              <div className="p-4 bg-teal-50 rounded-lg border-2 border-teal-200">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Total Amount</span>
                  <span className="text-2xl font-bold text-teal-600">
                    {formatPrice((booking.depositAmount || 0) + (tipAmount * 100))}
                  </span>
                </div>
              </div>

              <Button 
                onClick={handlePayment}
                disabled={processPaymentMutation.isPending}
                className="w-full py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700"
              >
                {processPaymentMutation.isPending ? (
                  "Processing..."
                ) : (
                  <>
                    <Receipt className="w-4 h-4 mr-2" />
                    Process Payment
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Package Sales */}
      <Card>
        <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Package className="w-5 h-5 mr-2 text-orange-600" />
              Service Packages
            </div>
            <Dialog open={showPackageDialog} onOpenChange={setShowPackageDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Gift className="w-4 h-4 mr-2" />
                  Sell Package
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Sell Service Package</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {packages.map((pkg) => (
                      <div
                        key={pkg.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedPackage === pkg.id
                            ? "border-teal-500 bg-teal-50"
                            : "border-slate-200 hover:border-teal-300"
                        }`}
                        onClick={() => setSelectedPackage(pkg.id)}
                      >
                        <div className="font-medium text-lg">{pkg.name}</div>
                        <div className="text-sm text-slate-600 mt-1">{pkg.description}</div>
                        <div className="flex justify-between items-center mt-3">
                          <span className="text-sm text-slate-500">
                            {pkg.totalSessions} sessions
                          </span>
                          <span className="text-lg font-bold text-teal-600">
                            {formatPrice(pkg.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {selectedPackage && (
                    <div className="space-y-3">
                      <div>
                        <Label>Payment Method</Label>
                        <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="card">Credit/Debit Card</SelectItem>
                            <SelectItem value="cash">Cash</SelectItem>
                            <SelectItem value="stripe">Stripe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={handlePackagePurchase}
                        disabled={purchasePackageMutation.isPending}
                        className="w-full"
                      >
                        {purchasePackageMutation.isPending ? "Processing..." : "Purchase Package"}
                      </Button>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {client && clientPackages.length > 0 ? (
            <div className="space-y-3">
              <h4 className="font-medium text-slate-700">Active Packages</h4>
              {clientPackages.map((clientPkg) => {
                const pkg = packages.find(p => p.id === clientPkg.packageId);
                if (!pkg) return null;

                const sessionsRemaining = pkg.totalSessions - clientPkg.sessionsUsed;
                const progressPercentage = (clientPkg.sessionsUsed / pkg.totalSessions) * 100;

                return (
                  <div key={clientPkg.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">{pkg.name}</span>
                      <Badge variant={sessionsRemaining > 0 ? "default" : "secondary"}>
                        {sessionsRemaining} sessions left
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-teal-500 h-2 rounded-full transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {clientPkg.sessionsUsed} of {pkg.totalSessions} sessions used
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No active packages</p>
              <p className="text-xs mt-1">Sell packages to increase customer loyalty</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment History */}
      {booking && payments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-teal-600" />
              Payment History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {payments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div>
                    <div className="font-medium">{formatPrice(payment.amount + payment.tip)}</div>
                    <div className="text-sm text-slate-600">
                      {payment.method} • {payment.createdAt ? new Date(payment.createdAt).toLocaleDateString() : ""}
                    </div>
                  </div>
                  <Badge variant={payment.status === "completed" ? "default" : "secondary"}>
                    {payment.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}