import React, { useState } from 'react';
import '../App.css';
import './AutoGenerate.css';
import { useNavigate } from 'react-router-dom';

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

    const decreaseTime = () => setTimeLimit(t => Math.max(1, t - 1));
    const increaseTime = () => setTimeLimit(t => t + 1);

    const generateQuestions = () => {
        const questions = [];
        for (let i = 0; i < count; i++) {
            const question = {
                id: Date.now() + i,
                question: `Question ${i + 1}?`,
                type: selectedType,
                choices: selectedType === 'MCQ' || selectedType === 'CHECKBOX' 
                    ? ['Choice 1', 'Choice 2', 'Choice 3'] 
                    : selectedType === 'TRUE_FALSE'
                    ? ['True', 'False']
                    : [],
                accepted: false
            };
            questions.push(question);
        }
        setGeneratedQuestions(questions);
        setShowGenerated(true);
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
        // TODO: Add accepted questions to quiz
        console.log('Adding to quiz:', acceptedQuestions);
        navigate('/create-quiz');
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
                                            min="0"
                                            max="100"
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
                            <button className="generate-placeholder" onClick={generateQuestions}>
                                Generate Questions
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
