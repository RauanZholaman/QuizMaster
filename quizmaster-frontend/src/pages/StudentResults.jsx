import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, FileText, Calendar, Trophy } from 'lucide-react';

export default function StudentResults() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSubmissions = async () => {
            if (!user) return;

            try {
                // 1. Get all submissions for this student
                const subRef = collection(db, 'submissions');
                const q = query(subRef, where("studentId", "==", user.uid));
                const querySnapshot = await getDocs(q);

                const subs = [];
                
                // 2. For each submission, get the quiz title
                for (const docSnap of querySnapshot.docs) {
                    const subData = docSnap.data();
                    let quizTitle = "Unknown Quiz";
                    let totalQuestions = 0;

                    if (subData.quizId) {
                        const quizRef = doc(db, 'quizzes', subData.quizId);
                        const quizSnap = await getDoc(quizRef);
                        if (quizSnap.exists()) {
                            const quizData = quizSnap.data();
                            quizTitle = quizData.title;
                            totalQuestions = quizData.questions ? quizData.questions.length : 0;
                        }
                    }

                    subs.push({
                        id: docSnap.id,
                        ...subData,
                        quizTitle,
                        totalQuestions
                    });
                }

                // Sort by date (newest first)
                subs.sort((a, b) => {
                    const dateA = a.submittedAt?.toDate ? a.submittedAt.toDate() : new Date(a.submittedAt || 0);
                    const dateB = b.submittedAt?.toDate ? b.submittedAt.toDate() : new Date(b.submittedAt || 0);
                    return dateB - dateA;
                });

                setSubmissions(subs);
            } catch (error) {
                console.error("Error fetching results:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubmissions();
    }, [user]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-GB');
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading results...</div>;

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "24px", fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
                <button 
                    onClick={() => navigate('/')}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                >
                    <ArrowLeft size={24} />
                </button>
                <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>My Results</h1>
            </div>

            {submissions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 40, background: '#f9fafb', borderRadius: 12 }}>
                    <p>You haven't taken any quizzes yet.</p>
                    <button 
                        onClick={() => navigate('/quizzes')}
                        style={{
                            marginTop: 16,
                            padding: "10px 20px",
                            background: "#7c3aed",
                            color: "white",
                            border: "none",
                            borderRadius: 8,
                            cursor: "pointer"
                        }}
                    >
                        Take a Quiz
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {submissions.map((sub, index) => (
                        <div 
                            key={sub.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '20px 24px',
                                background: 'white',
                                borderRadius: 12,
                                border: '1px solid #e5e7eb',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                                <div style={{ 
                                    width: 48, 
                                    height: 48, 
                                    borderRadius: '50%', 
                                    background: '#F3E8F5', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    color: '#6750A4',
                                    fontWeight: 600,
                                    fontSize: 18
                                }}>
                                    {String(index + 1).padStart(2, '0')}
                                </div>
                                <div>
                                    <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 600 }}>
                                        {sub.quizTitle}
                                    </h3>
                                    <div style={{ display: 'flex', gap: 16, color: '#666', fontSize: 14 }}>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Calendar size={14} />
                                            {formatDate(sub.submittedAt)}
                                        </span>
                                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                            <Trophy size={14} />
                                            {sub.graded ? `Score: ${sub.score} / ${sub.totalQuestions}` : 'Score: Pending'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {sub.graded ? (
                                <button
                                    onClick={() => navigate(`/my-results/${sub.id}`)}
                                    style={{
                                        padding: '10px 20px',
                                        borderRadius: 20,
                                        border: '1px solid #6750A4',
                                        background: 'white',
                                        color: '#6750A4',
                                        cursor: 'pointer',
                                        fontWeight: 600,
                                        fontSize: 14,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8
                                    }}
                                >
                                    <FileText size={16} />
                                    View Submission
                                </button>
                            ) : (
                                <div style={{ 
                                    padding: '10px 20px', 
                                    color: '#666', 
                                    fontSize: 14, 
                                    fontStyle: 'italic',
                                    background: '#f5f5f5',
                                    borderRadius: 20,
                                    border: '1px solid #e5e7eb'
                                }}>
                                    Grading in Progress
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
