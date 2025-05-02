
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useIsMobile } from '@/hooks/use-mobile';

interface ActivityChartProps {
  title: string;
  data: any[];
  dataKey: string;
  color?: string;
  chartConfig: any;
  isEmpty: boolean;
  xAxisInterval?: number;
  xAxisDataKey?: string;
}

export default function ActivityChart({
  title,
  data,
  dataKey,
  color = "#6366f1",
  chartConfig,
  isEmpty,
  xAxisInterval = 1,
  xAxisDataKey = "name"
}: ActivityChartProps) {
  const isMobile = useIsMobile();

  return (
    <Card className="bg-card/50 border-border/50 overflow-hidden">
      <CardHeader className="pb-1">
        <CardTitle className="text-lg">{title}</CardTitle>
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
                  dataKey={xAxisDataKey} 
                  tick={{ fontSize: 10 }} 
                  interval={isMobile ? xAxisInterval : 1} 
                  tickLine={false}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 10 }} />
                <ChartTooltip />
                <Bar dataKey={dataKey} fill={color} radius={[4, 4, 0, 0]} />
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
