import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageSquare, Clock } from "lucide-react";

interface NotificationSettingsProps {
  onSave: (settings: NotificationPreferences) => void;
}

export interface NotificationPreferences {
  emailReminders: boolean;
  smsReminders: boolean;
  reminderTiming: string;
  confirmationEmail: boolean;
  confirmationSms: boolean;
}

export function NotificationSettings({ onSave }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<NotificationPreferences>({
    emailReminders: true,
    smsReminders: true,
    reminderTiming: "24h",
    confirmationEmail: true,
    confirmationSms: false,
  });

  const handleSave = () => {
    onSave(settings);
  };

  const updateSetting = (key: keyof NotificationPreferences, value: boolean | string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <Card className="shadow-xl border-0 bg-slate-800/95 backdrop-blur-sm">
      <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-600 border-b border-slate-600/50 rounded-t-lg">
        <CardTitle className="text-xl text-white flex items-center">
          <Bell className="text-blue-400 mr-2" />
          Notification Preferences
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        
        {/* Confirmation Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Booking Confirmation</h3>
          
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <Label htmlFor="confirm-email" className="text-white font-medium">Email Confirmation</Label>
                <p className="text-sm text-slate-300">Receive booking details via email</p>
              </div>
            </div>
            <Switch
              id="confirm-email"
              checked={settings.confirmationEmail}
              onCheckedChange={(checked) => updateSetting('confirmationEmail', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <div>
                <Label htmlFor="confirm-sms" className="text-white font-medium">SMS Confirmation</Label>
                <p className="text-sm text-slate-300">Get instant booking confirmation via text</p>
              </div>
            </div>
            <Switch
              id="confirm-sms"
              checked={settings.confirmationSms}
              onCheckedChange={(checked) => updateSetting('confirmationSms', checked)}
            />
          </div>
        </div>

        {/* Reminder Notifications */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Appointment Reminders</h3>
          
          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <Mail className="w-5 h-5 text-blue-400" />
              <div>
                <Label htmlFor="email-reminders" className="text-white font-medium">Email Reminders</Label>
                <p className="text-sm text-slate-300">Get reminder emails before appointments</p>
              </div>
            </div>
            <Switch
              id="email-reminders"
              checked={settings.emailReminders}
              onCheckedChange={(checked) => updateSetting('emailReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <MessageSquare className="w-5 h-5 text-green-400" />
              <div>
                <Label htmlFor="sms-reminders" className="text-white font-medium">SMS Reminders</Label>
                <p className="text-sm text-slate-300">Receive text message reminders</p>
              </div>
            </div>
            <Switch
              id="sms-reminders"
              checked={settings.smsReminders}
              onCheckedChange={(checked) => updateSetting('smsReminders', checked)}
            />
          </div>

          {/* Reminder Timing */}
          {(settings.emailReminders || settings.smsReminders) && (
            <div className="p-4 bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <Label className="text-white font-medium">Reminder Timing</Label>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  { value: "2h", label: "2 Hours Before" },
                  { value: "24h", label: "1 Day Before" },
                  { value: "48h", label: "2 Days Before" }
                ].map((option) => (
                  <Button
                    key={option.value}
                    variant={settings.reminderTiming === option.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('reminderTiming', option.value)}
                    className={settings.reminderTiming === option.value 
                      ? "bg-blue-600 hover:bg-blue-700" 
                      : "bg-slate-600 border-slate-500 text-white hover:bg-slate-500"
                    }
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Benefits Information */}
        <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <h4 className="text-white font-medium mb-2">Why enable notifications?</h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>• Reduce missed appointments by up to 90%</li>
            <li>• Get important updates about your booking</li>
            <li>• Never forget an appointment again</li>
            <li>• Easy rescheduling with direct reply options</li>
          </ul>
        </div>

        <Button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
        >
          Save Notification Preferences
        </Button>
      </CardContent>
    </Card>
  );
}