import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Search, ArrowLeft, CheckSquare, MessageSquare, ArrowUpDown } from 'lucide-react';

export default function QuizSubmissions() {
    const { id: quizId } = useParams();
    const navigate = useNavigate();
    const [quiz, setQuiz] = useState(null);
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Fetching submissions for quizId:", quizId);
                // 1. Fetch Quiz Details
                const quizRef = doc(db, 'quizzes', quizId);
                const quizSnap = await getDoc(quizRef);
                
                if (quizSnap.exists()) {
                    setQuiz({ id: quizSnap.id, ...quizSnap.data() });
                } else {
                    console.error("Quiz not found");
                }

                // 2. Fetch Submissions for this Quiz
                const submissionsRef = collection(db, 'submissions');
                const q = query(submissionsRef, where("quizId", "==", quizId));
                const querySnapshot = await getDocs(q);
                
                const subs = [];
                const studentIds = new Set();

                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    subs.push({ id: doc.id, ...data });
                    if (data.studentId) {
                        studentIds.add(data.studentId);
                    }
                });
                
                // 3. Fetch User Details for each submission
                const userMap = {};
                if (studentIds.size > 0) {
                    await Promise.all(Array.from(studentIds).map(async (uid) => {
                        try {
                            const userDoc = await getDoc(doc(db, 'users', uid));
                            if (userDoc.exists()) {
                                userMap[uid] = userDoc.data();
                            }
                        } catch (e) {
                            console.error("Error fetching user", uid, e);
                        }
                    }));
                }

                const subsWithNames = subs.map(sub => {
                    const user = userMap[sub.studentId];
                    const name = user 
                        ? `${user.firstName || ''} ${user.lastName || ''}`.trim() 
                        : (sub.studentName || sub.studentEmail || 'Unknown Student');
                    return { ...sub, studentName: name || sub.studentEmail || 'Unknown Student' };
                });
                
                setSubmissions(subsWithNames);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [quizId]);

    const filteredSubmissions = submissions
        .filter(sub => 
            (sub.studentName || 'Unknown').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (sub.studentId || '').toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const dateA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt || 0);
            const dateB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt || 0);
            
            return sortOrder === 'newest' 
                ? dateB - dateA 
                : dateA - dateB;
        });

    if (loading) return <div style={{padding: 40, textAlign: 'center'}}>Loading...</div>;
    if (!quiz) return <div style={{padding: 40, textAlign: 'center'}}>Quiz not found</div>;

    // Format date helper
    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        // Handle Firebase Timestamp or JS Date
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px', fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                    <button 
                        onClick={() => navigate(-1)}
                        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <div style={{ color: '#666', fontSize: 14 }}>www.QuizMaster.com</div>
                </div>
                
                <h1 style={{ textAlign: 'center', fontSize: 32, fontWeight: 600, marginBottom: 32 }}>
                    {quiz.title}
                </h1>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid #eee', paddingBottom: 16 }}>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>
                            {quiz.title}: {quiz.subject || 'General'}
                        </h2>
                    </div>
                    <div style={{ fontSize: 16 }}>
                        Published: {formatDate(quiz.createdAt)}
                    </div>
                </div>
            </div>

            {/* Search Bar & Sort */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 32, maxWidth: 800, margin: '0 auto 32px' }}>
                <div style={{ background: '#F3E8F5', padding: '12px 24px', borderRadius: 30, display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                    <Search size={20} color="#666" />
                    <input 
                        type="text" 
                        placeholder="Search Student" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ border: 'none', background: 'transparent', outline: 'none', width: '100%', fontSize: 16 }}
                    />
                </div>
                
                <button
                    onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '0 24px',
                        borderRadius: 30,
                        border: '1px solid #e5e7eb',
                        background: 'white',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: 500,
                        color: '#374151',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <ArrowUpDown size={16} />
                    {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
                </button>
            </div>

            {/* Submissions List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {filteredSubmissions.length > 0 ? (
                    filteredSubmissions.map((sub, index) => (
                        <div key={sub.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 32, flex: 1 }}>
                                <div style={{ fontWeight: 600, minWidth: 80 }}>
                                    {sub.graded ? 'Graded' : 'Ungraded'}
                                </div>
                                <div style={{ 
                                    background: '#E8DEF8', 
                                    width: 40, 
                                    height: 40, 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#6750A4',
                                    fontWeight: 600
                                }}>
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <div style={{ fontWeight: 600, minWidth: 150 }}>
                                    {sub.studentName || sub.studentEmail || 'Unknown Student'}
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
                                <div style={{ color: '#333' }}>
                                    Submitted on: {formatDate(sub.submittedAt)}
                                </div>
                                
                                <div style={{ display: 'flex', gap: 12 }}>
                                    <button 
                                        onClick={() => navigate(`/grade/${sub.id}`)}
                                        style={{ 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            gap: 8,
                                            padding: '8px 16px', 
                                            borderRadius: 20, 
                                            border: '1px solid #6750A4', 
                                            background: '#E8DEF8',
                                            color: '#1D192B',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                    >
                                        <CheckSquare size={16} />
                                        {sub.graded ? 'Edit Grades' : 'Mark Quiz'}
                                    </button>
                                    
                                    <button 
                                        onClick={() => navigate(`/grade/feedback/${sub.id}`)}
                                        style={{ 
                                            padding: '8px 16px', 
                                            borderRadius: 20, 
                                            border: '1px solid #79747E', 
                                            background: 'white',
                                            color: '#1D192B',
                                            cursor: 'pointer',
                                            fontWeight: 500
                                        }}
                                    >
                                        {sub.graded ? 'Edit Feedback' : 'Add Feedback'}
                                    </button>
                                </div>

                                <div style={{ display: 'flex', gap: 8 }}>
                                    {/* Placeholder icons from screenshot */}
                                    <div style={{ width: 32, height: 32, background: '#E8DEF8', borderRadius: 4 }}></div>
                                    <div style={{ width: 32, height: 32, background: '#E8DEF8', borderRadius: 4 }}></div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div style={{ textAlign: 'center', padding: 40, color: '#666' }}>
                        No submissions found.
                    </div>
                )}
            </div>
        </div>
    );
}
