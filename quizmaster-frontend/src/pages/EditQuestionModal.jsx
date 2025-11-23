import React, { useState } from 'react';

const QUESTION_TYPES = {
    MCQ: { label: 'Multiple Choice', hasChoices: true, choiceCount: 4, multipleCorrect: false },
    CHECKBOX: { label: 'Checkbox', hasChoices: true, choiceCount: 4, multipleCorrect: true },
    TRUE_FALSE: { label: 'True/False', hasChoices: true, choiceCount: 2, fixedChoices: ['True', 'False'], multipleCorrect: false },
    FILL_BLANK: { label: 'Fill in the blank', hasChoices: false, multipleCorrect: false },
    SHORT_ANSWER: { label: 'Short Answer', hasChoices: false, multipleCorrect: false }
};

function EditQuestionModal({ question, onClose, onSave }) {
    console.log("Modal Received Prop:", question); 

    // 1. Initialize state with existing data
    // Helper to convert DB difficulty object {easy:true...} to string 'easy'
    const initialDiff = question.difficulty?.easy ? 'easy' : question.difficulty?.medium ? 'medium' : 'hard';
    
    const [formData, setFormData] = useState({
        ...question,
        difficultyStr: initialDiff, // Temporary field for UI
        choices: question.choices || [],
        correctAnswers: question.correctAnswers || []
    });

    const typeConfig = QUESTION_TYPES[formData.type] || QUESTION_TYPES.MCQ;

    // 2. Handle Field Changes
    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    // 3. Handle Type Change (Reset choices if needed)
    const handleTypeChange = (newType) => {
        const newConfig = QUESTION_TYPES[newType];
        setFormData(prev => ({
            ...prev,
            type: newType,
            choices: newConfig.hasChoices 
                ? (newConfig.fixedChoices ? [...newConfig.fixedChoices] : Array(newConfig.choiceCount).fill(''))
                : [],
            correctAnswers: [] // Reset answers on type change
        }));
    };

    // 4. Handle Choice Text Change
    const handleChoiceChange = (index, text) => {
        const newChoices = [...formData.choices];
        newChoices[index] = text;
        setFormData(prev => ({ ...prev, choices: newChoices }));
    };

    // 5. Handle Correct Answer Selection
    const handleCorrectAnswer = (value) => {
        let newCorrect = [...formData.correctAnswers];
        
        if (typeConfig.multipleCorrect) {
            // Checkbox logic
            if (newCorrect.includes(value)) {
                newCorrect = newCorrect.filter(a => a !== value);
            } else {
                newCorrect.push(value);
            }
        } else {
            // Radio logic
            newCorrect = [value];
        }
        setFormData(prev => ({ ...prev, correctAnswers: newCorrect }));
    };

    // 6. Handle Saving

    const handleSaveClick = () => {
        // 1. SMART ID FINDER: Try to find the ID regardless of what it's named
        const docId = question.firestoreId || question.id;

        console.log("Found ID:", docId); // Debugging

        if (!docId) {
            alert("Critical Error: Could not find the Question ID. Please check the console.");
            console.log("Full Question Object that is missing ID:", question);
            return;
        }

        // 2. Reconstruct difficulty object
        const diffObj = {
            easy: formData.difficultyStr === 'easy',
            medium: formData.difficultyStr === 'medium',
            hard: formData.difficultyStr === 'hard'
        };

        // 3. Create Clean Payload
        const payload = {
            question: formData.question,
            type: formData.type,
            difficulty: diffObj,
            choices: typeConfig.hasChoices ? (formData.choices || []) : [],
            correctAnswers: typeConfig.hasChoices 
                ? (formData.correctAnswers || []) 
                : [String(formData.correctAnswers[0] || '').trim()]
        };

        // 4. Save using the found ID
        onSave(docId, payload);
    };

       return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Edit Question</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Question Text */}
                    <div className="form-group">
                        <label>Question</label>
                        <textarea 
                            value={formData.question} 
                            onChange={(e) => handleChange('question', e.target.value)}
                            rows={3}
                        />
                    </div>

                    {/* Row: Type & Difficulty */}
                    <div className="form-row">
                        <div className="form-group">
                            <label>Type</label>
                            <select 
                                value={formData.type} 
                                onChange={(e) => handleTypeChange(e.target.value)}
                            >
                                {Object.entries(QUESTION_TYPES).map(([key, config]) => (
                                    <option key={key} value={key}>{config.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Difficulty</label>
                            <select 
                                value={formData.difficultyStr} 
                                onChange={(e) => handleChange('difficultyStr', e.target.value)}
                            >
                                <option value="easy">Easy</option>
                                <option value="medium">Medium</option>
                                <option value="hard">Hard</option>
                            </select>
                        </div>
                    </div>

                    {/* Dynamic Choices Area */}
                    {typeConfig.hasChoices ? (
                        <div className="choices-area">
                            <label>Choices & Correct Answer</label>
                            {formData.choices.map((choice, idx) => (
                                <div key={idx} className="choice-row">
                                    <input 
                                        type={typeConfig.multipleCorrect ? "checkbox" : "radio"}
                                        name="correctAnswer"
                                        checked={formData.correctAnswers.includes(idx)}
                                        onChange={() => handleCorrectAnswer(idx)}
                                    />
                                    <input 
                                        type="text" 
                                        value={choice}
                                        onChange={(e) => handleChoiceChange(idx, e.target.value)}
                                        disabled={!!typeConfig.fixedChoices} // Disable edit for T/F
                                        placeholder={`Option ${idx + 1}`}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="form-group">
                            <label>Correct Answer</label>
                            <input 
                                type="text"
                                value={formData.correctAnswers[0] || ''}
                                onChange={(e) => handleCorrectAnswer(e.target.value)}
                                placeholder="Enter correct answer..."
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose}>Cancel</button>
                    <button className="btn-save" onClick={handleSaveClick}>Save Changes</button>
                </div>
            </div>
        </div>
    );
}

export default EditQuestionModal;