import { Link, useParams } from "react-router-dom";

export default function Feedback() {
  const { id } = useParams();
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-center space-y-6">
      <h1 className="text-xl font-bold">Quiz {id}</h1>
      <div className="bg-[#ead6ea] rounded p-8 w-3/4 max-w-2xl">
        <p className="text-lg font-medium mb-2">You have submitted!</p>
        <p>Click <span className="underline">here</span> to view your grading & feedback.</p>
      </div>
      <div className="flex gap-4">
        <Link to="/" className="px-5 py-2 border rounded-full bg-pink-200 hover:bg-pink-300">
          Back to QuizMaster
        </Link>
        <Link to="/" className="px-5 py-2 border rounded-full hover:bg-gray-100">
          Take New Quiz
        </Link>
      </div>
    </div>
  );
}
