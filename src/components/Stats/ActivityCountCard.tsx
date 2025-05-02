
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface ActivityCountCardProps {
  emoji: string;
  title: string;
  value: string | number;
  unit?: string;
}

export default function ActivityCountCard({ emoji, title, value, unit }: ActivityCountCardProps) {
  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader className="pb-1.5">
        <CardTitle className="text-base flex items-center gap-2">
          <span>{emoji}</span> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
        {unit && <p className="text-xs text-muted-foreground">{unit}</p>}
      </CardContent>
    </Card>
  );
}
