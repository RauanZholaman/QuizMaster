import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css';
import './CreateQuiz.css';
import './AutoGenerate.css';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { geminiService } from '../services/geminiService';

const QUESTION_TYPES = {
    MCQ: {
        label: 'Multiple Choice',
        hasChoices: true,
        choiceCount: 4,
        multipleCorrect: false
    },
    CHECKBOX: {
        label: 'Checkbox',
        hasChoices: true,
        choiceCount: 4,
        multipleCorrect: true
    },
    TRUE_FALSE: {
        label: 'True/False',
        hasChoices: true,
        choiceCount: 2,
        fixedChoices: ['True', 'False'],
        multipleCorrect: false
    },
    FILL_BLANK: {
        label: 'Fill in the blank',
        hasChoices: false,
        multipleCorrect: false
    },
    SHORT_ANSWER: {
        label: 'Short Answer',
        hasChoices: false,
        multipleCorrect: false
    }
};

// Categories from quiz taking feature
const CATEGORIES = [
    { id: "data-structures", title: "Data Structures" },
    { id: "maths", title: "Maths" },
    { id: "programming", title: "Programming" },
    { id: "oop", title: "Object Oriented Programming" },
    { id: "web", title: "Web Development" },
    { id: "dbms", title: "Database Management" },
    { id: "networking", title: "Networking" },
    { id: "python", title: "Python" },
    { id: "java", title: "Java" }
];

