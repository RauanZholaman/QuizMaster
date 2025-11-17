import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import CreateQuiz from "./pages/CreateQuiz";
import AutoGenerate from "./pages/AutoGenerate";
import QuestionBank from "./pages/QuestionBank";

import Dashboard from "./pages/Dashboard";
import QuizSelection from "./pages/QuizSelection.jsx";
import QuizIntro from "./pages/QuizIntro.jsx"; 
import QuestionViewer from "./pages/QuestionViewer.jsx";
import ResultPage from "./pages/ResultPage.jsx";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-quiz/*"
            element={
              <ProtectedRoute requireRole="educator">
                <CreateQuiz />
              </ProtectedRoute>
            }
          >
            <Route path="auto" element={<AutoGenerate />} />
          </Route>

          <Route
            path="/question-bank"
            element={
              <ProtectedRoute requireRole="educator">
                <QuestionBank />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireRole="educator">
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/quizzes"
            element={
              <ProtectedRoute requireRole="student">
                <QuizSelection />
              </ProtectedRoute>
            }
          />
          <Route
            path="/quiz/:id"
            element={
              <ProtectedRoute requireRole="student">
                <QuestionViewer />
              </ProtectedRoute>
            }
          />
          <Route
            path="/result/:id"
            element={
              <ProtectedRoute requireRole="student">
                <ResultPage />
              </ProtectedRoute>
            }
          />

          <Route path="/take-quiz" element={<Navigate to="/quizzes" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
