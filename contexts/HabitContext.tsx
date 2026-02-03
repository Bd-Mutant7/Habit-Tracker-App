import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import { Habit, HabitCompletion, HabitWithStats } from '@/types/habit';

const HABITS_KEY = 'habits';
const COMPLETIONS_KEY = 'completions';

function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

function calculateStreak(completions: HabitCompletion[], habitId: string): { current: number; longest: number } {
  const habitCompletions = completions
    .filter(c => c.habitId === habitId)
    .map(c => c.date)
    .sort()
    .reverse();

  if (habitCompletions.length === 0) return { current: 0, longest: 0 };

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;
  const today = getDateString();
  const yesterday = getDateString(new Date(Date.now() - 86400000));

  for (let i = 0; i < habitCompletions.length; i++) {
    const date = habitCompletions[i];
    
    if (i === 0) {
      if (date === today || date === yesterday) {
        currentStreak = 1;
        tempStreak = 1;
      } else {
        currentStreak = 0;
        tempStreak = 1;
      }
    } else {
      const prevDate = habitCompletions[i - 1];
      const dayDiff = (new Date(prevDate).getTime() - new Date(date).getTime()) / 86400000;
      
      if (dayDiff === 1) {
        tempStreak++;
        if (currentStreak > 0) currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
  }

  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
  
  return { current: currentStreak, longest: longestStreak };
}

export const [HabitProvider, useHabits] = createContextHook(() => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [habitsData, completionsData] = await Promise.all([
        AsyncStorage.getItem(HABITS_KEY),
        AsyncStorage.getItem(COMPLETIONS_KEY),
      ]);
      
      if (habitsData) setHabits(JSON.parse(habitsData));
      if (completionsData) setCompletions(JSON.parse(completionsData));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveHabits = async (newHabits: Habit[]) => {
    try {
      await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(newHabits));
      setHabits(newHabits);
    } catch (error) {
      console.error('Failed to save habits:', error);
    }
  };

  const saveCompletions = async (newCompletions: HabitCompletion[]) => {
    try {
      await AsyncStorage.setItem(COMPLETIONS_KEY, JSON.stringify(newCompletions));
      setCompletions(newCompletions);
    } catch (error) {
      console.error('Failed to save completions:', error);
    }
  };

  const addHabit = useCallback((name: string, color: string) => {
    const newHabit: Habit = {
      id: Date.now().toString(),
      name,
      color,
      createdAt: new Date().toISOString(),
    };
    saveHabits([...habits, newHabit]);
  }, [habits]);

  const deleteHabit = useCallback((habitId: string) => {
    saveHabits(habits.filter(h => h.id !== habitId));
    saveCompletions(completions.filter(c => c.habitId !== habitId));
  }, [habits, completions]);

  const toggleHabit = useCallback((habitId: string, date: string = getDateString()) => {
    const existing = completions.find(c => c.habitId === habitId && c.date === date);
    
    if (existing) {
      saveCompletions(completions.filter(c => !(c.habitId === habitId && c.date === date)));
    } else {
      saveCompletions([...completions, { habitId, date }]);
    }
  }, [completions]);

  const habitsWithStats = useMemo((): HabitWithStats[] => {
    const today = getDateString();
    
    return habits.map(habit => {
      const { current, longest } = calculateStreak(completions, habit.id);
      const completedToday = completions.some(c => c.habitId === habit.id && c.date === today);
      const totalCompletions = completions.filter(c => c.habitId === habit.id).length;
      
      return {
        ...habit,
        currentStreak: current,
        longestStreak: longest,
        completedToday,
        totalCompletions,
      };
    });
  }, [habits, completions]);

  const getCompletionsForDate = useCallback((date: string) => {
    return completions.filter(c => c.date === date);
  }, [completions]);

  return {
    habits,
    habitsWithStats,
    completions,
    isLoading,
    addHabit,
    deleteHabit,
    toggleHabit,
    getCompletionsForDate,
  };
});
