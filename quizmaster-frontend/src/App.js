// src/App.js
import "./App.css";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "../src/components/Navbar";
import ProtectedRoute from "../src/components/ProtectedRoute";


import Home from "../src/pages/Home";
import Login from "../src/pages/Login";
import Signup from "../src/pages/Signup";
import ForgotPassword from "../src/pages/ForgotPassword";
import CreateQuiz from "../src/pages/CreateQuiz";
import QuestionBank from "../src/pages/QuestionBank";

import Dashboard from "../src/pages/Dashboard";

import QuizSelection from "../src/pages/QuizSelection";
import QuizIntro from "../src/pages/QuizIntro"; 
import QuestionViewer from "../src/pages/QuestionViewer";
import ResultPage from "../src/pages/ResultPage";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route
          path="/create-quiz"
          element={
            <ProtectedRoute>
              <CreateQuiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/question-bank"
          element={
            <ProtectedRoute>
              <QuestionBank />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* NEW quiz-taking flow */}
        <Route
          path="/quizzes"
          element={
            <ProtectedRoute>
              <QuizSelection />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:id/intro"
          element={
            <ProtectedRoute>
              <QuizIntro />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:id"
          element={
            <ProtectedRoute>
              <QuestionViewer />
            </ProtectedRoute>
          }
        />
        <Route
          path="/result/:id"
          element={
            <ProtectedRoute>
              <ResultPage />
            </ProtectedRoute>
          }
        />

        {/* Redirect old link */}
        <Route path="/take-quiz" element={<Navigate to="/quizzes" replace />} />
      </Routes>
    </>
  );
}
