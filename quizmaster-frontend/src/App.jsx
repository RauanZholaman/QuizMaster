import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Home from "./pages/Home";
import CreateQuiz from "./pages/CreateQuiz";
import AutoGenerate from "./pages/AutoGenerate";
import QuestionBank from "./pages/QuestionBank";
import TakeQuiz from "./pages/TakeQuiz";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login/>} />
          <Route path="/signup" element={<Signup/>} />
          <Route path="/forgot-password" element={<ForgotPassword/>} />

          {/* Auth required */}
          <Route path="/" element={<ProtectedRoute><Home/></ProtectedRoute>} />
          <Route path="/create-quiz/*" element={<ProtectedRoute requireRole="educator"><CreateQuiz/></ProtectedRoute>}>
            <Route path="auto" element={<AutoGenerate/>} />
          </Route>
          <Route path="/question-bank" element={<ProtectedRoute requireRole="educator"><QuestionBank/></ProtectedRoute>} />
          <Route path="/take-quiz" element={<ProtectedRoute requireRole="student"><TakeQuiz/></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute requireRole="educator"><Dashboard/></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
