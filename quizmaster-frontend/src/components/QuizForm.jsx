import React, { useState } from "react";

// Question types: MCQ, True/False, Short Answer
const questionTypes = ["MCQ", "True/False", "Short Answer"];

export default function QuizForm() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [timeLimit, setTimeLimit] = useState(""); // in minutes
    const [questions, setQuestions] = useState([]);

    // Add a new empty question
    const addQuestion = () => {
        setQuestions([...questions, { type: "MCQ", questionText: "", options: ["", "", "", ""], answer: "" }]);
    };

    // Update question text or answer
    const updateQuestion = (index, key, value) => {
        const updated = [...questions];
        updated[index][key] = value;
        setQuestions(updated);
    };

    // Update options for MCQ
    const updateOption = (qIndex, optIndex, value) => {
        const updated = [...questions];
        updated[qIndex].options[optIndex] = value;
        setQuestions(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const quizData = { title, description, timeLimit, questions, status: "draft" }; // default draft

        try {
            const response = await fetch("http://localhost:8080/api/quizzes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(quizData)
            });

            const result = await response.json();
            if (result.success) {
                alert(`Quiz saved successfully! Quiz ID: ${result.id}`);
                // Optionally reset the form
                setTitle("");
                setDescription("");
                setTimeLimit("");
                setQuestions([]);
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (error) {
            console.error("Error sending quiz:", error);
            alert("Failed to save quiz. Check console for details.");
        }
    };

    return (
        <div className="quiz-form">
            <h2>Create Quiz</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <input 
                        type="text" 
                        placeholder="Title" 
                        value={title} 
                        onChange={e => setTitle(e.target.value)} 
                        required 
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="text" 
                        placeholder="Description" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        required 
                        className="form-control"
                    />
                </div>
                <div className="form-group">
                    <input 
                        type="number" 
                        placeholder="Time limit (minutes)" 
                        value={timeLimit} 
                        onChange={e => setTimeLimit(e.target.value)} 
                        required 
                        className="form-control"
                    />
                </div>

                <h3>Questions</h3>
                {questions.map((q, index) => (
                    <div key={index} className="question-box">
                        <select 
                            value={q.type} 
                            onChange={e => updateQuestion(index, "type", e.target.value)}
                            className="form-control"
                        >
                            {questionTypes.map(type => 
                                <option key={type} value={type}>{type}</option>
                            )}
                        </select>
                        <input 
                            type="text" 
                            placeholder="Question Text" 
                            value={q.questionText} 
                            onChange={e => updateQuestion(index, "questionText", e.target.value)} 
                            required 
                            className="form-control"
                        />

                        {q.type === "MCQ" && q.options.map((opt, i) => (
                            <input 
                                key={i} 
                                type="text" 
                                placeholder={`Option ${i+1}`} 
                                value={opt} 
                                onChange={e => updateOption(index, i, e.target.value)} 
                                required 
                                className="form-control"
                            />
                        ))}

                        {q.type === "MCQ" && 
                            <input 
                                type="text" 
                                placeholder="Correct answer" 
                                value={q.answer} 
                                onChange={e => updateQuestion(index, "answer", e.target.value)} 
                                required 
                                className="form-control"
                            />
                        }
                        {q.type === "True/False" && (
                            <select 
                                value={q.answer} 
                                onChange={e => updateQuestion(index, "answer", e.target.value)}
                                className="form-control"
                            >
                                <option value="">Select</option>
                                <option value="True">True</option>
                                <option value="False">False</option>
                            </select>
                        )}
                        {q.type === "Short Answer" && 
                            <input 
                                type="text" 
                                placeholder="Answer" 
                                value={q.answer} 
                                onChange={e => updateQuestion(index, "answer", e.target.value)} 
                                required 
                                className="form-control"
                            />
                        }
                    </div>
                ))}

                <button type="button" onClick={addQuestion} className="btn btn-secondary">Add Question</button>
                <button type="submit" className="btn btn-primary">Save Quiz</button>
            </form>
        </div>
    );
}