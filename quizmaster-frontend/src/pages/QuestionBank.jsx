import { LuFilter } from 'react-icons/lu';
import { FiEdit2 } from 'react-icons/fi';
import { AiOutlineSave } from 'react-icons/ai';
import { AiOutlineDelete } from 'react-icons/ai';

import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

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
        hard: 0
    });
    const [activeFilter, setActiveFilter] = useState('All Questions');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                // Fetch questions from Firestore
                const questionsCollectionRef = collection(db, QUESTIONS_COLLECTION);
                
                // Get all documents from the collection
                const querySnapshot = await getDocs(questionsCollectionRef);

                let newStats = {
                    total: 0,
                    published: 0,
                    drafts: 0,
                    easy: 0,
                    medium: 0,
                    hard: 0,
                    categories: new Set(),
                }; 

                // Map the documents to an array of objects
                const questionsData = querySnapshot.docs.map(doc => {
                    const data = doc.data();
                    newStats.total++;

                    if (data.status === 'published') {
                        newStats.published++;
                    } else if (data.status === 'draft') {
                        newStats.drafts++;
                    }

                    if (data.difficulty) {
                        if (data.difficulty.easy) newStats.easy++;
                        if (data.difficulty.medium) newStats.medium++;
                        if (data.difficulty.hard) newStats.hard++;
                    }

                    if (data.categories) {
                        newStats.categories.add(data.categories);
                    }
                    
                    return {
                        firestoreId: doc.id, 
                        ...doc.data()
                    };
                });

                const finalStats = {
                    ...newStats,
                    categories: newStats.categories.size
                };

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

    if (loading) {
        return <div>Loading questions...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    const handleDelete = async (questionFirestoreId) => {
        try {
            console.log("handleDelete called for ID:", questionFirestoreId);
            const docRef = doc(db, QUESTIONS_COLLECTION, questionFirestoreId);
            
            await deleteDoc(docRef);

            setQuestionsData(prevQuestions => prevQuestions.filter(q => q.firestoreId !== questionFirestoreId));
        
            console.log("Document successfully deleted!");

        } catch (error) {
            console.error("Error deleting document: ", error);
        }
    };

    const getFilteredQuestions = () => {

        if (activeFilter === 'All Questions') {
            return questions;
        }

        return questions.filter(q => {

            if (activeFilter === 'Easy' && q.difficulty && q.difficulty.easy)
                return true;

            if (activeFilter === 'Medium' && q.difficulty && q.difficulty.medium);
                return true;
        });
    };

    const questionsToDisplay = getFilteredQuestions();

    return (
        <div className="Question-Bank-Content">
            <SelectionGrid stats={stats} activeFilter={activeFilter} onFilterChange={setActiveFilter}/>
            <div>
                <FilterBar search={search} setSearch={setSearch}/>
                <div className="Question-Bank-Table">
                    <div className="Question-Bank-Header">
                        <div>Question</div>
                        <div>Type</div>
                        <div>Difficulty</div>
                        <div>Actions</div>
                    </div>

                    <div className="Question-Bank-Body">
                        {questionsToDisplay.filter((q) => {
                            return search.toLowerCase() === ''
                                ? q
                                : q.question.toLowerCase().includes(search);
                        }).map((q) => (
                        <div key={q.firestoreId} className="Question-Bank-Row">
                            <div>{q.question}</div>
                            <div>{q.type}</div>
                            <div>{getDifficultyLabel(q.difficulty)}</div>
                            <div className="action-icons">
                                <FiEdit2/> 
                                <span 
                                    onClick={() => handleDelete(q.firestoreId)} 
                                >
                                <AiOutlineDelete /> 
                                </span>
                                <AiOutlineSave/>
                            </div>
                        </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

//
// This component displays all grids where each is represent the quantity of specific questions.
//
function SelectionGrid({stats, activeFilter, onFilterChange}) {

    const handleBoxClick = (filterName) => {
        onFilterChange(filterName);
    };

    const isActive = (filterName) => { return activeFilter === filterName ? 'active-box' : '' };

    return (
        <div className="Selection-Question">
            <div className="box-select">
                <div className="box-top">{stats.total}</div>
                <div className="box-bottom">All Questions</div>
            </div>
            <div className="box-select">
                <div className="box-top">{stats.published}</div>
                <div className="box-bottom">Published</div>
            </div>
            <div className="box-select">
                <div className="box-top">{stats.drafts}</div>
                <div className="box-bottom">Drafts</div>
            </div>
            <div className="box-select">
                <div className="box-top">{stats.categories}</div>
                <div className="box-bottom">Categories</div>
            </div>
            <div className="box-select">
                <div className="box-top">{stats.easy}</div>
                <div className="box-bottom">Easy</div>
            </div>
            <div
                onClick={() => handleBoxClick('Medium')}
                className={`box-select${isActive('Medium')}`}
                >
                <div className="box-top">{stats.medium}</div>
                <div className="box-bottom">Medium</div>
            </div>
            <div className="box-select">
                <div className="box-top">{stats.hard}</div>
                <div className="box-bottom">Hard</div>
            </div>
        </div>
    );
}

//
// This component displays filter options above the Question Bank Table
//
function FilterBar({search, setSearch}) {
    return (
        <div className="Question-Bank-Filter">
            <div className="filter-left">
                <div><LuFilter size="20px"/></div>
                <div>Filter</div>
                <div className="filter-type">
                    <div>MSQ</div>
                    <div>T/F</div>
                    <div>Short Answer</div>
                    <div>Matching</div>
                </div>
            </div>

            <div  className="question-bank-search">
                <input type="text" onChange={(e) => setSearch(e.target.value)} placeholder='Search...'></input>
            </div>
        </div>
    );
}