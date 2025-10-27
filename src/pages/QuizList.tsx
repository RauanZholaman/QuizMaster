import { Link } from "react-router-dom";

function QuizList() {
  const quizzes = [
    { id: 1, title: "Quiz 1", color: "#ead6ea" },
    { id: 2, title: "Quiz 2", color: "#dfdfe0" },
    { id: 3, title: "Quiz 3", color: "#eab6b6" },
    { id: 4, title: "Quiz 4", color: "#e8e0ab" },
    { id: 5, title: "Quiz 5", color: "#b9c6f0" },
    { id: 6, title: "Quiz 6", color: "#ead6ea" },
    { id: 7, title: "Quiz 7", color: "#eab6b6" },
    { id: 8, title: "Quiz 8", color: "#dfdfe0" },
    { id: 9, title: "Quiz 9", color: "#e8e0ab" },
  ];

  return (
    <div className="min-h-screen bg-white">
      <h1 className="text-xl font-bold p-6">
        Quiz Taking / Quiz Selections
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-6 pb-10">
        {quizzes.map((q) => (
          <Link key={q.id} to={`/quiz/${q.id}`}>
            <div
              className="w-52 h-28 flex items-center justify-center rounded-md shadow cursor-pointer"
              style={{ backgroundColor: q.color }}
            >
              <span className="font-semibold">{q.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default QuizList;
