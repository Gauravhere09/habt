
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

interface TimePeriodTabsProps {
  value: TimePeriod;
  onChange: (value: TimePeriod) => void;
}

export default function TimePeriodTabs({ value, onChange }: TimePeriodTabsProps) {
  return (
    <Tabs value={value} onValueChange={(v) => onChange(v as TimePeriod)} className="w-full">
      <TabsList className="grid grid-cols-4 mb-2">
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="monthly">Monthly</TabsTrigger>
        <TabsTrigger value="yearly">Yearly</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
