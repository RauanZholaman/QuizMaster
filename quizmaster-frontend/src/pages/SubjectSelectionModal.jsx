import React, { useState } from 'react';


function SubjectSelectionModal({ questions, currentFilter, onClose, onApply }) {
    const [selectedSubject, setSelectedSubject] = useState(currentFilter?.subject || null);
    
    // 1. Build Hierarchy Tree from available questions
    // Structure: { "Web Development": ["HTML", "React"], "Math": ["Algebra"] }
    const hierarchy = React.useMemo(() => {
        const tree = {};
        questions.forEach(q => {
            if (q.subject) {
                if (!tree[q.subject]) tree[q.subject] = new Set();
                if (q.subcategory) tree[q.subject].add(q.subcategory);
            }
        });
        return tree;
    }, [questions]);

    const handleSubjectClick = (subject) => {
        // If clicking the same subject, toggle it off (optional) or just select it
        setSelectedSubject(subject);
    };

    const handleApply = (subject, subcategory = null) => {
        onApply({ subject, subcategory });
        onClose();
    };

    const handleClear = () => {
        onApply(null);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{maxWidth: '700px'}}>
                <div className="modal-header">
                    <h2>Filter by Subject</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body subject-filter-layout">
                    {/* Left Column: Subjects */}
                    <div className="subject-column">
                        <h4>Subjects</h4>
                        <div className="filter-list">
                            {Object.keys(hierarchy).length === 0 && <p className="empty-msg">No subjects found.</p>}
                            {Object.keys(hierarchy).map(subject => (
                                <div 
                                    key={subject}
                                    className={`filter-item ${selectedSubject === subject ? 'active' : ''}`}
                                    onClick={() => handleSubjectClick(subject)}
                                >
                                    <span>{subject}</span>
                                    <span className="count-badge">
                                        {/* Optional: Count questions in this subject */}
                                        {questions.filter(q => q.subject === subject).length}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Subcategories (Only shows if subject selected) */}
                    <div className="subcategory-column">
                        <h4>{selectedSubject ? `Topics in ${selectedSubject}` : 'Select a Subject'}</h4>
                        
                        {!selectedSubject ? (
                            <div className="placeholder-text">Click a subject on the left to see available topics.</div>
                        ) : (
                            <div className="filter-list">
                                {/* Option to select the WHOLE subject */}
                                <div 
                                    className={`filter-item ${currentFilter?.subject === selectedSubject && !currentFilter?.subcategory ? 'active' : ''}`}
                                    onClick={() => handleApply(selectedSubject, null)}
                                >
                                    <b>All {selectedSubject}</b>
                                </div>

                                {/* List subcategories */}
                                {[...hierarchy[selectedSubject]].map(sub => (
                                    <div 
                                        key={sub}
                                        className={`filter-item ${currentFilter?.subcategory === sub ? 'active' : ''}`}
                                        onClick={() => handleApply(selectedSubject, sub)}
                                    >
                                        {sub}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={handleClear}>Clear Filter</button>
                    <button className="btn-cancel" onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
}

export default SubjectSelectionModal;