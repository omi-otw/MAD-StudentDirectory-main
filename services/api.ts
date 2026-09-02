import axios from "axios";
import Constants from "expo-constants";

// Week 9 Feature 3:
// The API base URL now comes from app.config.js instead of being hardcoded here.
// EXPO_PUBLIC_ENV=production uses the production placeholder; otherwise development is used.
const BASE_URL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:3000";

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 8000,
  headers: {
    "Content-Type": "application/json",
  },
});
