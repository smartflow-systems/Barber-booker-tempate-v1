import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  Users, 
  Gift, 
  Calendar, 
  Star, 
  Target, 
  TrendingUp,
  Send,
  Eye,
  Edit,
  Trash2,
  Plus,
  Heart,
  Cake,
  Award,
  Clock,
  DollarSign,
  Percent,
  MessageSquare,
  Phone,
  Share2
} from "lucide-react";
import type { Client, MarketingCampaign } from "@shared/schema";

export function MarketingTools() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch marketing campaigns
  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ["/api/marketing-campaigns"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/marketing-campaigns");
      return response.json();
    },
  });

  // Fetch clients for referral tracking
  const { data: clients = [] } = useQuery({
    queryKey: ["/api/clients"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/clients");
      return response.json();
    },
  });

  // Create campaign mutation
  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      const response = await apiRequest("POST", "/api/marketing-campaigns", campaignData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-campaigns"] });
      setShowNewCampaignDialog(false);
      toast({
        title: "Campaign Created",
        description: "Marketing campaign has been successfully created.",
      });
    },
  });

  // Send campaign mutation
  const sendCampaignMutation = useMutation({
    mutationFn: async (campaignId: number) => {
      const response = await apiRequest("POST", `/api/marketing-campaigns/${campaignId}/send`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/marketing-campaigns"] });
      toast({
        title: "Campaign Sent",
        description: "Marketing campaign has been sent to selected recipients.",
      });
    },
  });

  // Get upcoming birthdays and anniversaries
  const getUpcomingEvents = () => {
    const today = new Date();
    const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate());
    
    const birthdays = clients.filter((client: Client) => {
      if (!client.birthday) return false;
      const birthday = new Date(client.birthday);
      const thisYearBirthday = new Date(today.getFullYear(), birthday.getMonth(), birthday.getDate());
      return thisYearBirthday >= today && thisYearBirthday <= nextMonth;
    });
    
    const anniversaries = clients.filter((client: Client) => {
      if (!client.anniversary) return false;
      const anniversary = new Date(client.anniversary);
      const thisYearAnniversary = new Date(today.getFullYear(), anniversary.getMonth(), anniversary.getDate());
      return thisYearAnniversary >= today && thisYearAnniversary <= nextMonth;
    });
    
    return { birthdays, anniversaries };
  };

  // Get referral statistics
  const getReferralStats = () => {
    const referrals = clients.filter((client: Client) => client.referredBy);
    const referrers = clients.filter((client: Client) => 
      clients.some((c: Client) => c.referredBy === client.id)
    );
    
    return {
      totalReferrals: referrals.length,
      activeReferrers: referrers.length,
      referralRate: clients.length > 0 ? (referrals.length / clients.length) * 100 : 0,
      topReferrers: referrers.map((referrer: Client) => ({
        ...referrer,
        referralCount: clients.filter((c: Client) => c.referredBy === referrer.id).length
      })).sort((a, b) => b.referralCount - a.referralCount).slice(0, 5)
    };
  };

  const { birthdays, anniversaries } = getUpcomingEvents();
  const referralStats = getReferralStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Marketing Tools</h2>
          <p className="text-gray-600">Grow your business with automated marketing campaigns</p>
        </div>
        
        <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Marketing Campaign</DialogTitle>
            </DialogHeader>
            <NewCampaignForm 
              onSubmit={createCampaignMutation.mutate}
              isLoading={createCampaignMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="referrals">Referrals</TabsTrigger>
          <TabsTrigger value="events">Special Events</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {campaigns.length}
                </div>
                <p className="text-sm text-gray-600">Total Campaigns</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {campaigns.filter((c: MarketingCampaign) => c.status === 'sent').length}
                </div>
                <p className="text-sm text-gray-600">Active Campaigns</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {Math.round(campaigns.reduce((acc, c: MarketingCampaign) => acc + (c.openRate || 0), 0) / Math.max(campaigns.length, 1))}%
                </div>
                <p className="text-sm text-gray-600">Avg Open Rate</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Marketing Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Loading campaigns...</div>
              ) : campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Mail className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No campaigns created yet</p>
                  <Button 
                    onClick={() => setShowNewCampaignDialog(true)}
                    className="mt-4"
                  >
                    Create Your First Campaign
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign: MarketingCampaign) => (
                    <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:border-purple-300 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-medium">{campaign.name}</h3>
                          <Badge 
                            className={
                              campaign.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                              'bg-red-100 text-red-800'
                            }
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{campaign.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>Type: {campaign.type}</span>
                          {campaign.sentAt && (
                            <span>Sent: {new Date(campaign.sentAt).toLocaleDateString()}</span>
                          )}
                          {campaign.openRate && (
                            <span>Open Rate: {campaign.openRate}%</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {campaign.status === 'draft' && (
                          <Button 
                            size="sm"
                            onClick={() => sendCampaignMutation.mutate(campaign.id)}
                            disabled={sendCampaignMutation.isPending}
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Send
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="referrals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {referralStats.totalReferrals}
                </div>
                <p className="text-sm text-gray-600">Total Referrals</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {referralStats.activeReferrers}
                </div>
                <p className="text-sm text-gray-600">Active Referrers</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {referralStats.referralRate.toFixed(1)}%
                </div>
                <p className="text-sm text-gray-600">Referral Rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  ${Math.round(referralStats.totalReferrals * 25)}
                </div>
                <p className="text-sm text-gray-600">Est. Referral Value</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Referrers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {referralStats.topReferrers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No referrals yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {referralStats.topReferrers.map((referrer: any, index) => (
                      <div key={referrer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-500' : 'bg-slate-500'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{referrer.name}</p>
                            <p className="text-sm text-gray-600">{referrer.phone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-purple-600">
                            {referrer.referralCount} referrals
                          </div>
                          <div className="text-sm text-gray-500">
                            ${referrer.referralCount * 25} earned
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5" />
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Current Rewards</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Referrer gets:</span>
                      <span className="font-medium">$25 credit</span>
                    </div>
                    <div className="flex justify-between">
                      <span>New client gets:</span>
                      <span className="font-medium">20% off first visit</span>
                    </div>
                  </div>
                </div>
                
                <Button className="w-full bg-purple-600 hover:bg-purple-700">
                  <Share2 className="w-4 h-4 mr-2" />
                  Generate Referral Links
                </Button>
                
                <Button variant="outline" className="w-full">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Referral Invites
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cake className="w-5 h-5" />
                  Upcoming Birthdays ({birthdays.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {birthdays.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Cake className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No birthdays this month</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {birthdays.map((client: Client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(client.birthday!).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-1" />
                          Send Wish
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Upcoming Anniversaries ({anniversaries.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {anniversaries.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No anniversaries this month</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {anniversaries.map((client: Client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{client.name}</p>
                          <p className="text-sm text-gray-600">
                            {new Date(client.anniversary!).toLocaleDateString('en-US', { 
                              month: 'long', 
                              day: 'numeric' 
                            })}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
                          <Mail className="w-4 h-4 mr-1" />
                          Send Offer
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Automated Campaigns
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Follow-up Reviews</h4>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Send review requests 24 hours after appointments
                  </p>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Birthday Promotions</h4>
                    <Switch defaultChecked />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Send birthday offers 3 days before birthdays
                  </p>
                  <Badge className="bg-green-100 text-green-800">Active</Badge>
                </div>

                <div className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Win-back Campaign</h4>
                    <Switch />
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    Re-engage clients who haven't visited in 90 days
                  </p>
                  <Badge className="bg-gray-100 text-gray-800">Inactive</Badge>
                </div>
              </div>

              <Button className="w-full bg-orange-600 hover:bg-orange-700">
                <Plus className="w-4 h-4 mr-2" />
                Create Automated Campaign
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {campaigns.reduce((acc, c: MarketingCampaign) => acc + (c.sentCount || 0), 0)}
                </div>
                <p className="text-sm text-gray-600">Emails Sent</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {Math.round(campaigns.reduce((acc, c: MarketingCampaign) => acc + (c.openRate || 0), 0) / Math.max(campaigns.length, 1))}%
                </div>
                <p className="text-sm text-gray-600">Avg Open Rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-purple-600 mb-2">
                  {Math.round(campaigns.reduce((acc, c: MarketingCampaign) => acc + (c.clickRate || 0), 0) / Math.max(campaigns.length, 1))}%
                </div>
                <p className="text-sm text-gray-600">Avg Click Rate</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-orange-600 mb-2">
                  ${Math.round(campaigns.reduce((acc, c: MarketingCampaign) => acc + (c.revenue || 0), 0) / 100)}
                </div>
                <p className="text-sm text-gray-600">Revenue Generated</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Campaign Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No campaign data available</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {campaigns.map((campaign: MarketingCampaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge 
                          className={
                            campaign.status === 'sent' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }
                        >
                          {campaign.status}
                        </Badge>
                      </div>
                      
                      {campaign.status === 'sent' && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <div className="font-semibold text-blue-600">{campaign.sentCount || 0}</div>
                            <div className="text-gray-600">Sent</div>
                          </div>
                          <div className="text-center p-2 bg-green-50 rounded">
                            <div className="font-semibold text-green-600">{campaign.openRate || 0}%</div>
                            <div className="text-gray-600">Opened</div>
                          </div>
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <div className="font-semibold text-purple-600">{campaign.clickRate || 0}%</div>
                            <div className="text-gray-600">Clicked</div>
                          </div>
                          <div className="text-center p-2 bg-orange-50 rounded">
                            <div className="font-semibold text-orange-600">
                              ${Math.round((campaign.revenue || 0) / 100)}
                            </div>
                            <div className="text-gray-600">Revenue</div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// New Campaign Form Component
function NewCampaignForm({ onSubmit, isLoading }: any) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    type: "",
    subject: "",
    content: "",
    targetAudience: "all",
    scheduledAt: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: 'draft',
      scheduledAt: formData.scheduledAt || null,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="type">Campaign Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="promotional">Promotional</SelectItem>
              <SelectItem value="follow_up">Follow-up</SelectItem>
              <SelectItem value="birthday">Birthday</SelectItem>
              <SelectItem value="anniversary">Anniversary</SelectItem>
              <SelectItem value="win_back">Win-back</SelectItem>
              <SelectItem value="referral">Referral</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>
      
      <div>
        <Label htmlFor="subject">Email Subject *</Label>
        <Input
          id="subject"
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="content">Email Content *</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Write your email content here..."
          rows={6}
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="targetAudience">Target Audience</Label>
          <Select value={formData.targetAudience} onValueChange={(value) => setFormData({ ...formData, targetAudience: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Clients</SelectItem>
              <SelectItem value="new">New Clients</SelectItem>
              <SelectItem value="returning">Returning Clients</SelectItem>
              <SelectItem value="vip">VIP Clients</SelectItem>
              <SelectItem value="inactive">Inactive Clients</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor="scheduledAt">Schedule (Optional)</Label>
          <Input
            id="scheduledAt"
            type="datetime-local"
            value={formData.scheduledAt}
            onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
          />
        </div>
      </div>
      
      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? "Creating..." : "Save as Draft"}
        </Button>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => {
            const submitData = { ...formData, status: 'sent' };
            onSubmit(submitData);
          }}
          disabled={isLoading}
          className="flex-1"
        >
          Save & Send Now
        </Button>
      </div>
    </form>
  );
}