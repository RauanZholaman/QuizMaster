import { LuFilter, LuChevronLeft, LuChevronRight } from 'react-icons/lu'; // Added Chevron icons
import { FiEdit2 } from 'react-icons/fi';
import { AiOutlineSave } from 'react-icons/ai';
import { AiOutlineDelete } from 'react-icons/ai';

import React, { useState, useEffect, use } from 'react';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { useDebounce } from "use-debounce";
import EditQuestionModal from "../pages/EditQuestionModal.jsx";

const QUESTIONS_COLLECTION = 'questionBank';

const getDifficultyLabel = (difficultyObject) => { 
    if (!difficultyObject) return 'Unknown';
    const foundEntry = Object.entries(difficultyObject).find(([key, value]) => value === true);
    if (foundEntry) {
        const [key] = foundEntry;
        return key.charAt(0).toUpperCase() + key.slice(1);
    }
    return 'Unknown';
};


export default function QuestionBank() {
    const { role } = useAuth();
    const canEdit = role === 'educator';

    const [questions, setQuestionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [stats, setStats] = useState({
        total: 0,
        published: 0,
        drafts: 0,
        categories: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        type: 0
    });
    
    // Filter & Search States
    const [activeFilter, setActiveFilter] = useState([]);
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 400);
    const [typeFilter, setTypeFilter] = useState([]);
    
    // Pagination States
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Question editing
    const [editingQuestion, setEditingQuestion] = useState(null);
   
    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const questionsCollectionRef = collection(db, QUESTIONS_COLLECTION);
                const querySnapshot = await getDocs(questionsCollectionRef);

                let newStats = {
                    total: 0, published: 0, drafts: 0, easy: 0, medium: 0, hard: 0,
                    categories: new Set(), type: 0,
                }; 

                const questionsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    newStats.total++;

                    if (data.status === 'published') newStats.published++;
                    else if (data.status === 'draft') newStats.drafts++;

                    if (data.difficulty) {
                        if (data.difficulty.easy) newStats.easy++;
                        if (data.difficulty.medium) newStats.medium++;
                        if (data.difficulty.hard) newStats.hard++;
                    }

                    if (data.categories) newStats.categories.add(data.categories);
                    
                    return { firestoreId: doc.id, ...doc.data() };
                });

                const finalStats = { ...newStats, categories: newStats.categories.size };

                setQuestionsData(questionsData);
                setStats(finalStats);
                setLoading(false);

            } catch (err) {
                console.error("Error fetching questions: ", err); 
                setError("Failed to load questions.");
                setLoading(false);
            }
        };

        fetchQuestions();
    }, []);

    // Reset page to 1 whenever filters or search change
    useEffect(() => {
        setCurrentPage(1);
    }, [activeFilter, typeFilter, debouncedSearch]);

    const handleDelete = async (questionFirestoreId) => {
        if (!canEdit) return; // Safety: students cannot delete
        try {
            const docRef = doc(db, QUESTIONS_COLLECTION, questionFirestoreId);
            await deleteDoc(docRef);
            setQuestionsData(prevQuestions => prevQuestions.filter(q => q.firestoreId !== questionFirestoreId));
        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const getFilteredQuestions = () => {
        let result = questions;

        // Apply existing Logic
        if (activeFilter.includes('All Questions')) {
            // If "All Questions", we usually return everything
            return questions;
        }

        if (typeFilter.length > 0) {
            return result = result.filter(q => typeFilter.includes(q.type));
        }

        return questions.filter(q => {
            const matchesDifficulty = 
                (activeFilter.includes('Easy') && q.difficulty.easy) ||
                (activeFilter.includes('Medium') && q.difficulty.medium) ||
                (activeFilter.includes('Hard') && q.difficulty.hard) ||
                !activeFilter.some(f => ['Easy', 'Medium', 'Hard'].includes(f));   

            const matchesStatus =
                (activeFilter.includes('Published') && q.status.includes('published')) ||
                (activeFilter.includes('Draft') && q.status.includes('draft')) ||
                !activeFilter.some(f => ['Published', 'Draft'].includes(f));

            return matchesDifficulty && matchesStatus;
        });
    };

    if (loading) return <div>Loading questions...</div>;
    if (error) return <div>{error}</div>;

    // --- DATA PROCESSING FOR PAGINATION ---

    // Get Base Filtered List
    const baseFilteredQuestions = getFilteredQuestions();

    // Apply Search (Moved from JSX to here)
    const processedQuestions = baseFilteredQuestions.filter((q) => {
        return search.toLowerCase() === ''
            ? q
            : q.question.toLowerCase().includes(debouncedSearch.toLowerCase());
    });

    // Calculate Pagination Indices
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentQuestions = processedQuestions.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(processedQuestions.length / itemsPerPage);

    // Pagination Handlers
    const goToNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
    };
    const goToPrevPage = () => {
        if (currentPage > 1) setCurrentPage(prev => prev - 1);
    };

    // --- QUESTION EDITING ---

    // Triggered when Pencil icon is clicked
    const handleEditClick = (question) => {
        setEditingQuestion(question);
    };

    // Triggered when "Save" is clicked in Modal
    const handleUpdateQuestion = async (docId, updatedData) => {
    // 1. Validation
    if (!docId) {
        console.error("❌ Error: docId is missing. Data:", updatedData);
        alert("Cannot update: Missing Question ID");
        return;
    }

    try {
        console.log(`🔄 Updating document: ${docId}`);
        const docRef = doc(db, QUESTIONS_COLLECTION, docId);
        
        // 2. Update Firestore
        await updateDoc(docRef, updatedData);

        // 3. Update Local State (UI)
        setQuestionsData(prev => prev.map(q => 
            // Check both potential ID names to be safe
            (q.firestoreId === docId || q.id === docId) 
                ? { ...q, ...updatedData } 
                : q
        ));

        setEditingQuestion(null);
        console.log("✅ Document successfully updated!");

    } catch (error) {
        console.error("❌ Error updating document: ", error);
        alert(`Failed to update: ${error.message}`);
    }
};

        return (
        <div className="Question-Bank-Content">
                        { !canEdit && (
                            <div style={{background:'#fff3cd', border:'1px solid #ffe58f', padding:12, borderRadius:6, marginBottom:12}}>
                                Read-only view: as a student you can browse questions but not edit or delete them.
                            </div>
                        ) }
            <SelectionGrid stats={stats} activeFilter={activeFilter} onFilterChange={setActiveFilter}/>
            <div>
                <FilterBar search={search} 
                           setSearch={setSearch} 
                           typeFilter={typeFilter} 
                           onTypeFilterChange={setTypeFilter} />
                
                <div className="Question-Bank-Table">
                    <div className="Question-Bank-Header">
                        <div>Question</div>
                        <div>Type</div>
                        <div>Difficulty</div>
                        <div>{canEdit ? 'Actions' : ' '}</div>
                    </div>

                    <div className="Question-Bank-Body">
                        {currentQuestions.length > 0 ? (
                            currentQuestions.map((q) => (
                                <div key={q.firestoreId} className="Question-Bank-Row">
                                    <div>{q.question}</div>
                                    <div>{q.type}</div>
                                    <div>{getDifficultyLabel(q.difficulty)}</div>
                                    <div className="action-icons">
                                        {canEdit ? (
                                            <>
                                                <span onClick={() => handleEditClick(q)} style={{cursor: 'pointer'}}>
                                                    <FiEdit2/>
                                                </span>

                                                <span onClick={() => handleDelete(q.firestoreId)} style={{cursor:'pointer'}}>
                                                    <AiOutlineDelete /> 
                                                </span>
                                                <AiOutlineSave/>
                                            </>
                                        ) : (
                                            <span style={{opacity:0.5, fontSize:12}}>—</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div style={{padding: '20px', textAlign: 'center', color: '#888'}}>
                                No questions found.
                            </div>
                        )}
                    </div>

                    {/* PAGINATION CONTROLS */}
                    {processedQuestions.length > 0 && (
                        <div className="pagination-footer">
                            <span className="pagination-info">
                                Showing {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, processedQuestions.length)} of {processedQuestions.length}
                            </span>
                            
                            <div className="pagination-controls">
                                <button 
                                    onClick={goToPrevPage} 
                                    disabled={currentPage === 1}
                                    className="pagination-btn"
                                >
                                    <LuChevronLeft /> Prev
                                </button>
                                
                                <span style={{fontSize: '0.9rem', fontWeight: '500'}}>
                                    Page {currentPage} of {totalPages}
                                </span>

                                <button 
                                    onClick={goToNextPage} 
                                    disabled={currentPage === totalPages}
                                    className="pagination-btn"
                                >
                                    Next <LuChevronRight />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {editingQuestion && (
                    <EditQuestionModal 
                        question={editingQuestion}
                        onClose={() => setEditingQuestion(null)}
                        onSave={handleUpdateQuestion}
                    />
                )}
            </div>
        </div>
    );
}


function SelectionGrid({stats, activeFilter, onFilterChange}) {
    const handleBoxClick = (filterName) => {
        if (activeFilter.includes(filterName)) {
            onFilterChange(activeFilter.filter(f => f !== filterName));
        } else {
            onFilterChange([...activeFilter, filterName]);
        }
    };

    const isActive = (filterName) => activeFilter.includes(filterName) ? 'active-box' : '';

    return (
        <div className="Selection-Question">
            <div onClick={() => handleBoxClick('All Questions')} className={`box-select ${isActive('All Questions')}`}>
                <div className="box-top">{stats.total}</div>
                <div className="box-bottom">All Questions</div>
            </div>
            <div onClick={() => handleBoxClick('Published')} className={`box-select ${isActive('Published')}`}>
                <div className="box-top">{stats.published}</div>
                <div className="box-bottom">Published</div>
            </div>
            <div onClick={() => handleBoxClick('Draft')} className={`box-select ${isActive('Draft')}`}>
                <div className="box-top">{stats.drafts}</div>
                <div className="box-bottom">Drafts</div>
            </div>
            <div className="box-select">
                <div className="box-top">{stats.categories}</div>
                <div className="box-bottom">Categories</div>
            </div>
            <div onClick={() => handleBoxClick('Easy')} className={`box-select ${isActive('Easy')}`}>
                <div className="box-top">{stats.easy}</div>
                <div className="box-bottom">Easy</div>
            </div>
            <div onClick={() => handleBoxClick('Medium')} className={`box-select ${isActive('Medium')}`}>
                <div className="box-top">{stats.medium}</div>
                <div className="box-bottom">Medium</div>
            </div>
            <div onClick={() => handleBoxClick('Hard')} className={`box-select ${isActive('Hard')}`}>
                <div className="box-top">{stats.hard}</div>
                <div className="box-bottom">Hard</div>
            </div>
        </div>
    );
}

function FilterBar({setSearch, typeFilter, onTypeFilterChange}) {
    const handleTextClick = (type) => {
        if (typeFilter.includes(type)) {
            onTypeFilterChange(typeFilter.filter(t => t !== type));
        } else {
            onTypeFilterChange([...typeFilter, type]);
        }
    }

    const isActive = (type) => typeFilter.includes(type) ? 'active-type' : '';

    return (
        <div className="Question-Bank-Filter">
            <div className="filter-left">
                <div><LuFilter size="20px"/></div>
                <div>Filter</div>
                <div className="filter-type">
                    <div onClick={() => handleTextClick('MCQ')} className={`type-filter ${isActive('MCQ')}`}>MCQ</div>
                    <div onClick={() => handleTextClick('TRUE_FALSE')} className={`type-filter ${isActive('TRUE_FALSE')}`}>T/F</div>
                    <div onClick={() => handleTextClick('SHORT_ANSWER')} className={`type-filter ${isActive('SHORT_ANSWER')}`}>Short Answer</div>
                    <div onClick={() => handleTextClick('FILL_BLANK')} className={`type-filter ${isActive('FILL_BLANK')}`}>Fill Blank</div>
                </div>
            </div>

            <div  className="question-bank-search">
                <input type="text" onChange={(e) => setSearch(e.target.value)} placeholder='Search...'></input>
            </div>
        </div>
    );
}