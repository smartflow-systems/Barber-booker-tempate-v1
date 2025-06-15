import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  CreditCard, 
  DollarSign, 
  Package, 
  Gift, 
  Star, 
  Percent, 
  TrendingUp,
  Receipt,
  Heart,
  Clock,
  Check
} from "lucide-react";
import type { Client, Booking, Service, Package as ServicePackage } from "@shared/schema";

if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface StripePaymentProps {
  booking?: Booking;
  client?: Client;
  onPaymentComplete?: (result: any) => void;
}

export function StripePayment({ booking, client, onPaymentComplete }: StripePaymentProps) {
  return (
    <Elements stripe={stripePromise}>
      <PaymentInterface 
        booking={booking} 
        client={client} 
        onPaymentComplete={onPaymentComplete} 
      />
    </Elements>
  );
}

function PaymentInterface({ booking, client, onPaymentComplete }: StripePaymentProps) {
  const [paymentType, setPaymentType] = useState<"deposit" | "full" | "package" | "tip">("deposit");
  const [tipAmount, setTipAmount] = useState("");
  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [customTip, setCustomTip] = useState("");
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();

  // Fetch service packages
  const { data: packages = [] } = useQuery({
    queryKey: ["/api/packages"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/packages");
      return response.json();
    },
  });

  // Fetch services
  const { data: services = [] } = useQuery({
    queryKey: ["/api/services"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/services");
      return response.json();
    },
  });

  // Create payment intent mutation
  const createPaymentMutation = useMutation({
    mutationFn: async (paymentData: any) => {
      const response = await apiRequest("POST", "/api/create-payment-intent", paymentData);
      return response.json();
    },
  });

  // Process tip mutation
  const processTipMutation = useMutation({
    mutationFn: async (tipData: any) => {
      const response = await apiRequest("POST", "/api/process-tip", tipData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      toast({
        title: "Tip Processed",
        description: "Thank you! The tip has been processed successfully.",
      });
    },
  });

  // Purchase package mutation
  const purchasePackageMutation = useMutation({
    mutationFn: async (packageData: any) => {
      const response = await apiRequest("POST", "/api/purchase-package", packageData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/client-packages"] });
      toast({
        title: "Package Purchased",
        description: "Package has been successfully purchased and added to your account.",
      });
    },
  });

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      toast({
        title: "Payment Error",
        description: "Stripe has not loaded properly. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      toast({
        title: "Payment Error",
        description: "Card information is required.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      let amount = 0;
      let description = "";

      // Calculate amount based on payment type
      switch (paymentType) {
        case "deposit":
          const service = services.find((s: Service) => s.id === booking?.serviceId);
          amount = Math.round((service?.price || 0) * 0.3); // 30% deposit
          description = `Deposit for ${service?.name || "service"}`;
          break;
        case "full":
          const fullService = services.find((s: Service) => s.id === booking?.serviceId);
          amount = fullService?.price || 0;
          description = `Full payment for ${fullService?.name || "service"}`;
          break;
        case "package":
          const selectedPkg = packages.find((p: ServicePackage) => p.id.toString() === selectedPackage);
          amount = selectedPkg?.price || 0;
          description = `Package: ${selectedPkg?.name || "service package"}`;
          break;
        case "tip":
          amount = parseInt(customTip || tipAmount) * 100; // Convert to cents
          description = "Tip for barber";
          break;
      }

      if (amount <= 0) {
        toast({
          title: "Payment Error",
          description: "Please select a valid amount.",
          variant: "destructive",
        });
        setProcessing(false);
        return;
      }

      // Create payment intent
      const { clientSecret } = await createPaymentMutation.mutateAsync({
        amount,
        currency: "usd",
        description,
        bookingId: booking?.id,
        clientId: client?.id,
        paymentType,
      });

      // Confirm payment
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: client?.name || "Customer",
            email: client?.email || undefined,
            phone: client?.phone || undefined,
          },
        },
      });

      if (error) {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive",
        });
      } else if (paymentIntent?.status === "succeeded") {
        toast({
          title: "Payment Successful",
          description: `${description} has been processed successfully.`,
        });
        
        // Handle post-payment actions
        if (paymentType === "package" && selectedPackage) {
          await purchasePackageMutation.mutateAsync({
            packageId: parseInt(selectedPackage),
            clientId: client?.id,
            paymentIntentId: paymentIntent.id,
          });
        } else if (paymentType === "tip") {
          await processTipMutation.mutateAsync({
            amount,
            bookingId: booking?.id,
            clientId: client?.id,
            barberId: booking?.barberId,
            paymentIntentId: paymentIntent.id,
          });
        }

        onPaymentComplete?.(paymentIntent);
      }
    } catch (error: any) {
      toast({
        title: "Payment Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getPaymentAmount = () => {
    switch (paymentType) {
      case "deposit":
        const service = services.find((s: Service) => s.id === booking?.serviceId);
        return Math.round((service?.price || 0) * 0.3);
      case "full":
        const fullService = services.find((s: Service) => s.id === booking?.serviceId);
        return fullService?.price || 0;
      case "package":
        const selectedPkg = packages.find((p: ServicePackage) => p.id.toString() === selectedPackage);
        return selectedPkg?.price || 0;
      case "tip":
        return (parseInt(customTip || tipAmount) || 0) * 100;
      default:
        return 0;
    }
  };

  const tipPresets = [
    { label: "15%", value: "15" },
    { label: "18%", value: "18" },
    { label: "20%", value: "20" },
    { label: "25%", value: "25" },
  ];

  const calculateTipAmount = (percentage: string) => {
    if (!booking) return 0;
    const service = services.find((s: Service) => s.id === booking.serviceId);
    return Math.round((service?.price || 0) * (parseInt(percentage) / 100));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="w-5 h-5" />
          Payment Processing
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={paymentType} onValueChange={(value: any) => setPaymentType(value)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="deposit" className="text-xs">Deposit</TabsTrigger>
            <TabsTrigger value="full" className="text-xs">Full Payment</TabsTrigger>
            <TabsTrigger value="package" className="text-xs">Packages</TabsTrigger>
            <TabsTrigger value="tip" className="text-xs">Add Tip</TabsTrigger>
          </TabsList>
          
          <TabsContent value="deposit" className="space-y-4">
            <div className="text-center p-6 bg-teal-50 rounded-lg">
              <DollarSign className="w-12 h-12 mx-auto text-teal-600 mb-2" />
              <h3 className="text-lg font-semibold text-teal-800">Service Deposit</h3>
              <p className="text-sm text-teal-600 mb-4">Secure your appointment with a 30% deposit</p>
              {booking && (
                <div className="text-2xl font-bold text-teal-700">
                  {formatCurrency(getPaymentAmount())}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="full" className="space-y-4">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <Receipt className="w-12 h-12 mx-auto text-green-600 mb-2" />
              <h3 className="text-lg font-semibold text-green-800">Full Payment</h3>
              <p className="text-sm text-green-600 mb-4">Pay the complete service amount</p>
              {booking && (
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(getPaymentAmount())}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="package" className="space-y-4">
            <div className="space-y-4">
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto text-purple-600 mb-2" />
                <h3 className="text-lg font-semibold text-purple-800">Service Packages</h3>
                <p className="text-sm text-purple-600">Save with our prepaid packages</p>
              </div>
              
              <div className="grid gap-3">
                {packages.map((pkg: ServicePackage) => (
                  <div
                    key={pkg.id}
                    onClick={() => setSelectedPackage(pkg.id.toString())}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPackage === pkg.id.toString()
                        ? "border-purple-500 bg-purple-50"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="text-left">
                        <h4 className="font-semibold">{pkg.name}</h4>
                        <p className="text-sm text-gray-600">{pkg.sessions} sessions</p>
                        {pkg.discount && (
                          <Badge className="mt-1 bg-orange-100 text-orange-800">
                            {pkg.discount}% off
                          </Badge>
                        )}
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-purple-600">
                          {formatCurrency(pkg.price)}
                        </div>
                        {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                          <div className="text-sm text-gray-500 line-through">
                            {formatCurrency(pkg.originalPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="tip" className="space-y-4">
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto text-red-500 mb-2" />
              <h3 className="text-lg font-semibold text-red-800">Add Tip</h3>
              <p className="text-sm text-red-600">Show appreciation for great service</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Quick tip amounts</Label>
                <div className="grid grid-cols-4 gap-2">
                  {tipPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant={tipAmount === preset.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        setTipAmount(preset.value);
                        setCustomTip("");
                      }}
                      className="flex flex-col h-auto py-2"
                    >
                      <span className="text-xs">{preset.label}</span>
                      <span className="text-xs font-normal">
                        {formatCurrency(calculateTipAmount(preset.value))}
                      </span>
                    </Button>
                  ))}
                </div>
              </div>
              
              <div>
                <Label htmlFor="custom-tip">Custom tip amount ($)</Label>
                <Input
                  id="custom-tip"
                  type="number"
                  placeholder="Enter amount"
                  value={customTip}
                  onChange={(e) => {
                    setCustomTip(e.target.value);
                    setTipAmount("");
                  }}
                  min="0"
                  step="0.01"
                />
              </div>
              
              {(tipAmount || customTip) && (
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-lg font-semibold text-red-700">
                    Tip Amount: {formatCurrency(getPaymentAmount())}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Payment Form */}
        <form onSubmit={handlePayment} className="space-y-6">
          <div className="p-4 border border-gray-200 rounded-lg">
            <Label className="text-sm font-medium mb-2 block">Card Information</Label>
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#424770',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                },
              }}
            />
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600">Amount to charge:</span>
              <span className="text-lg font-semibold">
                {formatCurrency(getPaymentAmount())}
              </span>
            </div>
            
            {client && (
              <div className="text-xs text-gray-500">
                Billing to: {client.name} ({client.phone})
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={processing || !stripe || getPaymentAmount() <= 0}
            className="w-full bg-teal-600 hover:bg-teal-700"
          >
            {processing ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing Payment...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Pay {formatCurrency(getPaymentAmount())}
              </div>
            )}
          </Button>
        </form>

        {/* Security Notice */}
        <div className="text-xs text-gray-500 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Check className="w-3 h-3 text-green-500" />
            Secured by Stripe
          </div>
          Your payment information is encrypted and secure.
        </div>
      </CardContent>
    </Card>
  );
}

// Package Purchase Dialog Component
export function PackagePurchaseDialog({ 
  packages, 
  onPurchase 
}: { 
  packages: ServicePackage[]; 
  onPurchase: (packageId: number) => void; 
}) {
  const [selectedPackage, setSelectedPackage] = useState<ServicePackage | null>(null);

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100">
          <Package className="w-4 h-4 mr-2" />
          View Packages
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Service Packages
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Save money with our prepaid service packages. Perfect for regular customers!
          </p>
          
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                onClick={() => setSelectedPackage(pkg)}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  selectedPackage?.id === pkg.id
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{pkg.name}</h3>
                    <p className="text-gray-600 text-sm mb-2">{pkg.description}</p>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {pkg.sessions} sessions
                      </span>
                      {pkg.validityDays && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Valid {pkg.validityDays} days
                        </span>
                      )}
                      {pkg.discount && (
                        <Badge className="bg-orange-100 text-orange-800">
                          <Percent className="w-3 h-3 mr-1" />
                          {pkg.discount}% off
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xl font-bold text-purple-600">
                      {formatCurrency(pkg.price)}
                    </div>
                    {pkg.originalPrice && pkg.originalPrice > pkg.price && (
                      <div className="text-sm text-gray-500 line-through">
                        {formatCurrency(pkg.originalPrice)}
                      </div>
                    )}
                    <div className="text-xs text-gray-500 mt-1">
                      {formatCurrency(Math.floor(pkg.price / pkg.sessions))} per session
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {selectedPackage && (
            <div className="pt-4 border-t">
              <Button
                onClick={() => onPurchase(selectedPackage.id)}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Purchase {selectedPackage.name} - {formatCurrency(selectedPackage.price)}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}