
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HistoryPage() {
  // Placeholder data - would come from Supabase in a real implementation
  const [entries] = useState([
    { id: '1', activity: 'Water', emoji: '💧', timestamp: new Date().toISOString() },
    { id: '2', activity: 'Bathroom', emoji: '💩', timestamp: new Date(Date.now() - 3600000).toISOString() },
    { id: '3', activity: 'Screen Time', emoji: '📱', timestamp: new Date(Date.now() - 7200000).toISOString() },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Activity History</h2>
      </div>
      
      <div className="space-y-4">
        {entries.length > 0 ? (
          entries.map((entry) => (
            <Card key={entry.id} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{entry.emoji}</span>
                  <div className="flex-1">
                    <h3 className="font-medium">{entry.activity}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">No activity recorded yet.</p>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="text-center text-muted-foreground text-sm">
        <p>Connect to Supabase to see your complete history.</p>
      </div>
    </div>
  );
}
