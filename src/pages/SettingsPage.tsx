
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Settings</h2>
      
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Database Connection</CardTitle>
          <CardDescription>Connect to Supabase to save your activity data</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full">Connect to Supabase</Button>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>AI Integration</CardTitle>
          <CardDescription>Setup Gemini AI for insights and chat</CardDescription>
        </CardHeader>
        <CardContent>
          <Button className="w-full" variant="outline">Configure AI Integration</Button>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="activity-reminders">Activity Reminders</Label>
            <Switch id="activity-reminders" />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="daily-summary">Daily Summary</Label>
            <Switch id="daily-summary" />
          </div>
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Habit Hue Haven v1.0.0</p>
          <p className="text-sm text-muted-foreground mt-1">A minimal wellness tracker</p>
        </CardContent>
      </Card>
    </div>
  );
}
