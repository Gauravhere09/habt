
export interface Activity {
  id: string;
  name: string;
  emoji: string;
  color?: string;
  description?: string;
}

export const defaultActivities: Activity[] = [
  {
    id: 'poop',
    name: 'Bathroom',
    emoji: '💩',
    description: 'Track bathroom visits'
  },
  {
    id: 'water',
    name: 'Water',
    emoji: '💧',
    description: 'Track water intake'
  },
  {
    id: 'screen',
    name: 'Screen Time',
    emoji: '📱',
    description: 'Track screen time'
  },
  {
    id: 'sleep',
    name: 'Sleep',
    emoji: '😴',
    description: 'Track sleep'
  },
  {
    id: 'exercise',
    name: 'Exercise',
    emoji: '🏃',
    description: 'Track exercise'
  },
  {
    id: 'meal',
    name: 'Meal',
    emoji: '🍽️',
    description: 'Track meals'
  }
];
