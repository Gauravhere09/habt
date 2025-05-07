
export interface Activity {
  id: string;
  name: string;
  emoji: string;
  color?: string;
  description?: string;
  valueType?: 'click' | 'number' | 'text' | 'duration';
}

export const defaultActivities: Activity[] = [
  {
    id: 'poop',
    name: 'Bathroom',
    emoji: '💩',
    description: 'Track bathroom visits',
    valueType: 'click'
  },
  {
    id: 'water',
    name: 'Water',
    emoji: '💧',
    description: 'Track water intake',
    valueType: 'click' // Changed from 'number' to 'click'
  },
  {
    id: 'screen',
    name: 'Screen Time',
    emoji: '📱',
    description: 'Track screen time',
    valueType: 'duration'
  }
];
