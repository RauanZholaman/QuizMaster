import { addDoc, serverTimestamp, collection } from 'firebase/firestore'; // Ensure these are imported
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext'; // Needed for ownerId
import React, { useState, useEffect } from 'react';


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


// --- NEW COMPONENT: Create Quiz From Selection Modal ---
function CreateQuizFromSelectionModal({ selectedQuestions, onClose, onSuccess }) {
    const { user } = useAuth();

    // Initial State when entering quiz creation
    const [quizMetadata, setQuizMetadata] = useState({
        title: '',
        description: '',
        timeLimit: 10,
        allowedAttempts: 3,
        difficulty: 'medium', // Default
        category: '',
        subject: ''
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Auto-fill form based on the first selected question
    useEffect(() => {
        if (selectedQuestions.length > 0) {
            const first = selectedQuestions[0];
            
            // Try to match the existing category to our known IDs
            // Case 1: The question stores the ID (e.g., "web")
            let foundCat = CATEGORIES.find(c => c.id === first.category);
            
            // Case 2: The question stores the Title (e.g., "Web Development") - fallback
            if (!foundCat) {
                foundCat = CATEGORIES.find(c => c.title === first.subject || c.title === first.category);
            }

            if (foundCat) {
                setQuizMetadata(prev => ({
                    ...prev,
                    category: foundCat.id,
                    subject: foundCat.title,
                    subcategory: first.subcategory && SUBCATEGORIES[foundCat.id]?.includes(first.subcategory) 
                        ? first.subcategory 
                        : ''
                }));
            }
        }
    }, [selectedQuestions]);

    const handleCategoryChange = (e) => {
        const selectedId = e.target.value;
        const selectedCategoryObj = CATEGORIES.find(c => c.id === selectedId);

        setQuizMetadata(prev => ({
            ...prev,
            category: selectedId,
            subject: selectedCategoryObj ? selectedCategoryObj.title : '', // Auto-set Subject Title
            subcategory: '' // Reset subcategory when main category changes
        }));
    };

    const handleSubmit = async () => {
        if (!quizMetadata.title) return alert("Please enter a Quiz Title");
        if (!quizMetadata.category) return alert("Please select a Category");
        if (!quizMetadata.subcategory) return alert("Please select a Topic/Subcategory");
        if (!user) return alert("You must be logged in");

        setIsSubmitting(true);
        try {
            const diffObj = {
                easy: quizMetadata.difficulty === 'easy',
                medium: quizMetadata.difficulty === 'medium',
                hard: quizMetadata.difficulty === 'hard'
            };

            const cleanQuestions = selectedQuestions.map(q => ({
                id: q.firestoreId || q.id || Date.now(),
                type: q.type,
                question: q.question,       
                questionText: q.question,
                text: q.question,  
                choices: q.choices || [],
                correctAnswers: q.correctAnswers || [],
                points: 1
            }));

            const payload = {
                title: quizMetadata.title,
                description: quizMetadata.description,
                category: quizMetadata.category, // e.g. "web"
                subject: quizMetadata.subject,     // e.g. "Web Development"
                subcategory: quizMetadata.subcategory, // e.g. "React"
                difficulty: diffObj,
                timeLimit: Number(quizMetadata.timeLimit),
                allowedAttempts: Number(quizMetadata.allowedAttempts),
                shuffle: true,
                questions: cleanQuestions,
                ownerId: user.uid,
                createdAt: serverTimestamp(),
                status: 'published',
                totalQuestions: cleanQuestions.length
            };

            const quizzesCol = collection(db, 'quizzes');
            await addDoc(quizzesCol, payload);

            onSuccess();
            onClose();
        } catch (error) {
            console.error("Error creating quiz:", error);
            alert("Failed to create quiz.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{maxWidth: '500px'}}>
                <div className="modal-header">
                    <h2>Create Quiz from Selection</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>
                <div className="modal-body">
                    <p style={{marginBottom: '15px', color: '#666'}}>
                        Creating a quiz with <strong>{selectedQuestions.length}</strong> selected questions.
                    </p>
                    
                    <div className="form-group">
                        <label>Quiz Title</label>
                        <input type="text" placeholder="e.g. Midterm Review"
                            value={quizMetadata.title}
                            onChange={e => setQuizMetadata({...quizMetadata, title: e.target.value})} />
                    </div>

                    {/* NEW: Category Dropdown */}
                    <div className="form-group">
                        <label>Category</label>
                        <select 
                            value={quizMetadata.category}
                            onChange={handleCategoryChange}
                            style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc'}}
                        >
                            <option value="">Select a Category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.title}</option>
                            ))}
                        </select>
                    </div>

                    {/* NEW: Subcategory Dropdown */}
                    <div className="form-group">
                        <label>Topic / Subcategory</label>
                        <select 
                            value={quizMetadata.subcategory}
                            onChange={e => setQuizMetadata({...quizMetadata, subcategory: e.target.value})}
                            disabled={!quizMetadata.category}
                            style={{width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', opacity: !quizMetadata.category ? 0.6 : 1}}
                        >
                            <option value="">Select a Topic</option>
                            {quizMetadata.category && SUBCATEGORIES[quizMetadata.category]?.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Time Limit (min)</label>
                            <input type="number" value={quizMetadata.timeLimit}
                                onChange={e => setQuizMetadata({...quizMetadata, timeLimit: e.target.value})} />
                        </div>
                        <div className="form-group">
                            <label>Attempts</label>
                            <input type="number" value={quizMetadata.allowedAttempts}
                                onChange={e => setQuizMetadata({...quizMetadata, allowedAttempts: e.target.value})} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Overall Difficulty Tag</label>
                        <select value={quizMetadata.difficulty}
                            onChange={e => setQuizMetadata({...quizMetadata, difficulty: e.target.value})}>
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <input type="text" placeholder="Short description..."
                            value={quizMetadata.description}
                            onChange={e => setQuizMetadata({...quizMetadata, description: e.target.value})} />
                    </div>

                </div>
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-save" onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? 'Creating...' : 'Create Quiz'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CreateQuizFromSelectionModal;