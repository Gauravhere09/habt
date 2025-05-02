
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserActivities, Activity } from '@/services/activityService';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

// Time periods for stats
type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function StatsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    loadActivities();
  }, []);

  const loadActivities = async () => {
    const fetchedActivities = await getUserActivities();
    setActivities(fetchedActivities);
  };

  // Get counts by activity type
  const getActivityCounts = () => {
    const counts: Record<string, number> = {};
    const filteredActivities = filterActivitiesByTimePeriod(activities, timePeriod);
    
    filteredActivities.forEach(activity => {
      if (!counts[activity.activity_type]) {
        counts[activity.activity_type] = 0;
      }
      counts[activity.activity_type]++;
    });
    
    return Object.entries(counts).map(([name, count]) => ({
      name,
      count,
      emoji: activities.find(a => a.activity_type === name)?.emoji || '📊'
    }));
  };

  // Filter activities based on time period
  const filterActivitiesByTimePeriod = (activities: Activity[], period: TimePeriod): Activity[] => {
    const now = new Date();
    let startDate: Date;
    
    switch (period) {
      case 'daily':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'weekly':
        const day = now.getDay();
        startDate = new Date(now.setDate(now.getDate() - day));
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'monthly':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'yearly':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.setHours(0, 0, 0, 0));
    }
    
    return activities.filter(activity => 
      new Date(activity.created_at) >= startDate
    );
  };

  // Generate chart data for activity distribution by day of week
  const getDayOfWeekData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayCounts = Array(7).fill(0);
    
    const filteredActivities = filterActivitiesByTimePeriod(activities, timePeriod);
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.created_at);
      dayCounts[date.getDay()]++;
    });
    
    return days.map((day, index) => ({
      name: day.substring(0, 3),
      count: dayCounts[index]
    }));
  };

  // Generate chart data for activity distribution by hour of day
  const getHourOfDayData = () => {
    const hourCounts = Array(24).fill(0);
    
    const filteredActivities = filterActivitiesByTimePeriod(activities, timePeriod);
    
    filteredActivities.forEach(activity => {
      const date = new Date(activity.created_at);
      hourCounts[date.getHours()]++;
    });
    
    return hourCounts.map((count, hour) => ({
      name: `${hour}:00`,
      count
    }));
  };

  // Get counts for different activity types
  const getActivityTypeCount = (type: string) => {
    return filterActivitiesByTimePeriod(activities, timePeriod).filter(a => 
      a.activity_type === type
    ).length;
  };

  const getActivityValue = (type: string) => {
    const activitiesOfType = filterActivitiesByTimePeriod(activities, timePeriod)
      .filter(a => a.activity_type === type && a.value);
    
    if (!activitiesOfType.length) return "0";
    
    // For numeric values, calculate sum
    const values = activitiesOfType
      .map(a => parseFloat(a.value || "0"))
      .filter(v => !isNaN(v));
      
    if (values.length) {
      return values.reduce((sum, val) => sum + val, 0).toFixed(1);
    }
    
    // Default to count if values aren't numeric
    return activitiesOfType.length.toString();
  };

  // Chart configurations
  const chartConfig = {
    water: { label: 'Water', color: '#0ea5e9' },
    bathroom: { label: 'Bathroom', color: '#8b5cf6' },
    sleep: { label: 'Sleep', color: '#10b981' },
    exercise: { label: 'Exercise', color: '#f97316' },
    screen: { label: 'Screen Time', color: '#6366f1' },
    meal: { label: 'Meal', color: '#f59e0b' },
  };

  const handleLogin = () => {
    navigate('/auth');
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  const handleShareStats = async () => {
    try {
      // Create stats summary text
      let statsText = `My Health Stats (${timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)})\n\n`;
      
      statsText += `Water: ${getActivityTypeCount('Water')} times\n`;
      statsText += `Sleep: ${getActivityValue('Sleep')} hours\n`;
      statsText += `Exercise: ${getActivityValue('Exercise')} minutes\n`;
      statsText += `Screen Time: ${getActivityValue('Screen Time')} hours\n`;
      statsText += `Bathroom: ${getActivityTypeCount('Bathroom')} times\n`;
      statsText += `Meal: ${getActivityTypeCount('Meal')} times\n\n`;
      
      statsText += `Total activities: ${filterActivitiesByTimePeriod(activities, timePeriod).length}`;
      
      // Use Web Share API if available
      if (navigator.share) {
        await navigator.share({
          title: 'My Health Stats',
          text: statsText,
        });
        toast.success('Stats shared successfully');
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(statsText);
        toast.success('Stats copied to clipboard');
      }
    } catch (error) {
      console.error('Error sharing stats:', error);
      toast.error('Failed to share stats');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-xl font-bold">Statistics</h2>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleShareStats}
            title="Share Stats"
          >
            <Share2 size={18} />
          </Button>
          {user ? (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Logged in as:</p>
              <p className="text-sm font-medium truncate max-w-[120px]">{user.email}</p>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="mt-0.5 h-7 text-xs">
                Sign Out
              </Button>
            </div>
          ) : (
            <Button size="sm" onClick={handleLogin}>Login</Button>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="daily" onValueChange={(v) => setTimePeriod(v as TimePeriod)} className="w-full">
        <TabsList className="grid grid-cols-4 mb-2">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
        </TabsList>
      </Tabs>
      
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-base flex items-center gap-2">
              <span>💧</span> Water
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getActivityTypeCount('Water')}</p>
            <p className="text-xs text-muted-foreground">times</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-base flex items-center gap-2">
              <span>💩</span> Bathroom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getActivityTypeCount('Bathroom')}</p>
            <p className="text-xs text-muted-foreground">times</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-base flex items-center gap-2">
              <span>😴</span> Sleep
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getActivityValue('Sleep')}</p>
            <p className="text-xs text-muted-foreground">hours</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-1.5">
            <CardTitle className="text-base flex items-center gap-2">
              <span>📱</span> Screen Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getActivityValue('Screen Time')}</p>
            <p className="text-xs text-muted-foreground">hours</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-card/50 border-border/50 overflow-hidden">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg">Activity Counts</CardTitle>
        </CardHeader>
        <CardContent className="px-1 pt-1 pb-2">
          {activities.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="h-[180px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getActivityCounts()} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 10 }} 
                    tickLine={false}
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || payload.length === 0) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="flex items-center">
                            <span className="mr-2">{data.emoji}</span>
                            <span className="font-semibold">{data.name}</span>
                          </div>
                          <p className="text-sm">Count: {data.count}</p>
                        </div>
                      );
                    }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {getActivityCounts().map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={Object.values(chartConfig)[index % Object.values(chartConfig).length].color}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-[180px] items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 border-border/50 overflow-hidden">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg">Activity by Day of Week</CardTitle>
        </CardHeader>
        <CardContent className="px-1 pt-1 pb-2">
          {activities.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDayOfWeekData()} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <ChartTooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-[180px] items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 border-border/50 overflow-hidden">
        <CardHeader className="pb-1">
          <CardTitle className="text-lg">Activity by Time of Day</CardTitle>
        </CardHeader>
        <CardContent className="px-1 pt-1 pb-2">
          {activities.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getHourOfDayData()} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 8 }} 
                    interval={isMobile ? 3 : 1} 
                  />
                  <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                  <ChartTooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-[180px] items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
