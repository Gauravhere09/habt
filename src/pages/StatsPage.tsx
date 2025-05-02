
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getUserActivities, Activity } from '@/services/activityService';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Time periods for stats
type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function StatsPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily');
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

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
    
    activities.forEach(activity => {
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
    
    activities.forEach(activity => {
      const date = new Date(activity.created_at);
      hourCounts[date.getHours()]++;
    });
    
    return hourCounts.map((count, hour) => ({
      name: `${hour}:00`,
      count
    }));
  };

  // Get counts for water and bathroom activities
  const getWaterCount = () => {
    return activities.filter(a => 
      a.activity_type === 'Water' && 
      new Date(a.created_at) >= getStartOfToday()
    ).length;
  };
  
  const getBathroomCount = () => {
    return activities.filter(a => 
      a.activity_type === 'Bathroom' && 
      new Date(a.created_at) >= getStartOfToday()
    ).length;
  };

  const getStartOfToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Statistics</h2>
        {user ? (
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Logged in as:</p>
            <p className="font-medium">{user.email}</p>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="mt-1">
              Sign Out
            </Button>
          </div>
        ) : (
          <Button onClick={handleLogin}>Login / Register</Button>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>💧</span> Water
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getWaterCount()}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <span>💩</span> Bathroom
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{getBathroomCount()}</p>
            <p className="text-xs text-muted-foreground">Today</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="flex justify-around mb-2 bg-card/30 rounded-lg p-2">
        <Button 
          variant={timePeriod === 'daily' ? 'default' : 'ghost'} 
          size="sm"
          onClick={() => setTimePeriod('daily')}
        >
          Daily
        </Button>
        <Button 
          variant={timePeriod === 'weekly' ? 'default' : 'ghost'} 
          size="sm"
          onClick={() => setTimePeriod('weekly')}
        >
          Weekly
        </Button>
        <Button 
          variant={timePeriod === 'monthly' ? 'default' : 'ghost'} 
          size="sm"
          onClick={() => setTimePeriod('monthly')}
        >
          Monthly
        </Button>
        <Button 
          variant={timePeriod === 'yearly' ? 'default' : 'ghost'} 
          size="sm"
          onClick={() => setTimePeriod('yearly')}
        >
          Yearly
        </Button>
      </div>
      
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Activity Counts</CardTitle>
        </CardHeader>
        <CardContent className="h-[240px]">
          {activities.length > 0 ? (
            <ChartContainer
              config={chartConfig}
              className="h-[200px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getActivityCounts()}>
                  <XAxis 
                    dataKey="name" 
                    tick={{ fontSize: 12 }} 
                    tickLine={false}
                  />
                  <YAxis allowDecimals={false} />
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
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Activity by Day of Week</CardTitle>
        </CardHeader>
        <CardContent className="h-[240px]">
          {activities.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getDayOfWeekData()}>
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip />
                  <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="bg-card/50 border-border/50">
        <CardHeader>
          <CardTitle>Activity by Time of Day</CardTitle>
        </CardHeader>
        <CardContent className="h-[240px]">
          {activities.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={getHourOfDayData()}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <ChartTooltip />
                  <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
