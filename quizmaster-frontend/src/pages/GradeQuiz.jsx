import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function GradeQuiz() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    
    const [submission, setSubmission] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [grades, setGrades] = useState({}); // Map of questionId -> score

    useEffect(() => {
        const fetchData = async () => {
            try {
                console.log("Fetching submission:", submissionId);
                // 1. Fetch Submission
                const subRef = doc(db, 'submissions', submissionId);
                const subSnap = await getDoc(subRef);
                
                if (!subSnap.exists()) {
                    console.error("Submission not found");
                    setLoading(false);
                    return;
                }
                
                const subData = subSnap.data();
                console.log("Submission Data:", subData);
                setSubmission({ id: subSnap.id, ...subData });
                
                // Initialize grades from existing submission if available
                if (subData.grades) {
                    setGrades(subData.grades);
                }

                // 2. Fetch Student Profile (if studentId exists)
                if (subData.studentId) {
                    console.log("Fetching profile for studentId:", subData.studentId);
                    try {
                        const userRef = doc(db, 'users', subData.studentId);
                        const userSnap = await getDoc(userRef);
                        if (userSnap.exists()) {
                            const userData = userSnap.data();
                            console.log("Student Profile Found:", userData);
                            setStudentProfile(userData);
                        } else {
                            console.warn("No user profile found for ID:", subData.studentId);
                        }
                    } catch (err) {
                        console.error("Error fetching student profile:", err);
                    }
                } else {
                    console.warn("No studentId in submission data");
                }

                // 3. Fetch Quiz
                if (subData.quizId) {
                    console.log("Fetching quiz:", subData.quizId);
                    const quizRef = doc(db, 'quizzes', subData.quizId);
                    const quizSnap = await getDoc(quizRef);
                    if (quizSnap.exists()) {
                        const quizData = quizSnap.data();
                        console.log("Quiz Data:", quizData);
                        setQuiz({ id: quizSnap.id, ...quizData });
                    } else {
                        console.error("Quiz not found for ID:", subData.quizId);
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

    // Process questions to ensure they have IDs (matching QuestionViewer logic)
    const questions = useMemo(() => {
        if (!quiz || !quiz.questions) return [];
        return quiz.questions.map((q, i) => 
            q && q.id == null ? { ...q, id: i.toString() } : q
        );
    }, [quiz]);

    const currentQuestion = questions[currentQuestionIndex];

    const handleScoreChange = (val) => {
        if (!currentQuestion) return;
        const score = val === '' ? '' : Number(val);
        setGrades(prev => ({
            ...prev,
            [currentQuestion.id]: score
        }));
    };

    const handleSaveAndExit = async () => {
        try {
            const totalScore = Object.values(grades).reduce((sum, val) => sum + (Number(val) || 0), 0);
            
            const subRef = doc(db, 'submissions', submissionId);
            await updateDoc(subRef, {
                grades: grades,
                score: totalScore,
                graded: true
            });
            
            navigate(-1); // Go back to submissions list
        } catch (error) {
            console.error("Error saving grades:", error);
            alert("Failed to save grades. Please try again.");
        }
    };

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        } else {
            // Navigate to feedback page with current grades
            const totalScore = Object.values(grades).reduce((sum, val) => sum + (Number(val) || 0), 0);
            
            // Save progress before navigating? Or pass state?
            // Let's save progress first to be safe
            const subRef = doc(db, 'submissions', submissionId);
            updateDoc(subRef, {
                grades: grades,
                score: totalScore
                // Don't mark as graded yet, wait for feedback publish
            }).then(() => {
                navigate(`/grade/feedback/${submissionId}`);
            }).catch(err => {
                console.error("Error saving progress:", err);
                // Navigate anyway?
                navigate(`/grade/feedback/${submissionId}`);
            });
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-GB');
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
    if (!submission || !quiz) return <div style={{ padding: 40, textAlign: 'center' }}>Data not found</div>;

    const studentAnswer = submission.answers ? submission.answers[currentQuestion.id] : null;
    const currentScore = grades[currentQuestion.id] ?? '';
    const totalScore = Object.values(grades).reduce((sum, val) => sum + (Number(val) || 0), 0);

    // Helper to render answer based on type
    const renderAnswer = () => {
        if (studentAnswer === undefined || studentAnswer === null) return <span style={{color: '#999'}}>No answer provided</span>;
        
        if (Array.isArray(studentAnswer)) {
            return studentAnswer.join(', ');
        }
        return String(studentAnswer);
    };

    const displayName = studentProfile?.firstName 
        ? `${studentProfile.firstName} ${studentProfile.lastName || ''}`.trim()
        : (submission.studentName && submission.studentName.trim() !== '' 
            ? submission.studentName 
            : (submission.studentEmail || 'Unknown Student'));

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: 'Inter, sans-serif' }}>
            <h1 style={{ textAlign: "center", margin: "8px 0 16px", fontSize: 24, fontWeight: 700 }}>
                Quiz : {quiz.title}
            </h1>

            <div
                style={{
                    background: "#e8def8",
                    borderRadius: 10,
                    padding: "16px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 24
                }}
            >
                <div style={{ fontSize: 16 }}>
                    <span style={{ fontWeight: 600 }}>Student Name:</span> {displayName}
                </div>
                <div style={{ fontSize: 16 }}>
                    <span style={{ fontWeight: 600 }}>Submitted:</span> {formatDate(submission.submittedAt)}
                </div>
            </div>

            <section style={{ marginTop: 24 }}>
                <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 600 }}>Questions</h3>
                
                <div style={{ marginBottom: 8 }}>
                    <span style={{ fontWeight: 600, marginRight: 8 }}>Q{currentQuestionIndex + 1}.</span>
                    <span>{currentQuestion.questionText || currentQuestion.text || currentQuestion.question || "Question text missing"}</span>
                </div>

                <div
                    style={{
                        marginTop: 16,
                        background: "#ede7f6",
                        border: "none",
                        borderRadius: 10,
                        padding: 24,
                        minHeight: 140,
                        fontSize: 16,
                        color: "#333"
                    }}
                >
                    <div style={{ fontSize: 12, color: '#666', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Student Answer</div>
                    <div style={{ fontSize: 18 }}>{renderAnswer()}</div>
                </div>

                <div style={{ marginTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 16 }}>Score:</span>
                        <input
                            type="number"
                            value={currentScore}
                            onChange={(e) => handleScoreChange(e.target.value)}
                            style={{ 
                                width: 80, 
                                padding: "8px 12px", 
                                borderRadius: 8, 
                                border: "1px solid #ccc",
                                fontSize: 16
                            }}
                            min="0"
                        />
                        <span style={{ fontSize: 16 }}>/ 1</span>
                    </div>

                    <div style={{ color: "#444", fontSize: 16 }}>
                        Total Score: {totalScore} / {questions.length}
                    </div>
                </div>
            </section>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
                <button
                    style={pillButton}
                    onClick={handleSaveAndExit}
                >
                    Save and Exit
                </button>
                
                <button style={pillButton} onClick={handleNext}>
                    {currentQuestionIndex < questions.length - 1 ? 'Next' : 'Finish'}
                </button>
            </div>
        </div>
    );
}

const pillButton = {
    padding: "10px 24px",
    background: "#e8def8",
    border: "1px solid #c9c1dc",
    borderRadius: 20,
    cursor: "pointer",
    fontSize: 14,
    fontWeight: 500,
    color: '#1D192B'
};
