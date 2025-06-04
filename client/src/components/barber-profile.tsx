import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Phone, Instagram, Clock, Award } from "lucide-react";
import type { Barber } from "@shared/schema";

interface BarberProfileProps {
  barber: Barber;
  onSelect?: () => void;
  isSelected?: boolean;
  showFullProfile?: boolean;
}

export function BarberProfile({ barber, onSelect, isSelected, showFullProfile = false }: BarberProfileProps) {
  const getRatingNumber = (ratingString: string) => {
    const match = ratingString.match(/(\d+\.?\d*)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const getReviewCount = (ratingString: string) => {
    const match = ratingString.match(/\((\d+)\s*reviews?\)/);
    return match ? parseInt(match[1]) : 0;
  };

  const rating = getRatingNumber(barber.rating);
  const reviewCount = getReviewCount(barber.rating);

  const handleContactClick = (e: React.MouseEvent, type: 'phone' | 'instagram') => {
    e.stopPropagation();
    
    if (type === 'phone' && barber.phone) {
      window.open(`tel:${barber.phone}`, '_blank');
    } else if (type === 'instagram' && barber.instagram) {
      window.open(`https://instagram.com/${barber.instagram.replace('@', '')}`, '_blank');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < Math.floor(rating)
            ? 'text-yellow-400 fill-yellow-400'
            : index < rating
            ? 'text-yellow-400 fill-yellow-400 opacity-50'
            : 'text-gray-300'
        }`}
      />
    ));
  };

  if (showFullProfile) {
    return (
      <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm overflow-hidden">
        <div className="relative">
          {/* Profile Header with Photo */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6">
            <div className="flex items-start space-x-6">
              <div className="relative">
                <img
                  src={barber.avatar}
                  alt={barber.name}
                  className="w-24 h-24 rounded-full border-4 border-white/20 object-cover shadow-lg"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&size=96&background=3b82f6&color=ffffff`;
                  }}
                />
                <div className="absolute -bottom-2 -right-2 bg-green-500 w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              
              <div className="flex-1 text-white">
                <h2 className="text-2xl font-bold mb-1">{barber.name}</h2>
                <p className="text-blue-100 font-medium mb-2">{barber.title}</p>
                
                <div className="flex items-center space-x-4 mb-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(rating)}
                    <span className="text-blue-100 ml-2 font-medium">
                      {rating} ({reviewCount} reviews)
                    </span>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-blue-100">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{barber.experience}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4" />
                    <span className="text-sm">Verified Professional</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <CardContent className="p-6">
            {/* Bio Section */}
            {barber.bio && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-2">About</h3>
                <p className="text-slate-600 leading-relaxed">{barber.bio}</p>
              </div>
            )}
            
            {/* Specialties */}
            {barber.specialties && barber.specialties.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-3">Specialties</h3>
                <div className="flex flex-wrap gap-2">
                  {barber.specialties.map((specialty, index) => (
                    <Badge 
                      key={index} 
                      variant="secondary"
                      className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200"
                    >
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            {/* Contact Information */}
            <div className="flex flex-wrap gap-3">
              {barber.phone && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleContactClick(e, 'phone')}
                  className="flex items-center space-x-2 hover:bg-blue-50 border-blue-200"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call</span>
                </Button>
              )}
              
              {barber.instagram && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => handleContactClick(e, 'instagram')}
                  className="flex items-center space-x-2 hover:bg-pink-50 border-pink-200"
                >
                  <Instagram className="w-4 h-4" />
                  <span>{barber.instagram}</span>
                </Button>
              )}
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  // Compact profile for selection
  return (
    <Card 
      className={`cursor-pointer transition-all duration-200 shadow-lg border-0 bg-white/95 backdrop-blur-sm hover:shadow-xl ${
        isSelected 
          ? 'ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50' 
          : 'hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-indigo-50/50'
      }`}
      onClick={onSelect}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={barber.avatar}
              alt={barber.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(barber.name)}&size=64&background=3b82f6&color=ffffff`;
              }}
            />
            <div className="absolute -bottom-1 -right-1 bg-green-500 w-4 h-4 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-slate-900 truncate">{barber.name}</h3>
            <p className="text-sm text-slate-600 truncate">{barber.title}</p>
            
            <div className="flex items-center space-x-2 mt-1">
              <div className="flex items-center space-x-1">
                {renderStars(rating)}
              </div>
              <span className="text-xs text-slate-500">
                {rating} ({reviewCount})
              </span>
            </div>
            
            <div className="flex items-center space-x-1 mt-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span className="text-xs text-slate-500">{barber.experience}</span>
            </div>
            
            {/* Top specialties */}
            {barber.specialties && barber.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {barber.specialties.slice(0, 2).map((specialty, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary"
                    className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                  >
                    {specialty}
                  </Badge>
                ))}
                {barber.specialties.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600">
                    +{barber.specialties.length - 2} more
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}