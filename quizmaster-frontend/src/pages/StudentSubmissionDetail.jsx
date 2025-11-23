import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, Calendar, Trophy, MessageSquare } from 'lucide-react';

export default function StudentSubmissionDetail() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    const [submission, setSubmission] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Submission
                const subRef = doc(db, 'submissions', submissionId);
                const subSnap = await getDoc(subRef);
                
                if (!subSnap.exists()) {
                    console.error("Submission not found");
                    setLoading(false);
                    return;
                }
                
                const subData = subSnap.data();
                setSubmission({ id: subSnap.id, ...subData });

                // 2. Fetch Quiz
                if (subData.quizId) {
                    const quizRef = doc(db, 'quizzes', subData.quizId);
                    const quizSnap = await getDoc(quizRef);
                    if (quizSnap.exists()) {
                        setQuiz({ id: quizSnap.id, ...quizSnap.data() });
                    }
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [submissionId]);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-GB');
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
    if (!submission || !quiz) return <div style={{ padding: 40, textAlign: 'center' }}>Data not found</div>;

    const totalQuestions = quiz.questions ? quiz.questions.length : 0;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px", fontFamily: 'Inter, sans-serif' }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 8, 
                        border: 'none', 
                        background: 'none', 
                        cursor: 'pointer', 
                        padding: 0,
                        marginBottom: 16,
                        color: '#666'
                    }}
                >
                    <ArrowLeft size={20} />
                    Back to Results
                </button>
                
                <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 16 }}>
                    {quiz.title}
                </h1>

                <div style={{ 
                    display: 'flex', 
                    gap: 32, 
                    padding: '24px', 
                    background: '#F3E8F5', 
                    borderRadius: 12,
                    alignItems: 'center'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                            width: 48, 
                            height: 48, 
                            borderRadius: '50%', 
                            background: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#6750A4'
                        }}>
                            <Trophy size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, color: '#666' }}>Total Score</div>
                            <div style={{ fontSize: 24, fontWeight: 700, color: '#1D192B' }}>
                                {submission.score} <span style={{ fontSize: 16, color: '#666', fontWeight: 400 }}>/ {totalQuestions}</span>
                            </div>
                        </div>
                    </div>

                    <div style={{ width: 1, height: 40, background: '#ccc' }}></div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ 
                            width: 48, 
                            height: 48, 
                            borderRadius: '50%', 
                            background: 'white', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            color: '#6750A4'
                        }}>
                            <Calendar size={24} />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, color: '#666' }}>Date Submitted</div>
                            <div style={{ fontSize: 18, fontWeight: 600, color: '#1D192B' }}>
                                {formatDate(submission.submittedAt)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Feedback Section */}
            {submission.feedback && (
                <div style={{ marginBottom: 32 }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 600, marginBottom: 16 }}>
                        <MessageSquare size={24} color="#6750A4" />
                        Your Feedback
                    </h3>
                    <div style={{ 
                        padding: '24px', 
                        background: '#fff', 
                        border: '1px solid #e5e7eb', 
                        borderRadius: 12,
                        fontSize: 16,
                        lineHeight: 1.6,
                        color: '#374151'
                    }}>
                        {submission.feedback}
                    </div>
                </div>
            )}

            {/* Questions Review */}
            <div>
                <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 24 }}>Submission Details</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {quiz.questions && quiz.questions.map((q, index) => {
                        // Use question ID if available, otherwise fallback to index string
                        const questionId = q.id != null ? q.id : index.toString();
                        const studentAnswer = submission.answers ? submission.answers[questionId] : null;
                        const grade = submission.grades ? submission.grades[questionId] : null;
                        
                        // Format answer for display (handle arrays for checkboxes)
                        let displayAnswer = studentAnswer;
                        if (Array.isArray(studentAnswer)) {
                            displayAnswer = studentAnswer.join(', ');
                        }
                        
                        return (
                            <div 
                                key={index}
                                style={{ 
                                    padding: '24px', 
                                    background: 'white', 
                                    border: '1px solid #e5e7eb', 
                                    borderRadius: 12 
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <h4 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                                        Question {index + 1}
                                    </h4>
                                    <div style={{ 
                                        background: '#F3E8F5', 
                                        padding: '4px 12px', 
                                        borderRadius: 12, 
                                        fontSize: 14, 
                                        fontWeight: 600, 
                                        color: '#6750A4' 
                                    }}>
                                        {grade !== undefined && grade !== null ? `${grade}/1` : 'Ungraded'}
                                    </div>
                                </div>
                                
                                <p style={{ fontSize: 16, marginBottom: 20, color: '#1f2937' }}>
                                    {q.questionText}
                                </p>

                                <div style={{ 
                                    padding: '16px', 
                                    background: '#f9fafb', 
                                    borderRadius: 8,
                                    borderLeft: '4px solid #6750A4'
                                }}>
                                    <div style={{ fontSize: 14, color: '#666', marginBottom: 4 }}>Your Answer:</div>
                                    <div style={{ fontSize: 16, fontWeight: 500 }}>
                                        {displayAnswer || <span style={{ fontStyle: 'italic', color: '#999' }}>No answer provided</span>}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
