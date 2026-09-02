import ErrorScreen from "@/components/error-screen";
import SearchBar from "@/components/search-bar";
import StudentDetail from "@/components/student-detail";
import StudentItem from "@/components/student-item";
import { Student } from "@/data/students";
import { useDebounce } from "@/hooks/use-debounce";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStudents } from "../../context/students-context";

function SkeletonItem() {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    );

    animation.start();
    return () => animation.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.skeletonRow, { opacity }]}
      accessible={false}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      <View style={styles.skeletonAvatar} />
      <View style={styles.skeletonInfo}>
        <View style={styles.skeletonName} />
        <View style={styles.skeletonDepartment} />
        <View style={styles.skeletonId} />
      </View>
    </Animated.View>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<TextInput>(null);

  const { students, isLoading, error, reloadStudents } = useStudents();

  useEffect(() => {
    const timer = setTimeout(() => {
      searchRef.current?.focus();
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  const filtered = useMemo(() => {
    const normalizedQuery = debouncedQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return students;
    }

    return students.filter(
      (student) =>
        student.name.toLowerCase().includes(normalizedQuery) ||
        student.department.toLowerCase().includes(normalizedQuery)
    );
  }, [students, debouncedQuery]);

  const handleSelect = useCallback((student: Student) => {
    setSelectedStudent((current) => (current?.id === student.id ? null : student));
  }, []);

  const EmptyList = useCallback(() => {
    if (query.trim().length > 0) {
      return (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No results</Text>
          <Text style={styles.emptySub}>No students match &quot;{debouncedQuery}&quot;</Text>
        </View>
      );
    }

    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No students yet</Text>
        <Text style={styles.emptySub}>Tap + Add to add the first student</Text>
      </View>
    );
  }, [query, debouncedQuery]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.titleBar}>
          <Text style={styles.title}>Student Directory</Text>
        </View>
        <View
          style={styles.loadingAnnouncement}
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
        >
          <Text style={styles.loadingText}>Loading students...</Text>
        </View>
        <View style={styles.skeletonContainer}>
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonItem key={index} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return <ErrorScreen message={error} onRetry={reloadStudents} />;
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.titleBar}>
        <Text style={styles.title} accessibilityRole="header">
          Student Directory
        </Text>

        {/*
          Accessibility Audit Fix:
          The Add button previously had no screen-reader role, label, or action hint.
          Added all three so TalkBack/VoiceOver announces its purpose clearly.
        */}
        <Pressable
          style={styles.addButton}
          onPress={() => router.push("/(tabs)/add-student")}
          accessibilityRole="button"
          accessibilityLabel="Add new student"
          accessibilityHint="Opens the Add Student form"
        >
          <Text style={styles.addButtonText}>+ Add</Text>
        </Pressable>
      </View>

      <SearchBar ref={searchRef} value={query} onChangeText={setQuery} />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <StudentItem
            student={item}
            onPress={handleSelect}
            isSelected={selectedStudent?.id === item.id}
          />
        )}
        ListEmptyComponent={EmptyList}
        keyboardShouldPersistTaps="handled"
      />

      {selectedStudent && (
        <StudentDetail
          student={selectedStudent}
          onRemoved={() => setSelectedStudent(null)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  titleBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#0D1F4E",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  addButton: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  loadingAnnouncement: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  loadingText: {
    color: "#64748B",
    fontSize: 13,
  },
  skeletonContainer: {
    flex: 1,
    paddingTop: 10,
  },
  skeletonRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  skeletonAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
    backgroundColor: "#CBD5E1",
  },
  skeletonInfo: {
    flex: 1,
  },
  skeletonName: {
    width: "58%",
    height: 15,
    borderRadius: 5,
    backgroundColor: "#CBD5E1",
    marginBottom: 7,
  },
  skeletonDepartment: {
    width: "42%",
    height: 12,
    borderRadius: 5,
    backgroundColor: "#D9E1EA",
    marginBottom: 7,
  },
  skeletonId: {
    width: "30%",
    height: 10,
    borderRadius: 5,
    backgroundColor: "#E2E8F0",
  },
  empty: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: "center",
  },
});
