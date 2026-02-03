import { StyleSheet, Text, View, ScrollView } from "react-native";
import { useHabits } from "@/contexts/HabitContext";
import { useMemo } from "react";

function getDaysInMonth(year: number, month: number): Date[] {
  const days: Date[] = [];
  const date = new Date(year, month, 1);
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function getWeekdayNames(): string[] {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
}

export default function HistoryScreen() {
  const { habitsWithStats, completions, habits } = useHabits();
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const daysInMonth = useMemo(() => 
    getDaysInMonth(currentYear, currentMonth), 
    [currentYear, currentMonth]
  );

  const firstDayOfWeek = daysInMonth[0].getDay();

  const monthName = today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const getCompletionRate = (date: Date): number => {
    if (habits.length === 0) return 0;
    const dateString = date.toISOString().split('T')[0];
    const completedCount = completions.filter(c => c.date === dateString).length;
    return completedCount / habits.length;
  };

  const totalCompletions = habitsWithStats.reduce((sum, h) => sum + h.totalCompletions, 0);
  const bestStreak = Math.max(...habitsWithStats.map(h => h.longestStreak), 0);
  const activeHabits = habitsWithStats.length;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{totalCompletions}</Text>
            <Text style={styles.statLabel}>Total Completions</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{bestStreak}</Text>
            <Text style={styles.statLabel}>Best Streak</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeHabits}</Text>
            <Text style={styles.statLabel}>Active Habits</Text>
          </View>
        </View>

        <View style={styles.calendarSection}>
          <Text style={styles.sectionTitle}>{monthName}</Text>
          
          <View style={styles.calendar}>
            <View style={styles.weekdayRow}>
              {getWeekdayNames().map(day => (
                <View key={day} style={styles.weekdayCell}>
                  <Text style={styles.weekdayText}>{day}</Text>
                </View>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <View key={`empty-${i}`} style={styles.dayCell} />
              ))}
              
              {daysInMonth.map((date) => {
                const rate = getCompletionRate(date);
                const isToday = date.toDateString() === today.toDateString();
                const isFuture = date > today;
                
                return (
                  <View 
                    key={date.toISOString()} 
                    style={[
                      styles.dayCell,
                      isToday && styles.todayCell,
                    ]}
                  >
                    <View 
                      style={[
                        styles.dayCircle,
                        rate > 0 && styles.dayCircleCompleted,
                        rate >= 0.5 && styles.dayCircleHalf,
                        rate === 1 && styles.dayCircleFull,
                        isFuture && styles.dayCircleFuture,
                      ]}
                    >
                      <Text 
                        style={[
                          styles.dayText,
                          rate === 1 && styles.dayTextCompleted,
                          isFuture && styles.dayTextFuture,
                        ]}
                      >
                        {date.getDate()}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotEmpty]} />
              <Text style={styles.legendText}>No habits</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotPartial]} />
              <Text style={styles.legendText}>Some done</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDotFull]} />
              <Text style={styles.legendText}>All done</Text>
            </View>
          </View>
        </View>

        {habitsWithStats.length > 0 && (
          <View style={styles.habitsSection}>
            <Text style={styles.sectionTitle}>Your Habits</Text>
            {habitsWithStats.map(habit => (
              <View key={habit.id} style={styles.habitRow}>
                <View style={styles.habitRowLeft}>
                  <View style={[styles.habitDot, { backgroundColor: habit.color }]} />
                  <Text style={styles.habitRowName}>{habit.name}</Text>
                </View>
                <View style={styles.habitRowStats}>
                  <Text style={styles.habitRowStreak}>{habit.currentStreak} day streak</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAFA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500" as const,
    textAlign: "center",
  },
  calendarSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 16,
  },
  calendar: {
    marginBottom: 16,
  },
  weekdayRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  weekdayCell: {
    flex: 1,
    alignItems: "center",
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: "600" as const,
    color: "#999",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: "14.28%",
    aspectRatio: 1,
    padding: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  todayCell: {
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
  },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F5F5",
  },
  dayCircleCompleted: {
    backgroundColor: "#E8F5E9",
  },
  dayCircleHalf: {
    backgroundColor: "#C8E6C9",
  },
  dayCircleFull: {
    backgroundColor: "#4CAF50",
  },
  dayCircleFuture: {
    backgroundColor: "transparent",
  },
  dayText: {
    fontSize: 14,
    fontWeight: "500" as const,
    color: "#666",
  },
  dayTextCompleted: {
    color: "#fff",
    fontWeight: "700" as const,
  },
  dayTextFuture: {
    color: "#CCC",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendDotEmpty: {
    backgroundColor: "#F5F5F5",
  },
  legendDotPartial: {
    backgroundColor: "#C8E6C9",
  },
  legendDotFull: {
    backgroundColor: "#4CAF50",
  },
  legendText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500" as const,
  },
  habitsSection: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  habitRowLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  habitDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  habitRowName: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: "#1A1A1A",
    flex: 1,
  },
  habitRowStats: {
    alignItems: "flex-end",
  },
  habitRowStreak: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500" as const,
  },
});