// Subcategories/Topics per category
const SUBCATEGORIES = {
    "data-structures": ["Arrays", "Linked Lists", "Trees", "Graphs", "Hash Tables"],
    "maths": ["Algebra", "Calculus", "Statistics", "Geometry", "Probability"],
    "programming": ["Basics", "Control Flow", "Functions", "Data Types", "Algorithms"],
    "oop": ["Classes", "Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
    "web": ["HTML & CSS", "JavaScript", "React", "Node.js", "APIs"],
    "dbms": ["SQL Basics", "Joins", "Indexes", "Normalization", "Transactions"],
    "networking": ["OSI Model", "IP Addressing", "Routing", "Protocols", "Security"],
    "python": ["Syntax", "Data Types", "Libraries", "OOP in Python", "File Handling"],
    "java": ["Syntax", "OOP in Java", "Collections", "Exception Handling", "Multithreading"]
};

export default function CreateQuiz() {
    const { user } = useAuth();
    // const navigate = useNavigate(); // Not currently used
    const [creationType, setCreationType] = useState(null);
    const [quizData, setQuizData] = useState({
        title: '',
        description: '',
        category: '', // For quiz taking feature
        subject: '', // Human-readable subject name
        subcategory: '', // Topic/subtopic within category
        quizType: '',
        difficulty: {
            easy: false,
            medium: false,
            hard: false
        },
        timeLimit: 7,
        allowedAttempts: 5,
        shuffle: false,
        questions: [],
        status: ''
    });

    const handleManualCreation = () => {
        setCreationType('manual');
    };

    const handleAutoGeneration = () => {
        setCreationType('auto');
    };

    const handleBack = () => {
        setCreationType(null);
    };

    const handleInputChange = (field, value) => {
        setQuizData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleDifficultyChange = (level) => {
        setQuizData(prev => ({
            ...prev,
            difficulty: {
                easy: level === 'easy',
                medium: level === 'medium',
                hard: level === 'hard'
            }
        }));
    };

    const handleTimeLimit = (increment) => {
        setQuizData(prev => ({
            ...prev,
            timeLimit: Math.max(1, prev.timeLimit + increment)
        }));
    };

    const handleAttempts = (increment) => {
        setQuizData(prev => ({
            ...prev,
            allowedAttempts: Math.max(1, prev.allowedAttempts + increment)
        }));
    };

    const handleAddQuestion = () => {
        const newQuestion = {
            id: Date.now(),
            type: 'MCQ',
            question: '',
            choices: Array(QUESTION_TYPES.MCQ.choiceCount).fill(''),
            correctAnswers: [],
            addToBank: false
        };

        setQuizData(prev => ({
            ...prev,
            questions: [...prev.questions, newQuestion]
        }));
    };

    const handleQuestionTypeChange = (questionId, newType) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === questionId) {
                    const questionType = QUESTION_TYPES[newType];
                    return {
                        ...q,
                        type: newType,
                        choices: questionType.hasChoices 
                            ? Array(questionType.choiceCount).fill('') 
                            : [],
                        correctAnswers: []
                    };
                }
                return q;
            })
        }));
    };

    const handleQuestionChange = (questionId, field, value) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === questionId) {
                    if (field === 'choices') {
                        const newChoices = [...q.choices];
                        newChoices[value.index] = value.text;
                        return { ...q, choices: newChoices };
                    }
                    if (field === 'correctAnswers') {
                        const type = QUESTION_TYPES[q.type];
                        let newCorrectAnswers = [...q.correctAnswers];
                        
                        if (type.multipleCorrect) {
                            // For checkbox questions
                            if (newCorrectAnswers.includes(value)) {
                                newCorrectAnswers = newCorrectAnswers.filter(a => a !== value);
                            } else {
                                newCorrectAnswers.push(value);
                            }
                        } else {
                            // For single answer questions
                            newCorrectAnswers = [value];
                        }
                        
                        return { ...q, correctAnswers: newCorrectAnswers };
                    }
                    return { ...q, [field]: value };
                }
                return q;
            })
        }));
    };

    const handleRemoveQuestion = (questionId) => {
        setQuizData(prev => ({
            ...prev,
            questions: prev.questions.filter(q => q.id !== questionId)
        }));
    };

    const renderQuizCreationOptions = () => (
        <div className="quiz-creation-options">
            <h1>Quiz Creation</h1>
            <div className="creation-buttons">
                <button onClick={handleManualCreation} className="creation-button manual">
                    Manual Creation
                </button>
                <button onClick={handleAutoGeneration} className="creation-button auto">
                    Auto Generate
                </button>
            </div>
        </div>
    );

    const renderManualCreation = () => (
        <div className="manual-creation">
            <div className="header">
                <button onClick={handleBack} className="back-button">←</button>
                <h1>Manual Creation</h1>
            </div>
            <div className="basic-information">
                <h2>Basic Information</h2>
                <div className="form-group">
                    <label>Title</label>
                    <input 
                        type="text" 
                        placeholder="Quiz 1" 
                        value={quizData.title}
                        onChange={(e) => handleInputChange('title', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Description</label>
                    <input 
                        type="text" 
                        placeholder="This is the description." 
                        value={quizData.description}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                    />
                </div>
                <div className="form-group">
                    <label>Category</label>
                    <select 
                        value={quizData.category}
                        onChange={(e) => {
                            const selectedCategory = CATEGORIES.find(c => c.id === e.target.value);
                            setQuizData(prev => ({
                                ...prev,
                                category: e.target.value,
                                subject: selectedCategory ? selectedCategory.title : '',
                                subcategory: '' // Reset subcategory when category changes
                            }));
                        }}
                        style={{
                            width: '100%',
                            padding: '10px',
                            borderRadius: '5px',
                            border: '1px solid #ccc',
                            fontSize: '14px'
                        }}
                    >
                        <option value="">Select a category</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.title}</option>
                        ))}
                    </select>
                </div>
                {quizData.category && SUBCATEGORIES[quizData.category] && (
                    <div className="form-group">
                        <label>Topic/Subcategory</label>
                        <select 
                            value={quizData.subcategory}
                            onChange={(e) => handleInputChange('subcategory', e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '5px',
                                border: '1px solid #ccc',
                                fontSize: '14px'
                            }}
                        >
                            <option value="">Select a topic *</option>
                            {SUBCATEGORIES[quizData.category].map(topic => (
                                <option key={topic} value={topic}>{topic}</option>
                            ))}
                        </select>
                    </div>
                )}
                <div className="form-group">
                    <label>Quiz Type</label>
                    <div className="quiz-type-options">
                        <label>
                            <input 
                                type="radio" 
                                name="quizType" 
                                value="formative"
                                checked={quizData.quizType === 'formative'}
                                onChange={(e) => handleInputChange('quizType', e.target.value)}
                            />
                            Formative
                        </label>
                        <label>
                            <input 
                                type="radio" 
                                name="quizType" 
                                value="summative"
                                checked={quizData.quizType === 'summative'}
                                onChange={(e) => handleInputChange('quizType', e.target.value)}
                            />
                            Summative
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label>Difficulty</label>
                    <div className="difficulty-options">
                        <label>
                            <input 
                                type="radio"
                                name="difficulty"
                                value="easy"
                                checked={quizData.difficulty.easy}
                                onChange={() => handleDifficultyChange('easy')}
                            /> Easy
                        </label>
                        <label>
                            <input 
                                type="radio"
                                name="difficulty"
                                value="medium"
                                checked={quizData.difficulty.medium}
                                onChange={() => handleDifficultyChange('medium')}
                            /> Medium
                        </label>
                        <label>
                            <input 
                                type="radio"
                                name="difficulty"
                                value="hard"
                                checked={quizData.difficulty.hard}
                                onChange={() => handleDifficultyChange('hard')}
                            /> Hard
                        </label>
                    </div>
                </div>
                <div className="form-group">
                    <label>Time Limit</label>
                    <div className="time-limit-control">
                        <input 
                            type="number" 
                            value={quizData.timeLimit}
                            onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 1)}
                        /> mins
                        <button onClick={() => handleTimeLimit(-1)}>-</button>
                        <button onClick={() => handleTimeLimit(1)}>+</button>
                    </div>
                </div>
                <div className="form-group">
                    <label>Allowed Attempts</label>
                    <div className="attempts-control">
                        <input 
                            type="number" 
                            value={quizData.allowedAttempts}
                            onChange={(e) => handleInputChange('allowedAttempts', parseInt(e.target.value) || 1)}
                        /> attempts
                        <button onClick={() => handleAttempts(-1)}>-</button>
                        <button onClick={() => handleAttempts(1)}>+</button>
                    </div>
                </div>
                <div className="form-group">
                    <label>
                        <input 
                            type="checkbox"
                            checked={quizData.shuffle}
                            onChange={(e) => handleInputChange('shuffle', e.target.checked)}
                        />
                        Shuffle
                    </label>
                    <div className="shuffle-hint">When enabled, questions will be shuffled during quiz taking (preserves answers but randomizes order).</div>
                </div>
            </div>

            <div className="question-management">
                <h2>Question Management</h2>
                <button className="add-question-btn" onClick={handleAddQuestion}>+ Add Question</button>
                
                {quizData.questions.map((question, index) => (
                    <div key={question.id} className="question-form">
                        <div className="question-header">
                            <h3>Question {index + 1}</h3>
                            <button 
                                className="remove-question-btn"
                                onClick={() => handleRemoveQuestion(question.id)}
                            >
                                Remove
                            </button>
                        </div>

                        <div className="form-group">
                            <label>Question Type</label>
                            <select 
                                value={question.type}
                                onChange={(e) => handleQuestionTypeChange(question.id, e.target.value)}
                                className="question-type-select"
                            >
                                {Object.entries(QUESTION_TYPES).map(([value, { label }]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="question-options">
                            <div className="form-group">
                                <label>Question</label>
                                <input 
                                    type="text" 
                                    placeholder="Enter your question" 
                                    value={question.question}
                                    onChange={(e) => handleQuestionChange(question.id, 'question', e.target.value)}
                                />
                            </div>

                            {QUESTION_TYPES[question.type].hasChoices && (
                                <div className="choices-container">
                                    {question.choices.map((choice, idx) => (
                                        <div key={idx} className="form-group choice-group">
                                            <div className="choice-input">
                                                <label>
                                                    {QUESTION_TYPES[question.type].multipleCorrect ? (
                                                        <input
                                                            type="checkbox"
                                                            checked={question.correctAnswers.includes(idx)}
                                                            onChange={() => handleQuestionChange(question.id, 'correctAnswers', idx)}
                                                        />
                                                    ) : (
                                                        <input
                                                            type="radio"
                                                            name={`correct_${question.id}`}
                                                            checked={question.correctAnswers.includes(idx)}
                                                            onChange={() => handleQuestionChange(question.id, 'correctAnswers', idx)}
                                                        />
                                                    )}
                                                </label>
                                                <input
                                                    type="text"
                                                    placeholder={`Choice ${idx + 1}`}
                                                    value={QUESTION_TYPES[question.type].fixedChoices ? 
                                                        QUESTION_TYPES[question.type].fixedChoices[idx] : 
                                                        choice}
                                                    onChange={(e) => handleQuestionChange(question.id, 'choices', {
                                                        index: idx,
                                                        text: e.target.value
                                                    })}
                                                    disabled={QUESTION_TYPES[question.type].fixedChoices}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {!QUESTION_TYPES[question.type].hasChoices && (
                                <div className="form-group">
                                    <label>Correct Answer</label>
                                    <input
                                        type="text"
                                        placeholder="Enter the correct answer"
                                value={question.correctAnswers[0] || ''}
                                onChange={(e) => handleQuestionChange(question.id, 'correctAnswers', e.target.value)}
                                    />
                                    {question.type === 'SHORT_ANSWER' && (
                                        <small className="hint">* Answer is case insensitive</small>
                                    )}
                                </div>
                            )}

                            <div className="form-group">
                                <label className="inline-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={question.addToBank}
                                        onChange={(e) => handleQuestionChange(question.id, 'addToBank', e.target.checked)}
                                    />
                                    Add to Question Bank
                                </label>
                            </div>
                        </div>
                    </div>
                ))}

                {quizData.questions.length > 0 && (
                    <div className="form-actions">
                        <button className="save-draft" onClick={() => handleSaveDraft()}>Save Draft</button>
                        <button className="publish" onClick={() => handlePublish()}>Publish</button>
                        <button className="cancel" onClick={handleBack}>Cancel</button>
                    </div>
                )}
            </div>
        </div>
    );

    // Helpers: normalize answers for case-insensitive types
    const normalizeQuestionForStorage = (q) => {
        const typeConfig = QUESTION_TYPES[q.type];
        const stored = {
            id: q.id,
            type: q.type,
            question: q.question,
            questionText: q.question,  // For QuestionViewer compatibility
            text: q.question,          // Alternative fallback field
            addToBank: !!q.addToBank
        };

        if (typeConfig.hasChoices) {
            // Ensure fixedChoices are used when provided (e.g., True/False)
            stored.choices = typeConfig.fixedChoices ? [...typeConfig.fixedChoices] : [...q.choices];
            // correctAnswers are indices for choice types
            stored.correctAnswers = Array.isArray(q.correctAnswers) ? [...q.correctAnswers] : [];
        } else {
            // For text answers, store normalized (lowercase, trimmed) for case-insensitive matching
            const raw = (Array.isArray(q.correctAnswers) && q.correctAnswers[0]) ? q.correctAnswers[0] : '';
            stored.correctAnswers = [String(raw).toLowerCase().trim()];
        }

        return stored;
    };

    const handleSaveDraft = async () => {
        if (!user) {
            alert('Please sign in to save drafts in your account.');
            return;
        }

        // Validate category and subcategory selection
        if (!quizData.category) {
            alert('Please select a main category before saving.');
            return;
        }
        if (!quizData.subcategory) {
            alert('Please select a topic/subcategory before saving.');
            return;
        }

        // Validate that there are questions
        if (!quizData.questions || quizData.questions.length === 0) {
            alert('Please add at least one question before saving to Question Bank.');
            return;
        }

        try {
            // Save each question individually to questionBank collection
            const questionBankCol = collection(db, 'questionBank');
            const promises = [];
            
            quizData.questions.forEach((q) => {
                const questionDoc = {
                    ...normalizeQuestionForStorage(q),
                    category: quizData.category,
                    subject: quizData.subject,
                    subcategory: quizData.subcategory,
                    quizTitle: quizData.title || 'Untitled Quiz',
                    difficulty: quizData.difficulty,
                    createdBy: user.uid,
                    createdAt: serverTimestamp(),
                    status: 'draft'
                };
                promises.push(addDoc(questionBankCol, questionDoc));
            });
            
            await Promise.all(promises);
            alert(`${quizData.questions.length} question(s) saved to Question Bank! You can continue adding more questions.`);
            
            // DO NOT reset form - user can continue adding questions
        } catch (error) {
            console.error('Error saving draft:', error);
            alert('Failed to save draft. Please try again.');
        }
    };

    const handlePublish = async () => {
        if (!user) {
            alert('Please sign in to publish quizzes.');
            return;
        }

        // Basic validation
        if (!quizData.title || quizData.title.trim().length === 0) {
            alert('Please provide a title for the quiz before publishing.');
            return;
        }
        if (!quizData.category) {
            alert('Please select a main category before publishing.');
            return;
        }
        if (!quizData.subcategory) {
            alert('Please select a topic/subcategory before publishing.');
            return;
        }
        if (!quizData.questions || quizData.questions.length === 0) {
            alert('Please add at least one question before publishing.');
            return;
        }

        const difficultySelected = 
            quizData.difficulty.easy ||
            quizData.difficulty.medium ||
            quizData.difficulty.hard;

        if (!difficultySelected) {
            alert('Please select a difficulty level');
            return;
        }

        const payload = {
            title: quizData.title,
            description: quizData.description,
            category: quizData.category,     // For quiz taking feature
            subject: quizData.subject,       // Human-readable name
            subcategory: quizData.subcategory || '', // Topic/subtopic
            quizType: quizData.quizType,
            difficulty: quizData.difficulty,
            timeLimit: quizData.timeLimit,
            allowedAttempts: quizData.allowedAttempts,
            shuffle: quizData.shuffle,
            questions: quizData.questions.map(normalizeQuestionForStorage),
            ownerId: user.uid,
            createdAt: serverTimestamp(),
            status: 'published',
            published: true                  // For api.js compatibility
        };

        try {
            const quizzesCol = collection(db, 'quizzes');
            console.log("📤 Publishing quiz with payload:", payload);
            const quizRef = await addDoc(quizzesCol, payload);
            console.log("✅ Quiz published successfully with ID:", quizRef.id);
            console.log("📋 Quiz details - Category:", payload.category, "Subject:", payload.subject, "Status:", payload.status);
            
            // Save questions to questionBank if requested
            const questionBankCol = collection(db, 'questionBank');
            const promises = [];
            quizData.questions.forEach((q) => {
                if (q.addToBank) {
                    const qb = normalizeQuestionForStorage(q);
                    // include reference to published quiz id for traceability
                    qb.category = quizData.category;     
                    qb.subject = quizData.subject;          
                    qb.subcategory = quizData.subcategory;
                    qb.quizId = quizRef.id;
                    qb.ownerId = user.uid;
                    qb.createdAt = serverTimestamp();
                    qb.difficulty = quizData.difficulty;
                    // qb.status = quizData.status;
                    qb.status = 'published';
                    promises.push(addDoc(questionBankCol, qb));
                }
            });
            await Promise.all(promises);
            alert('Quiz published successfully and is now available for students to take!');
            // Clear form
            setQuizData({
                title: '',
                description: '',
                category: '',
                subject: '',
                subcategory: '',
                quizType: '',
                difficulty: { easy: false, medium: false, hard: false },
                tags: [],
                timeLimit: 7,
                allowedAttempts: 5,
                shuffle: false,
                questions: [],
                status: ''
            });
            setCreationType(null);
        } catch (err) {
            console.error('Publish failed', err);
            alert('Failed to publish quiz. See console for details.');
        }
    };

    const [autoGenState, setAutoGenState] = useState({
        quizTitle: "",
        inputText: "This is the sample paragraph. With this paragraph we will get question.\nThis is the sample paragraph. With this paragraph we will get question.\nThis is the sample paragraph. With this paragraph we will get question.",
        questionCount: 10,
        questionType: "MCQ",
        timeLimit: 7,
        selectedTypes: { TRUE_FALSE: true },
        generatedQuestions: [],
        showGenerated: false,
        isGenerating: false
    });

    const handleAutoGenInputChange = (field, value) => {
        setAutoGenState(prev => ({
            ...prev,
            [field]: value
        }));
    };

    // eslint-disable-next-line no-unused-vars
    const handleTypeToggle = (type) => {
        setAutoGenState(prev => ({
            ...prev,
            selectedTypes: {
                ...prev.selectedTypes,
                [type]: !prev.selectedTypes[type]
            }
        }));
    };

    const handleAutoGenTimeLimit = (increment) => {
        setAutoGenState(prev => ({
            ...prev,
            timeLimit: Math.max(1, prev.timeLimit + increment)
        }));
    };

    const generateQuestions = async () => {
        setAutoGenState(prev => ({ ...prev, isGenerating: true }));
        
        try {
            const questions = await geminiService.generateQuestions(
                autoGenState.inputText,
                autoGenState.questionCount,
                autoGenState.questionType
            );
            
            setAutoGenState(prev => ({
                ...prev,
                generatedQuestions: questions,
                showGenerated: true,
                isGenerating: false
            }));
        } catch (error) {
            console.error('Error generating questions:', error);
            alert('Failed to generate questions. Please check your API key and try again.');
            setAutoGenState(prev => ({ ...prev, isGenerating: false }));
        }
    };

    const handleAcceptQuestion = (id) => {
        setAutoGenState(prev => ({
            ...prev,
            generatedQuestions: prev.generatedQuestions.map(q => 
                q.id === id ? { ...q, accepted: true } : q
            )
        }));
    };

    const handleRejectQuestion = (id) => {
        setAutoGenState(prev => ({
            ...prev,
            generatedQuestions: prev.generatedQuestions.filter(q => q.id !== id)
        }));
    };

    const handleAddGeneratedToQuiz = () => {
        const acceptedQuestions = autoGenState.generatedQuestions.filter(q => q.accepted);
        console.log('Adding to quiz:', acceptedQuestions);
        // Reset auto gen state
        setAutoGenState(prev => ({
            ...prev,
            generatedQuestions: [],
            showGenerated: false
        }));
        // Go back to quiz creation options or manual mode
        setCreationType(null);
    };

    const handleCancelGenerated = () => {
        setAutoGenState(prev => ({
            ...prev,
            generatedQuestions: [],
            showGenerated: false
        }));
    };

    const renderAutoGeneration = () => (
        <div className="auto-generate-container">
            <div className="auto-generate-card">
                <div className="header">
                    <button className="back-button" onClick={handleBack}>←</button>
                    <h1>Auto Generate</h1>
                </div>

                {!autoGenState.showGenerated ? (
                    <>
                        <div className="form-group">
                            <label>Quiz Title</label>
                            <input 
                                type="text"
                                placeholder="Enter quiz title" 
                                value={autoGenState.quizTitle}
                                onChange={(e) => handleAutoGenInputChange('quizTitle', e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select 
                                value={quizData.category}
                                onChange={(e) => {
                                    const selectedCategory = CATEGORIES.find(c => c.id === e.target.value);
                                    setQuizData(prev => ({
                                        ...prev,
                                        category: e.target.value,
                                        subject: selectedCategory ? selectedCategory.title : '',
                                        subcategory: '' // Reset subcategory when category changes
                                    }));
                                }}
                                style={{
                                    width: '100%',
                                    padding: '10px',
                                    borderRadius: '5px',
                                    border: '1px solid #ccc',
                                    fontSize: '14px'
                                }}
                            >
                                <option value="">Select a category</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.title}</option>
                                ))}
                            </select>
                        </div>

                        {quizData.category && SUBCATEGORIES[quizData.category] && (
                            <div className="form-group">
                                <label>Topic/Subcategory *</label>
                                <select 
                                    value={quizData.subcategory}
                                    onChange={(e) => handleInputChange('subcategory', e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        borderRadius: '5px',
                                        border: '1px solid #ccc',
                                        fontSize: '14px'
                                    }}
                                >
                                    <option value="">Select a topic *</option>
                                    {SUBCATEGORIES[quizData.category].map(topic => (
                                        <option key={topic} value={topic}>{topic}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="input-paragraph">
                            <label>Input Paragraph</label>
                            <textarea 
                                placeholder="Enter your paragraph here..." 
                                value={autoGenState.inputText}
                                onChange={(e) => handleAutoGenInputChange('inputText', e.target.value)}
                            />
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
                                            value={autoGenState.questionCount}
                                            onChange={(e) => handleAutoGenInputChange('questionCount', Number(e.target.value))}
                                        />
                                        <span className="slider-value">{autoGenState.questionCount}</span>
                                    </div>
                                </div>

                                <div className="control-row">
                                    <label>Question Type</label>
                                    <select 
                                        value={autoGenState.questionType}
                                        onChange={(e) => handleAutoGenInputChange('questionType', e.target.value)}
                                    >
                                        {Object.entries(QUESTION_TYPES).map(([key, { label }]) => (
                                            <option key={key} value={key}>{label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="control-row time-control">
                                    <label>Time Limit</label>
                                    <div className="time-input">
                                        <button onClick={() => handleAutoGenTimeLimit(-1)}>−</button>
                                        <input 
                                            type="number" 
                                            value={autoGenState.timeLimit} 
                                            readOnly 
                                        />
                                        <button onClick={() => handleAutoGenTimeLimit(1)}>+</button>
                                        <span> mins</span>
                                    </div>
                                </div>
                            </div>

                            {/* Removed checkbox group for question types. Only dropdown remains. */}
                        </div>

                        <div style={{ textAlign: 'center', marginTop: 24 }}>
                            <button 
                                className="generate-placeholder" 
                                onClick={generateQuestions}
                                disabled={autoGenState.isGenerating || !autoGenState.inputText.trim()}
                            >
                                {autoGenState.isGenerating ? 'Generating Questions...' : 'Generate Questions'}
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="generated-questions-container">
                            <h2>Questions</h2>
                            {autoGenState.generatedQuestions.map((q) => (
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
                                            onClick={() => handleAcceptQuestion(q.id)}
                                            disabled={q.accepted}
                                        >
                                            {q.accepted ? 'Accepted' : 'Accept'}
                                        </button>
                                        <button 
                                            className="reject-btn"
                                            onClick={() => handleRejectQuestion(q.id)}
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="final-actions">
                            <button className="add-to-quiz-btn" onClick={handleAddGeneratedToQuiz}>
                                ✓ Add To Quiz
                            </button>
                            <button className="cancel-btn" onClick={handleCancelGenerated}>
                                Cancel
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <div className="create-quiz-container">
            {!creationType && renderQuizCreationOptions()}
            {creationType === 'manual' && renderManualCreation()}
            {creationType === 'auto' && renderAutoGeneration()}
        </div>
    );
}
