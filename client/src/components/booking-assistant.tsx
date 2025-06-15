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
      id: Date.now().toString(),
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
      addAssistantMessage("Hi there! 👋 I'm your BarberFlow Systems booking assistant. I can help you book an appointment in two ways:\n\n1. 📅 I can guide you through booking right here\n2. 🔗 Or send you our booking link to choose everything yourself\n\nHow would you like to proceed?");
    }
  }, [isOpen, messages.length]);

  const detectUserIntent = (message: string): 'manual_booking' | 'assisted_booking' | 'provide_info' | 'unknown' => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('link') || lowerMessage.includes('manual') || lowerMessage.includes('myself')) {
      return 'manual_booking';
    }
    
    if (lowerMessage.includes('book') || lowerMessage.includes('appointment') || lowerMessage.includes('help me')) {
      return 'assisted_booking';
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
          addAssistantMessage("I'd be happy to help you book an appointment! Would you like me to:\n\n1. 📋 Guide you through booking here\n2. 🔗 Send you our booking link\n\nJust let me know your preference!");
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
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-teal-500 hover:bg-teal-600 shadow-lg z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-xl z-50 flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between p-4 bg-teal-500 text-white rounded-t-lg">
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
      
      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4">
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
                      : 'bg-gray-100 text-gray-900'
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
        
        <div className="p-4 border-t">
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