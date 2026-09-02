import { api } from "@/services/api";
import React from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useStudents } from "@/context/students-context";
import { Student } from "../data/students";

interface StudentDetailProps {
  student: Student;
  onRemoved: () => void;
}

export default function StudentDetail({ student, onRemoved }: StudentDetailProps) {
  const { dispatch } = useStudents();

  const handleRemove = () => {
    const message = `Remove ${student.name} from the directory?`;

    const doRemove = async () => {
      try {
        await api.delete(`/students/${student.id}`);
        dispatch({ type: "REMOVE_STUDENT", payload: student.id });
        onRemoved();
      } catch {
        Alert.alert("Error", "Could not remove student. Is the server running?");
      }
    };

    if (Platform.OS === "web" && typeof window !== "undefined") {
      if (window.confirm(message)) {
        void doRemove();
      }
      return;
    }

    Alert.alert("Remove Student", message, [
      { text: "Cancel", style: "cancel" },
      { text: "Remove", style: "destructive", onPress: () => void doRemove() },
    ]);
  };

  return (
    <View style={styles.card} accessibilityLabel={`Full profile for ${student.name}`}>
      <Text style={styles.name} accessibilityRole="header">
        {student.name}
      </Text>
      <Text style={styles.department}>{student.department}</Text>
      <Text style={styles.idBadge}>ID: {student.studentId}</Text>

      <View style={styles.divider} />

      <Text style={styles.sectionLabel}>About</Text>
      <Text style={styles.bio}>{student.bio}</Text>

      <Text style={styles.sectionLabel}>Skills</Text>
      <View style={styles.skillsRow}>
        {student.skills.map((skill) => (
          <View key={skill} style={styles.skillBadge}>
            <Text style={styles.skillText}>{skill}</Text>
          </View>
        ))}
      </View>

      {/*
        Accessibility Audit Fix:
        The remove action previously had no screen-reader role, label, or hint.
        Added a descriptive button label and explained that confirmation appears first.
      */}
      <Pressable
        style={styles.removeButton}
        onPress={handleRemove}
        accessibilityRole="button"
        accessibilityLabel={`Remove ${student.name} from the directory`}
        accessibilityHint="Shows a confirmation dialog before removing"
      >
        <Text style={styles.removeText}>Remove from Directory</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 12,
    padding: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0D1F4E",
    marginBottom: 2,
  },
  department: {
    fontSize: 13,
    color: "#0D9488",
    marginBottom: 6,
  },
  idBadge: {
    fontSize: 11,
    color: "#0D9488",
    backgroundColor: "#E1F5EE",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#94A3B8",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 6,
  },
  bio: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 14,
  },
  skillsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  skillBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  skillText: {
    fontSize: 12,
    color: "#1D4ED8",
    fontWeight: "500",
  },
  removeButton: {
    marginTop: 16,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EF4444",
  },
  removeText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "600",
  },
});
