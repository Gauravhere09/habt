
import { ChartContainer } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ChartConfigItem {
  label?: React.ReactNode;
  icon?: React.ComponentType;
  color?: string;
  theme?: Record<string, string>;
}

interface ActivityCountsChartProps {
  data: any[];
  chartConfig: Record<string, ChartConfigItem>;
  isEmpty: boolean;
}

export default function ActivityCountsChart({ data, chartConfig, isEmpty }: ActivityCountsChartProps) {
  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg">Activity Counts</CardTitle>
      </CardHeader>
      <CardContent className="px-1 pt-1 pb-2">
        {!isEmpty ? (
          <ChartContainer
            config={chartConfig}
            className="h-[180px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
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
                  {data.map((entry, index) => {
                    const configValues = Object.values(chartConfig);
                    const configItem = configValues[index % configValues.length] as ChartConfigItem;
                    return (
                      <Cell 
                        key={`cell-${index}`}
                        fill={configItem?.color || '#6366f1'} // Add fallback color
                      />
                    );
                  })}
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
  );
}
