import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useStudents } from "../context/students-context";
import { api } from "../services/api";
import FormField from "./form-field";

interface FormData {
  name: string;
  studentId: string;
  department: string;
  bio: string;
  skillsText: string;
}

interface FormErrors {
  name?: string;
  studentId?: string;
  department?: string;
  bio?: string;
}

function validateForm(data: FormData): FormErrors {
  const newErrors: FormErrors = {};

  if (data.name.trim().length === 0) {
    newErrors.name = "Name is required.";
  } else if (data.name.trim().length < 3) {
    newErrors.name = "Name must be at least 3 characters.";
  }

  const idPattern = /^\d{2}-\d{5}-\d$/;
  if (data.studentId.trim().length === 0) {
    newErrors.studentId = "Student ID is required.";
  } else if (!idPattern.test(data.studentId.trim())) {
    newErrors.studentId = "Format must be NN-NNNNN-N (e.g. 22-12345-1).";
  }

  if (data.department.trim().length === 0) {
    newErrors.department = "Department is required.";
  }

  if (data.bio.trim().length === 0) {
    newErrors.bio = "Bio is required.";
  } else if (data.bio.trim().length < 10) {
    newErrors.bio = "Bio must be at least 10 characters.";
  }

  return newErrors;
}

export default function AddStudentForm() {
  const { dispatch } = useStudents();

  const [formData, setFormData] = useState<FormData>({
    name: "",
    studentId: "",
    department: "",
    bio: "",
    skillsText: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [submitTrigger, setSubmitTrigger] = useState(false);

  const markTouched = (field: keyof FormData) => {
    setTouched((previous) => ({ ...previous, [field]: true }));
  };

  const getFieldError = (field: keyof FormErrors) =>
    touched[field] || submitAttempted ? errors[field] : undefined;

  useEffect(() => {
    setErrors(validateForm(formData));
  }, [formData]);

  const isFormValid =
    Object.keys(errors).length === 0 &&
    formData.name.trim().length > 0 &&
    formData.studentId.trim().length > 0 &&
    formData.department.trim().length > 0 &&
    formData.bio.trim().length > 0;

  useEffect(() => {
    if (!submitTrigger) {
      return;
    }

    const newStudent = {
      name: formData.name.trim(),
      studentId: formData.studentId.trim(),
      department: formData.department.trim(),
      bio: formData.bio.trim(),
      skills: formData.skillsText
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
    };

    api
      .post("/students", newStudent)
      .then(({ data }) => {
        dispatch({ type: "ADD_STUDENT", payload: data });
        router.back();
      })
      .catch(() => {
        Alert.alert("Error", "Could not save student. Is the server running?");
      })
      .finally(() => {
        setIsSubmitting(false);
        setSubmitTrigger(false);
      });
  }, [dispatch, formData, submitTrigger]);

  const updateField = (field: keyof FormData, value: string) => {
    setFormData((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmitPress = () => {
    setTouched((previous) => ({
      ...previous,
      name: true,
      studentId: true,
      department: true,
      bio: true,
    }));
    setSubmitAttempted(true);

    if (isFormValid) {
      setIsSubmitting(true);
      setSubmitTrigger(true);
    }
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.headerRow}>
        <Text style={styles.heading} accessibilityRole="header">
          Join the Directory
        </Text>

        {/*
          Accessibility Audit Fix:
          The Close control was tappable but had no role, label, or navigation hint.
        */}
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [{ opacity: pressed ? 0.6 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Close Add Student form"
          accessibilityHint="Returns to the student directory without adding a student"
        >
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>

      <Text style={styles.subheading}>
        Fill in your details below to add yourself to StudentDirectory.
      </Text>

      <FormField
        label="Full Name"
        value={formData.name}
        onChangeText={(text) => updateField("name", text)}
        onBlur={() => markTouched("name")}
        placeholder="e.g. Ashraful Haque"
        error={getFieldError("name")}
      />

      <FormField
        label="Student ID"
        value={formData.studentId}
        onChangeText={(text) => updateField("studentId", text)}
        onBlur={() => markTouched("studentId")}
        placeholder="e.g. 22-12345-1"
        autoCapitalize="none"
        error={getFieldError("studentId")}
      />

      <FormField
        label="Department"
        value={formData.department}
        onChangeText={(text) => updateField("department", text)}
        onBlur={() => markTouched("department")}
        placeholder="e.g. Computer Science"
        error={getFieldError("department")}
      />

      <FormField
        label="Bio"
        value={formData.bio}
        onChangeText={(text) => updateField("bio", text)}
        onBlur={() => markTouched("bio")}
        placeholder="A short sentence about yourself..."
        multiline
        error={getFieldError("bio")}
      />

      <FormField
        label="Skills (comma-separated)"
        value={formData.skillsText}
        onChangeText={(text) => updateField("skillsText", text)}
        placeholder="e.g. React Native, TypeScript, Figma"
        autoCapitalize="none"
      />

      {/*
        Accessibility Audit Fix:
        The submit button did not explicitly expose its role, label, hint, or disabled state.
      */}
      <Pressable
        style={[styles.button, (!isFormValid || isSubmitting) && styles.buttonDisabled]}
        onPress={handleSubmitPress}
        disabled={!isFormValid || isSubmitting}
        accessibilityRole="button"
        accessibilityLabel={isSubmitting ? "Adding student" : "Join directory"}
        accessibilityHint="Validates the form and adds this student to the directory"
        accessibilityState={{ disabled: !isFormValid || isSubmitting, busy: isSubmitting }}
      >
        {isSubmitting ? (
          <ActivityIndicator color="#FFFFFF" accessibilityLabel="Saving student" />
        ) : (
          <Text style={styles.buttonText}>Join Directory</Text>
        )}
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF", padding: 20 },
  heading: { fontSize: 20, fontWeight: "800", color: "#0D1F4E", marginBottom: 4 },
  subheading: { fontSize: 13, color: "#64748B", marginBottom: 24, lineHeight: 19 },
  button: {
    backgroundColor: "#0D9488",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 32,
  },
  buttonDisabled: {
    backgroundColor: "#CBD5E1",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeText: {
    color: "#0D1F4E",
    fontWeight: "700",
  },
});
