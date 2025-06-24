import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Send, X, User, Bot } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Service, Barber } from "@shared/schema";

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface BookingData {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  date?: string;
  time?: string;
  serviceId?: number;
  barberId?: number;
}

export function BookingAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState("");
  const [bookingData, setBookingData] = useState<BookingData>({});
  const [conversationState, setConversationState] = useState<'greeting' | 'collecting' | 'confirming' | 'complete'>('greeting');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch services and barbers for booking
  const { data: services = [] } = useQuery<Service[]>({
    queryKey: ["/api/services"],
    enabled: isOpen,
  });

  const { data: barbers = [] } = useQuery<Barber[]>({
    queryKey: ["/api/barbers"],
    enabled: isOpen,
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: (data) => {
      addAssistantMessage(`You're all set! 💈 See you on ${data.date} at ${data.time} for your ${getServiceName(data.serviceId)}. Confirmation details have been sent to your email.`);
      setConversationState('complete');
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
    },
    onError: (error) => {
      addAssistantMessage("Sorry, there was an issue creating your booking. Please try again or use the manual booking link.");
    }
  });

  const getServiceName = (serviceId: number) => {
    const service = (services as Service[]).find(s => s.id === serviceId);
    return service?.name || "service";
  };

  const addMessage = (type: 'user' | 'assistant', content: string) => {
    const newMessage: Message = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const addAssistantMessage = (content: string) => {
    addMessage('assistant', content);
  };

  const addUserMessage = (content: string) => {
    addMessage('user', content);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      addAssistantMessage("Hi there! 👋 I'm your BarberFlow Systems expert assistant. I'm here to help with:\n\n💈 **Booking appointments** - Quick & easy scheduling\n🎯 **Service recommendations** - Find your perfect style\n💰 **Pricing information** - Transparent costs\n⏰ **Hours & availability** - When we're open\n📍 **Location & contact** - How to find us\n💡 **Professional styling advice** - Expert tips\n\nWhat can I help you with today? Just ask me anything about our barbershop services! ✂️");
    }
  }, [isOpen, messages.length]);

  const detectUserIntent = (message: string): 'manual_booking' | 'assisted_booking' | 'provide_info' | 'general_question' | 'service_inquiry' | 'pricing' | 'hours' | 'location' | 'unknown' => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('link') || lowerMessage.includes('manual') || lowerMessage.includes('myself')) {
      return 'manual_booking';
    }
    
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('help me')) {
      return 'assisted_booking';
    }

    // Service and styling questions
    if (lowerMessage.includes('haircut') || lowerMessage.includes('beard') || lowerMessage.includes('trim') || 
        lowerMessage.includes('style') || lowerMessage.includes('service') || lowerMessage.includes('what do you offer')) {
      return 'service_inquiry';
    }

    // Pricing questions
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || 
        lowerMessage.includes('fee') || lowerMessage.includes('charge')) {
      return 'pricing';
    }

    // Hours and availability
    if (lowerMessage.includes('hours') || lowerMessage.includes('open') || lowerMessage.includes('close') || 
        lowerMessage.includes('when') || lowerMessage.includes('available')) {
      return 'hours';
    }

    // Location and contact
    if (lowerMessage.includes('location') || lowerMessage.includes('address') || lowerMessage.includes('where') || 
        lowerMessage.includes('contact') || lowerMessage.includes('phone')) {
      return 'location';
    }

    // General questions
    if (lowerMessage.includes('?') || lowerMessage.includes('how') || lowerMessage.includes('what') || 
        lowerMessage.includes('why') || lowerMessage.includes('tell me')) {
      return 'general_question';
    }
    
    // Check if user is providing booking information
    if (conversationState === 'collecting') {
      return 'provide_info';
    }
    
    return 'unknown';
  };

  const extractBookingInfo = (message: string) => {
    const nameMatch = message.match(/(?:my name is|i'm|call me)\s+([a-zA-Z\s]+)/i);
    const phoneMatch = message.match(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4})/);
    const emailMatch = message.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    const dateMatch = message.match(/(\d{1,2}\/\d{1,2}\/\d{4}|\d{4}-\d{2}-\d{2}|tomorrow|today|next week)/i);
    const timeMatch = message.match(/(\d{1,2}:\d{2}\s?(?:am|pm)?|\d{1,2}\s?(?:am|pm))/i);
    
    const updates: Partial<BookingData> = {};
    
    if (nameMatch) updates.customerName = nameMatch[1].trim();
    if (phoneMatch) updates.customerPhone = phoneMatch[1];
    if (emailMatch) updates.customerEmail = emailMatch[1];
    if (dateMatch) {
      // Convert common date formats
      let dateStr = dateMatch[1].toLowerCase();
      if (dateStr === 'tomorrow') {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        updates.date = tomorrow.toISOString().split('T')[0];
      } else if (dateStr === 'today') {
        updates.date = new Date().toISOString().split('T')[0];
      } else {
        updates.date = dateStr;
      }
    }
    if (timeMatch) updates.time = timeMatch[1];
    
    // Service detection
    const lowerMessage = message.toLowerCase();
    const serviceList = services as Service[];
    if (lowerMessage.includes('haircut') && !lowerMessage.includes('beard')) {
      updates.serviceId = serviceList.find(s => s.name.toLowerCase().includes('haircut'))?.id;
    } else if (lowerMessage.includes('beard') && !lowerMessage.includes('haircut')) {
      updates.serviceId = serviceList.find(s => s.name.toLowerCase().includes('beard'))?.id;
    } else if (lowerMessage.includes('both') || (lowerMessage.includes('haircut') && lowerMessage.includes('beard'))) {
      updates.serviceId = serviceList.find(s => s.name.toLowerCase().includes('both') || s.name.toLowerCase().includes('combo'))?.id;
    }

    return updates;
  };

  const getMissingInfo = () => {
    const missing = [];
    if (!bookingData.customerName) missing.push("name");
    if (!bookingData.customerPhone) missing.push("phone number");
    if (!bookingData.customerEmail) missing.push("email");
    if (!bookingData.date) missing.push("preferred date");
    if (!bookingData.time) missing.push("preferred time");
    if (!bookingData.serviceId) missing.push("service type");
    return missing;
  };

  const getServiceInfo = () => {
    const serviceList = services as Service[];
    if (serviceList.length === 0) {
      return "💈 **Our Services:**\n\n• Classic Haircuts - Traditional and modern styles\n• Beard Trimming & Styling - Professional grooming\n• Hot Towel Treatments - Luxury experience\n• Hair Washing & Conditioning - Complete care\n\nAll services include a consultation to ensure you get exactly what you're looking for! ✂️";
    }
    
    return `💈 **Our Services:**\n\n${serviceList.map(service => 
      `• **${service.name}** - ${service.duration}min appointment`
    ).join('\n')}\n\n✨ All services include professional consultation and styling advice!`;
  };

  const getPricingInfo = () => {
    const serviceList = services as Service[];
    if (serviceList.length === 0) {
      return "💰 **Pricing:**\n\n• Classic Haircut: $35-45\n• Beard Trim: $25-35\n• Combo Package: $55-70\n• Premium Services: $75+\n\n*Prices may vary based on length and complexity. We'll discuss pricing during your consultation! 💳";
    }
    
    return `💰 **Our Pricing:**\n\n${serviceList.map(service => 
      `• **${service.name}**: Starting from $${service.price || '35'}`
    ).join('\n')}\n\n*Final pricing confirmed during consultation based on your specific needs! 💳`;
  };

  const getHoursInfo = () => {
    return "⏰ **Business Hours:**\n\n• Monday - Friday: 9:00 AM - 7:00 PM\n• Saturday: 8:00 AM - 6:00 PM\n• Sunday: 10:00 AM - 4:00 PM\n\n📅 We're open 7 days a week to serve you! Last appointments are scheduled 1 hour before closing.";
  };

  const getLocationInfo = () => {
    return "📍 **Location & Contact:**\n\n• **Address:** BarberFlow Systems Professional Barbershop\n• **Phone:** (555) 123-FLOW\n• **Email:** info@barberflowsystems.com\n\n🚗 Free parking available\n🚌 Public transport accessible\n♿ Wheelchair accessible facility\n\nYou can also book online 24/7 through our booking system!";
  };

  const getGeneralAdvice = (message: string) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('face shape') || lowerMessage.includes('what style')) {
      return "🎯 **Choosing the Right Style:**\n\n• **Round Face:** Angular cuts, side parts, volume on top\n• **Square Face:** Softer lines, textured styles\n• **Oval Face:** Most styles work great!\n• **Long Face:** Fuller sides, horizontal lines\n\n💡 Our experienced barbers will analyze your face shape, hair type, and lifestyle during consultation to recommend the perfect cut for you!";
    }
    
    if (lowerMessage.includes('maintenance') || lowerMessage.includes('how often')) {
      return "🔄 **Haircut Maintenance:**\n\n• **Short styles:** Every 3-4 weeks\n• **Medium length:** Every 4-6 weeks\n• **Longer styles:** Every 6-8 weeks\n• **Beard trims:** Every 2-3 weeks\n\n💡 Regular maintenance keeps your style looking sharp and healthy!";
    }
    
    if (lowerMessage.includes('products') || lowerMessage.includes('hair care')) {
      return "🧴 **Professional Hair Care Tips:**\n\n• Use quality shampoo suited to your hair type\n• Apply conditioner to mid-lengths and ends\n• Use styling products sparingly\n• Protect hair from heat damage\n\n✨ We use and recommend premium products from leading brands. Our barbers can suggest the best products for your hair type!";
    }
    
    if (lowerMessage.includes('first time') || lowerMessage.includes('what to expect')) {
      return "🌟 **First Visit Guide:**\n\n• Arrive 5-10 minutes early\n• Bring reference photos if you have them\n• We'll discuss your lifestyle and preferences\n• Professional consultation included\n• Relaxing hot towel treatment\n\n💡 Don't worry - our experienced team will make you feel comfortable and ensure you leave looking and feeling great!";
    }
    
    return "🤔 That's a great question! I'm here to help with:\n\n• 📅 Booking appointments\n• 💈 Service information\n• 💰 Pricing details\n• ⏰ Business hours\n• 📍 Location & contact info\n• 💡 Styling advice\n\nWhat would you like to know more about?";
  };

  const handleSendMessage = () => {
    if (!currentMessage.trim()) return;

    addUserMessage(currentMessage);
    const intent = detectUserIntent(currentMessage);

    switch (intent) {
      case 'manual_booking':
        addAssistantMessage("Perfect! 👉 Book your appointment here: https://6c123100-69fa-459d-ab79-27598b38ceb3-00-jozcq38yiyhf.worf.replit.dev\n\nYou can choose your preferred date, time, and service directly on our booking page. 😊");
        setConversationState('complete');
        break;

      case 'assisted_booking':
        addAssistantMessage("Great! I'll help you book your appointment. 📋 I'll need a few details:\n\n• Your full name\n• Phone number\n• Email address\n• Preferred date\n• Preferred time\n• Service (Haircut, Beard Trim, or both)\n\nYou can share all this info in one message or we can go step by step. What works better for you?");
        setConversationState('collecting');
        break;

      case 'service_inquiry':
        addAssistantMessage(getServiceInfo() + "\n\n📞 Would you like to book one of these services?");
        break;

      case 'pricing':
        addAssistantMessage(getPricingInfo() + "\n\n💡 Ready to book your appointment?");
        break;

      case 'hours':
        addAssistantMessage(getHoursInfo() + "\n\n📅 Would you like to schedule an appointment during these hours?");
        break;

      case 'location':
        addAssistantMessage(getLocationInfo() + "\n\n🗺️ Need directions or ready to book your visit?");
        break;

      case 'general_question':
        addAssistantMessage(getGeneralAdvice(currentMessage));
        break;

      case 'provide_info':
        const newInfo = extractBookingInfo(currentMessage);
        setBookingData(prev => ({ ...prev, ...newInfo }));
        
        const missing = getMissingInfo();
        if (missing.length === 0) {
          // All info collected, confirm booking
          const service = (services as Service[]).find(s => s.id === bookingData.serviceId);
          addAssistantMessage(`Perfect! Let me confirm your booking details:\n\n👤 Name: ${bookingData.customerName}\n📞 Phone: ${bookingData.customerPhone}\n📧 Email: ${bookingData.customerEmail}\n📅 Date: ${bookingData.date}\n⏰ Time: ${bookingData.time}\n💈 Service: ${service?.name}\n\nShould I go ahead and book this for you?`);
          setConversationState('confirming');
        } else {
          addAssistantMessage(`Great! I have some of your details. I still need:\n\n${missing.map(item => `• ${item}`).join('\n')}\n\nPlease share the remaining information.`);
        }
        break;

      default:
        if (conversationState === 'confirming') {
          const confirmMessage = currentMessage.toLowerCase();
          if (confirmMessage.includes('yes') || confirmMessage.includes('confirm') || confirmMessage.includes('book')) {
            addAssistantMessage("Got it! I'm booking you in now ✅");
            
            // Submit booking
            createBookingMutation.mutate({
              customerName: bookingData.customerName,
              customerPhone: bookingData.customerPhone,
              customerEmail: bookingData.customerEmail,
              date: bookingData.date,
              time: bookingData.time,
              serviceId: bookingData.serviceId,
              barberId: (barbers as Barber[])[0]?.id || 1, // Default to first barber
              status: "confirmed"
            });
          } else {
            addAssistantMessage("No problem! Would you like to:\n\n1. 🔄 Start over with new details\n2. 🔗 Use our manual booking link instead\n\nJust let me know what you'd prefer!");
            setConversationState('greeting');
            setBookingData({});
          }
        } else {
          addAssistantMessage("I'd be happy to help you! I can assist with:\n\n• 📅 **Booking appointments** - Let me guide you through it\n• 💈 **Service information** - Learn about our offerings\n• 💰 **Pricing details** - Get cost information\n• ⏰ **Hours & availability** - When we're open\n• 📍 **Location & contact** - How to reach us\n• 💡 **Styling advice** - Professional tips\n\nWhat would you like to know about?");
        }
        break;
    }

    setCurrentMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-teal-500 hover:bg-teal-600 shadow-lg z-[9999]"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card 
      className="fixed bottom-4 right-4 w-96 shadow-xl z-[9999] flex flex-col"
      style={{
        height: 'min(500px, calc(100vh - 2rem))',
        maxHeight: 'calc(100vh - 2rem)'
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-teal-500 text-white rounded-t-lg flex-shrink-0">
        <CardTitle className="text-lg font-semibold">BarberFlow Assistant</CardTitle>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-6 w-6 text-white hover:bg-teal-600"
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col p-0 min-h-0">
        <ScrollArea className="flex-1 p-4 min-h-0">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-2 ${
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.type === 'assistant' && (
                  <div className="w-8 h-8 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-3 rounded-lg whitespace-pre-wrap ${
                    message.type === 'user'
                      ? 'bg-teal-500 text-white ml-auto'
                      : 'bg-white bg-opacity-90 text-gray-900 backdrop-blur-sm'
                  }`}
                >
                  {message.content}
                </div>
                {message.type === 'user' && (
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t flex-shrink-0 bg-white bg-opacity-90 backdrop-blur-sm">
          <div className="flex gap-2">
            <Input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1"
              disabled={createBookingMutation.isPending}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || createBookingMutation.isPending}
              size="icon"
              className="bg-teal-500 hover:bg-teal-600"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}