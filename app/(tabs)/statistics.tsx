import ErrorScreen from "@/components/error-screen";
import React, { useMemo } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import StatBar from "../../components/stat-bar";
import { useStudents } from "../../context/students-context";

const BAR_COLOURS = ["#0D9488", "#185FA5", "#7C3AED", "#F59E0B", "#EF4444", "#059669"];

export default function Statistics() {
  const { students, isLoading, error, reloadStudents } = useStudents();

  const deptStats = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((student) => {
      counts[student.department] = (counts[student.department] ?? 0) + 1;
    });

    return Object.entries(counts)
      .map(([dept, count]) => ({ dept, count }))
      .sort((a, b) => b.count - a.count);
  }, [students]);

  const topSkills = useMemo(() => {
    const counts: Record<string, number> = {};
    students.forEach((student) => {
      student.skills.forEach((skill) => {
        counts[skill] = (counts[skill] ?? 0) + 1;
      });
    });

    return Object.entries(counts)
      .map(([skill, count]) => ({ skill, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [students]);

  if (isLoading) {
    return (
      <View style={styles.center} accessibilityLiveRegion="polite">
        <ActivityIndicator size="large" color="#0D9488" accessibilityLabel="Loading statistics" />
        <Text style={styles.loadingText}>Loading statistics...</Text>
      </View>
    );
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={reloadStudents} />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.summaryCard} accessible accessibilityLabel={`${students.length} total students`}>
          <Text style={styles.summaryNumber}>{students.length}</Text>
          <Text style={styles.summaryLabel}>Total Students</Text>
        </View>

        <Text style={styles.sectionTitle} accessibilityRole="header">
          By Department
        </Text>
        <View style={styles.card}>
          {deptStats.length > 0 ? (
            deptStats.map(({ dept, count }, index) => (
              <StatBar
                key={dept}
                label={dept}
                count={count}
                total={students.length}
                colour={BAR_COLOURS[index % BAR_COLOURS.length]}
              />
            ))
          ) : (
            <Text style={styles.emptyText}>No department statistics available.</Text>
          )}
        </View>

        <Text style={styles.sectionTitle} accessibilityRole="header">
          Top Skills
        </Text>
        <View style={styles.card}>
          {topSkills.length > 0 ? (
            topSkills.map(({ skill, count }, index) => (
              <View
                key={skill}
                style={styles.skillRow}
                accessible
                accessibilityLabel={`Rank ${index + 1}, ${skill}, ${count} student${count !== 1 ? "s" : ""}`}
              >
                <Text style={styles.rank}>#{index + 1}</Text>
                <Text style={styles.skillName}>{skill}</Text>
                <Text style={styles.skillCount}>
                  {count} student{count !== 1 ? "s" : ""}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No skill statistics available.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F0F4F8" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
  },
  loadingText: {
    marginTop: 12,
    color: "#64748B",
    fontSize: 13,
  },
  content: { padding: 16, paddingBottom: 40 },
  summaryCard: {
    backgroundColor: "#0D1F4E",
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginBottom: 20,
  },
  summaryNumber: { fontSize: 48, fontWeight: "800", color: "#FFFFFF" },
  summaryLabel: { fontSize: 14, color: "#CCFBF1", marginTop: 4 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 4,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  rank: { fontSize: 14, fontWeight: "700", color: "#0D9488", width: 32 },
  skillName: { flex: 1, fontSize: 14, color: "#334155" },
  skillCount: { fontSize: 12, color: "#94A3B8" },
  emptyText: { fontSize: 13, color: "#94A3B8", textAlign: "center" },
});
