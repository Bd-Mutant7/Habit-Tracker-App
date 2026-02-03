import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Animated } from "react-native";
import { useHabits } from "@/contexts/HabitContext";
import { Plus, Flame } from "lucide-react-native";
import { router } from "expo-router";
import { useRef } from "react";

export default function TodayScreen() {
  const { habitsWithStats, toggleHabit, isLoading } = useHabits();

  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.dateText}>{dateString}</Text>
          <Text style={styles.subtitle}>
            {habitsWithStats.filter(h => h.completedToday).length} of {habitsWithStats.length} completed
          </Text>
        </View>

        {habitsWithStats.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No habits yet</Text>
            <Text style={styles.emptyText}>Start building better habits today</Text>
          </View>
        ) : (
          <View style={styles.habitsList}>
            {habitsWithStats.map(habit => (
              <HabitCard 
                key={habit.id} 
                habit={habit} 
                onToggle={() => toggleHabit(habit.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/add-habit')}
        activeOpacity={0.8}
      >
        <Plus color="#fff" size={28} strokeWidth={2.5} />
      </TouchableOpacity>
    </View>
  );
}

function HabitCard({ habit, onToggle }: { habit: any; onToggle: () => void }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.92,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    onToggle();
  };

  return (
    <Animated.View style={[styles.habitCard, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity 
        style={styles.habitCardInner} 
        onPress={handlePress}
        activeOpacity={0.9}
      >
        <View style={styles.habitLeft}>
          <View 
            style={[
              styles.checkbox, 
              { borderColor: habit.color },
              habit.completedToday && { backgroundColor: habit.color }
            ]}
          >
            {habit.completedToday && (
              <View style={styles.checkmark} />
            )}
          </View>
          <View style={styles.habitInfo}>
            <Text style={[styles.habitName, habit.completedToday && styles.habitNameCompleted]}>
              {habit.name}
            </Text>
            {habit.currentStreak > 0 && (
              <View style={styles.streakBadge}>
                <Flame color="#FF6B35" size={14} fill="#FF6B35" />
                <Text style={styles.streakText}>{habit.currentStreak} day streak</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
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
    paddingBottom: 100,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dateText: {
    fontSize: 28,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500" as const,
  },
  habitsList: {
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 12,
  },
  habitCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  habitCardInner: {
    padding: 18,
  },
  habitLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2.5,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#fff",
  },
  habitInfo: {
    flex: 1,
    gap: 6,
  },
  habitName: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: "#1A1A1A",
  },
  habitNameCompleted: {
    color: "#999",
  },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  streakText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: "#FF6B35",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 120,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#1A1A1A",
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    bottom: 32,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#1A1A1A",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 100,
  },
});
