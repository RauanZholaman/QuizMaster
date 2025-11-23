import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function QuizFeedback() {
    const { submissionId } = useParams();
    const navigate = useNavigate();
    
    const [submission, setSubmission] = useState(null);
    const [quiz, setQuiz] = useState(null);
    const [studentProfile, setStudentProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState('');

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
                
                if (subData.feedback) {
                    setFeedback(subData.feedback);
                }

                // 2. Fetch Student Profile
                if (subData.studentId) {
                    const userRef = doc(db, 'users', subData.studentId);
                    const userSnap = await getDoc(userRef);
                    if (userSnap.exists()) {
                        setStudentProfile(userSnap.data());
                    }
                }

                // 3. Fetch Quiz
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

    const handleSaveAndExit = async () => {
        try {
            const subRef = doc(db, 'submissions', submissionId);
            await updateDoc(subRef, {
                feedback: feedback
            });
            navigate(-1);
        } catch (error) {
            console.error("Error saving feedback:", error);
            alert("Failed to save feedback");
        }
    };

    const handlePublish = async () => {
        try {
            const subRef = doc(db, 'submissions', submissionId);
            await updateDoc(subRef, {
                feedback: feedback,
                graded: true
            });
            // Navigate back to submissions list (which is -2 from here if coming from GradeQuiz, or -1 if direct)
            // Safest is to go back to quiz submissions. 
            // Since we don't have quizId easily in URL here, we can use history or fetch from submission.
            // But navigate(-1) usually works if flow is linear.
            // If coming from GradeQuiz: Submissions -> Grade -> Feedback. So -2.
            // If coming from Submissions: Submissions -> Feedback. So -1.
            // Let's just go back one step for now, user can navigate. 
            // Or better, go to dashboard or submissions list if we can construct URL.
            if (submission && submission.quizId) {
                navigate(`/quiz/${submission.quizId}/submissions`);
            } else {
                navigate(-1);
            }
        } catch (error) {
            console.error("Error publishing feedback:", error);
            alert("Failed to publish feedback");
        }
    };

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-GB');
    };

    if (loading) return <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>;
    if (!submission || !quiz) return <div style={{ padding: 40, textAlign: 'center' }}>Data not found</div>;

    const displayName = studentProfile?.firstName 
        ? `${studentProfile.firstName} ${studentProfile.lastName || ''}`.trim()
        : (submission.studentName || submission.studentEmail || 'Unknown Student');

    const totalQuestions = quiz.questions ? quiz.questions.length : 0;
    const score = submission.score || 0;

    return (
        <div style={{ maxWidth: 900, margin: "0 auto", padding: 16, fontFamily: 'Inter, sans-serif' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <button 
                    onClick={() => navigate(-1)}
                    style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 4 }}
                >
                    {/* ArrowLeft icon placeholder */}
                    ←
                </button>
            </div>

            <h1 style={{ textAlign: "center", margin: "8px 0 24px", fontSize: 24, fontWeight: 700 }}>
                Quiz {quiz.title}
            </h1>

            <div
                style={{
                    background: "#e0e0e0", // Grey background from screenshot
                    borderRadius: 10,
                    padding: "16px 24px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 32
                }}
            >
                <div style={{ fontSize: 16, fontWeight: 600 }}>
                    Student Name: {displayName}
                </div>
                <div style={{ fontSize: 16 }}>
                    Submitted: {formatDate(submission.submittedAt)}
                </div>
            </div>

            <section>
                <h3 style={{ margin: "0 0 16px", fontSize: 18, fontWeight: 700 }}>Feedback</h3>

                <div style={{ marginBottom: 24, fontSize: 16 }}>
                    Total Score: {score} / {totalQuestions}
                </div>

                <textarea
                    placeholder="Enter feedback here."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    style={{
                        width: "100%",
                        background: "#ede7f6", // Light purple bg
                        border: "1px solid #c9c1dc",
                        borderRadius: 10,
                        padding: 16,
                        minHeight: 200,
                        outline: "none",
                        resize: "vertical",
                        fontSize: 16,
                        fontFamily: 'inherit'
                    }}
                />
            </section>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
                <button
                    style={{
                        padding: "10px 24px",
                        background: "#e8def8",
                        border: "1px solid #c9c1dc",
                        borderRadius: 20,
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#1D192B'
                    }}
                    onClick={handleSaveAndExit}
                >
                    Save and Exit
                </button>
                
                <button 
                    style={{
                        padding: "10px 24px",
                        background: "white",
                        border: "2px solid #6750A4",
                        borderRadius: 20,
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: 600,
                        color: '#6750A4'
                    }}
                    onClick={handlePublish}
                >
                    Publish Feedback
                </button>
            </div>
        </div>
    );
}
