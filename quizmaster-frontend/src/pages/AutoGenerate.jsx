import React, { useState } from 'react';
import '../App.css';
import './AutoGenerate.css';
import { useNavigate } from 'react-router-dom';
import { geminiService } from '../services/geminiService';

const QUESTION_TYPES = {
    MCQ: {
        label: 'Multiple Choice',
    },
    CHECKBOX: {
        label: 'Checkbox',
    },
    TRUE_FALSE: {
        label: 'True/False',
    },
    FILL_BLANK: {
        label: 'Fill in the blank',
    },
    SHORT_ANSWER: {
        label: 'Short Answer',
    }
};

export default function AutoGenerate() {
    const navigate = useNavigate();
    const [paragraph, setParagraph] = useState(
        `This is the sample paragraph. With this paragraph we will get question.\nThis is the sample paragraph. With this paragraph we will get question.\nThis is the sample paragraph. With this paragraph we will get question.`
    );
    const [count, setCount] = useState(10);
    const [selectedType, setSelectedType] = useState('MCQ');
    const [timeLimit, setTimeLimit] = useState(7);
    const [generatedQuestions, setGeneratedQuestions] = useState([]);
    const [showGenerated, setShowGenerated] = useState(false);
    const [loading, setLoading] = useState(false);

    const decreaseTime = () => setTimeLimit(t => Math.max(1, t - 1));
    const increaseTime = () => setTimeLimit(t => t + 1);

    const generateQuestions = async () => {
        if (!paragraph.trim()) {
            alert("Please enter a paragraph to generate questions from.");
            return;
        }

        setLoading(true);
        try {
            const questions = await geminiService.generateQuestions(paragraph, count, selectedType);
            setGeneratedQuestions(questions);
            setShowGenerated(true);
        } catch (error) {
            console.error("Failed to generate questions:", error);
            alert("Failed to generate questions. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = (id) => {
        setGeneratedQuestions(prev => prev.map(q => 
            q.id === id ? { ...q, accepted: true } : q
        ));
    };

    const handleReject = (id) => {
        setGeneratedQuestions(prev => prev.filter(q => q.id !== id));
    };

    const handleAddToQuiz = () => {
        const acceptedQuestions = generatedQuestions.filter(q => q.accepted);
        if (acceptedQuestions.length === 0) {
            alert("Please accept at least one question to add to the quiz.");
            return;
        }
        
        // Navigate to CreateQuiz with the questions
        navigate('/create-quiz', { state: { importedQuestions: acceptedQuestions } });
    };

    const handleCancel = () => {
        setShowGenerated(false);
        setGeneratedQuestions([]);
    };

    return (
        <div className="auto-generate-container">
            <div className="auto-generate-card">
                <div className="header">
                    <button className="back-button" onClick={() => navigate('/create-quiz')}>←</button>
                    <h1>Auto Generate</h1>
                </div>

                {!showGenerated ? (
                    <>
                        <div className="input-paragraph">
                            <label>Input Paragraph</label>
                            <textarea value={paragraph} onChange={(e) => setParagraph(e.target.value)} />
                        </div>

                        <div className="auto-controls">
                            <div className="control-left">
                                <div className="control-row">
                                    <label>No of Questions:</label>
                                    <div className="slider-row">
                                        <input
                                            type="range"
                                            min="1"
                                            max="20"
                                            value={count}
                                            onChange={(e) => setCount(parseInt(e.target.value, 10) || 0)}
                                        />
                                        <span className="slider-value">{count}</span>
                                    </div>
                                </div>

                                <div className="control-row">
                                    <label>Question Type</label>
                                    <select
                                        className="purple-dropdown"
                                        value={selectedType}
                                        onChange={(e) => setSelectedType(e.target.value)}
                                    >
                                        {Object.entries(QUESTION_TYPES).map(([key, { label }]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="control-row time-control">
                                    <label>Time Limit</label>
                                    <div className="time-input">
                                        <button onClick={decreaseTime}>−</button>
                                        <input type="number" value={timeLimit} readOnly />
                                        <button onClick={increaseTime}>+</button>
                                        <span> mins</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 24 }}>
                            <button 
                                className="generate-placeholder" 
                                onClick={generateQuestions}
                                disabled={loading}
                            >
                                {loading ? 'Generating...' : 'Generate Questions'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="generated-questions-container">
                            <h2>Questions</h2>
                            {generatedQuestions.map((q) => (
                                <div key={q.id} className="question-card">
                                    <h3>{q.question}</h3>
                                    {q.choices.length > 0 && (
                                        <div className="choices-list">
                                            {q.choices.map((choice, idx) => (
                                                <div key={idx} className="choice-item">{choice}</div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="question-actions">
                                        <button 
                                            className={`accept-btn ${q.accepted ? 'accepted' : ''}`}
                                            onClick={() => handleAccept(q.id)}
                                            disabled={q.accepted}
                                        >
                                            {q.accepted ? 'Accepted' : 'Accept'}
                                        </button>
                                        <button 
                                            className="reject-btn"
                                            onClick={() => handleReject(q.id)}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="final-actions">
                            <button className="add-to-quiz-btn" onClick={handleAddToQuiz}>
                                ✓ Add To Quiz
                            </button>
                            <button className="cancel-btn" onClick={handleCancel}>
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
