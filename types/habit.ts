export interface Habit {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  icon?: string;
}

export interface HabitCompletion {
  habitId: string;
  date: string;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  completedToday: boolean;
  totalCompletions: number;
}
