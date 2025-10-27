import { useParams, useNavigate } from "react-router-dom";

export default function PreQuiz() {
  const { id } = useParams();
  const nav = useNavigate();

  const meta = { title: `Quiz ${id}`, questions: 10, timeMins: 15 };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center">
      {/* Header */}
      <h1 className="text-xl font-bold mt-6 mb-8">{meta.title}</h1>

      <div className="w-full max-w-3xl flex flex-col items-center space-y-5">
        {/* Instructions banner */}
        <div className="bg-[#ead6ea] py-3 w-3/4 text-center rounded text-lg font-medium">
          Instructions
        </div>

        {/* Question & time info */}
        <div className="bg-[#ead6ea] w-3/4 rounded p-10 text-lg flex flex-col gap-6 items-center">
          <div className="flex justify-between w-3/4">
            <span>Questions :</span>
            <span className="font-bold">{meta.questions} qus</span>
          </div>
          <div className="flex justify-between w-3/4">
            <span>Time limit :</span>
            <span className="font-bold">{meta.timeMins} mins</span>
          </div>
        </div>

        {/* Note */}
        <p className="text-sm text-gray-800 text-center w-3/4">
          Note: The quiz auto-submits after the time limit, even if all questions aren’t done.
        </p>

        {/* Start button */}
        <button
          className="px-8 py-2 rounded-full border bg-pink-200 border-pink-300 hover:bg-pink-300 transition text-sm"
          onClick={() =>
            nav(`/attempt/${id}`, {
              state: {
                questionCount: meta.questions,
                timeLimitSeconds: meta.timeMins * 60, // 15 mins → seconds
              },
            })
          }
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
}
