import { BrowserRouter, Routes, Route } from "react-router-dom";
import QuizList from "./pages/QuizList";
import PreQuiz from "./pages/PreQuiz";
import QuestionViewer from "./pages/QuestionViewer";
import Feedback from "./pages/Feedback";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QuizList />} />
        <Route path="/quiz/:id" element={<PreQuiz />} />
        <Route path="/attempt/:id" element={<QuestionViewer />} />
        <Route path="/feedback/:id" element={<Feedback />} />
      </Routes>
    </BrowserRouter>
  );
}
