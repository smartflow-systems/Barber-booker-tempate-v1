import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, CreditCard, Calendar, Phone } from "lucide-react";

interface CancellationPolicyProps {
  onAccept: () => void;
  showDeposit?: boolean;
  depositAmount?: number;
}

export function CancellationPolicy({ onAccept, showDeposit = false, depositAmount = 1000 }: CancellationPolicyProps) {
  const formatPrice = (priceInCents: number) => {
    return `$${(priceInCents / 100).toFixed(2)}`;
  };

  return (
    <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600/50 rounded-t-lg">
        <CardTitle className="text-xl text-white flex items-center">
          <AlertTriangle className="text-yellow-400 mr-2" />
          Cancellation Policy
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        {/* Main Policy */}
        <div className="space-y-4">
          <div className="flex items-start space-x-3 p-4 bg-slate-700/50 rounded-lg">
            <Clock className="w-6 h-6 text-blue-400 mt-1" />
            <div>
              <h3 className="text-white font-semibold mb-2">24-Hour Notice Required</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                To cancel or reschedule your appointment, please provide at least 24 hours advance notice. 
                This allows us to offer your time slot to other clients.
              </p>
            </div>
          </div>

          {showDeposit && (
            <div className="flex items-start space-x-3 p-4 bg-slate-700/50 rounded-lg border border-orange-800/30">
              <CreditCard className="w-6 h-6 text-orange-400 mt-1" />
              <div>
                <h3 className="text-white font-semibold mb-2">Security Deposit</h3>
                <div className="space-y-2">
                  <p className="text-slate-300 text-sm">
                    A refundable security deposit of <Badge className="bg-orange-100 text-orange-800">{formatPrice(depositAmount)}</Badge> 
                    is required to secure your appointment.
                  </p>
                  <p className="text-slate-400 text-xs">
                    This deposit will be fully refunded after your appointment or returned if you cancel with proper notice.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Policy Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Policy Details</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Cancel with 24+ hours notice</p>
                <p className="text-slate-300 text-sm">Full refund of any deposits, no penalties</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">Cancel with 2-24 hours notice</p>
                <p className="text-slate-300 text-sm">50% deposit forfeit, can reschedule once</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
              <div>
                <p className="text-white font-medium">No-show or same-day cancellation</p>
                <p className="text-slate-300 text-sm">Full deposit forfeit, service charge may apply</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Phone className="w-4 h-4 text-blue-400" />
            <h4 className="text-white font-medium">Need to Cancel or Reschedule?</h4>
          </div>
          <div className="space-y-1 text-sm text-slate-300">
            <p>Call us: <span className="text-white font-medium">(555) 123-4567</span></p>
            <p>Text us: <span className="text-white font-medium">(555) 123-4567</span></p>
            <p>Or use the manage booking link in your confirmation email</p>
          </div>
        </div>

        {/* Reminder System */}
        <div className="p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
          <div className="flex items-center space-x-2 mb-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <h4 className="text-white font-medium">Automatic Reminders</h4>
          </div>
          <p className="text-sm text-slate-300">
            We'll send you reminder notifications 24 hours and 2 hours before your appointment 
            to help prevent missed bookings.
          </p>
        </div>

        {/* Why We Have This Policy */}
        <div className="space-y-2">
          <h4 className="text-white font-medium">Why This Policy Exists</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            This policy helps us maintain fair scheduling for all clients and ensures our barbers can 
            provide the best service. No-shows and last-minute cancellations affect other customers 
            who could have booked that time slot.
          </p>
        </div>

        <Button 
          onClick={onAccept}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          I Understand and Accept This Policy
        </Button>
      </CardContent>
    </Card>
  );
}