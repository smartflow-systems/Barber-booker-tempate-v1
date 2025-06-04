import { useQuery } from "@tanstack/react-query";
import { BarberProfile } from "@/components/barber-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import type { Barber } from "@shared/schema";

export default function Barbers() {
  const { data: barbers = [], isLoading } = useQuery<Barber[]>({
    queryKey: ["/api/barbers"],
  });

  return (
    <div className="min-h-screen bg-transparent">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="ghost" className="mb-4 hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Booking
            </Button>
          </Link>
          
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100/50 rounded-t-lg">
              <CardTitle className="text-3xl text-slate-900 flex items-center">
                <Users className="text-blue-600 mr-3" />
                Meet Our Expert Barbers
              </CardTitle>
              <p className="text-slate-700 mt-2">
                Our talented team of professionals is here to give you the perfect look
              </p>
            </CardHeader>
          </Card>
        </div>

        {/* Barber Profiles Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-96 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {barbers.map((barber) => (
              <BarberProfile
                key={barber.id}
                barber={barber}
                showFullProfile={true}
              />
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-slate-900 mb-4">
                Ready to Book Your Appointment?
              </h3>
              <p className="text-slate-600 mb-6">
                Choose your preferred barber and schedule your appointment today
              </p>
              <Link href="/">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg">
                  Book Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}