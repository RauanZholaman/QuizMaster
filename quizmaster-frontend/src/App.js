// import "src/App.js";
import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "../src/components/Navbar";
import Footer from "../src/components/Footer";
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
import GradeQuiz from "../src/pages/GradeQuiz";
import QuizFeedback from "../src/pages/QuizFeedback";
import QuizSubmissions from "../src/pages/QuizSubmissions";
import StudentResults from "../src/pages/StudentResults";
import StudentSubmissionDetail from "../src/pages/StudentSubmissionDetail";
import TermsOfUse from "../src/pages/TermsOfUse";
import PrivacyPolicy from "../src/pages/PrivacyPolicy";

export default function App() {
  const location = useLocation();
  // Hide navbar/footer only on the actual quiz taking page
  // Pattern: /quiz/someId (but not /quiz/someId/intro or /quiz/someId/submissions)
  const isTakingQuiz = /^\/quiz\/[^/]+$/.test(location.pathname);

  return (
    <div className="app-layout">
      {!isTakingQuiz && <Navbar />}
        
      <div className="main-content">
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
        <Route path="/terms" element={<TermsOfUse />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />

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

        <Route path="/quiz/:id/submissions" element={<ProtectedRoute requireRole="educator"><QuizSubmissions/></ProtectedRoute>} />
        <Route path="/grade" element={<ProtectedRoute requireRole="educator"><GradeQuiz/></ProtectedRoute>} />
        <Route path="/grade/:submissionId" element={<ProtectedRoute requireRole="educator"><GradeQuiz/></ProtectedRoute>} />
        <Route path="/grade/feedback" element={<ProtectedRoute requireRole="educator"><QuizFeedback/></ProtectedRoute>} />
        <Route path="/grade/feedback/:submissionId" element={<ProtectedRoute requireRole="educator"><QuizFeedback/></ProtectedRoute>} />

        {/* Student Results Flow */}
        <Route 
          path="/my-results" 
          element={
            <ProtectedRoute>
              <StudentResults />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-results/:submissionId" 
          element={
            <ProtectedRoute>
              <StudentSubmissionDetail />
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

      </div>
        {!isTakingQuiz && <Footer/>}
    </div>
  );
}
