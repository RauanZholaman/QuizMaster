// src/api.js
import axios from "axios";

// Handle both Vite-style and CRA-style env vars
const viteEnv =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : {};

const API_BASE =
  viteEnv.VITE_API_BASE ||
  process.env.REACT_APP_API_BASE ||
  "http://localhost:8080"; // change if your backend runs on another port

// Axios instance used across the app
export const apiClient = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// === Named exports expected by other files ===

// For QuizSelection.jsx + QuestionViewer.jsx
export async function listPublishedQuizzes() {
  try {
    const res = await apiClient.get("/quizzes/published");
    return res.data;
  } catch (err) {
    console.error("Failed to fetch published quizzes:", err);
    return []; // avoid crashing the UI
  }
}

// Default export (if some files import the client directly)
export default apiClient;
