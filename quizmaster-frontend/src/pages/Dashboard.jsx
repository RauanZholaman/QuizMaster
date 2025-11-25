import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { BarChart3, Calendar, BookOpen, ArrowUpDown } from "lucide-react";

export default function Dashboard() {
    const navigate = useNavigate();
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sortOrder, setSortOrder] = useState('newest');
    const [filterHasSubmissions, setFilterHasSubmissions] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Quizzes
                const quizzesRef = collection(db, 'quizzes');
                const quizzesSnap = await getDocs(quizzesRef);
                const quizList = quizzesSnap.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Fetch Submissions to calculate stats
                const submissionsRef = collection(db, 'submissions');
                const submissionsSnap = await getDocs(submissionsRef);
                
                const submissionMap = {}; // quizId -> { count, lastAt }
                
                submissionsSnap.forEach(doc => {
                    const data = doc.data();
                    const qId = data.quizId;
                    if (!qId) return;
                    
                    if (!submissionMap[qId]) {
                        submissionMap[qId] = { count: 0, lastAt: null };
                    }
                    
                    submissionMap[qId].count++;
                    const subDate = data.submittedAt?.toDate ? data.submittedAt.toDate() : new Date(data.submittedAt || 0);
                    
                    if (!submissionMap[qId].lastAt || subDate > submissionMap[qId].lastAt) {
                        submissionMap[qId].lastAt = subDate;
                    }
                });

                // Merge stats into quizzes
                const quizzesWithStats = quizList.map(q => ({
                    ...q,
                    submissionCount: submissionMap[q.id]?.count || 0,
                    lastSubmissionAt: submissionMap[q.id]?.lastAt || null
                }));
                
                setQuizzes(quizzesWithStats);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
    };

    const sortedQuizzes = [...quizzes]
        .filter(q => !filterHasSubmissions || q.submissionCount > 0)
        .sort((a, b) => {
            if (sortOrder === 'submissionNewest') {
                return (b.lastSubmissionAt || 0) - (a.lastSubmissionAt || 0);
            }
            if (sortOrder === 'submissionOldest') {
                return (a.lastSubmissionAt || 0) - (b.lastSubmissionAt || 0);
            }
            
            const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
            const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

    return (
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
            <div style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <h1 style={{ fontSize: 32, fontWeight: 700, color: "#1a1a1a", marginBottom: 8 }}>
                        Educator Dashboard
                    </h1>
                    <p style={{ color: "#666", fontSize: 16 }}>
                        Select a quiz to view student submissions and grade attempts.
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14, color: '#374151' }}>
                        <input 
                            type="checkbox" 
                            checked={filterHasSubmissions} 
                            onChange={(e) => setFilterHasSubmissions(e.target.checked)}
                            style={{ width: 16, height: 16, accentColor: '#7c3aed' }}
                        />
                        Has Submissions
                    </label>

                    <div style={{ position: 'relative' }}>
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            style={{
                                appearance: 'none',
                                padding: '8px 36px 8px 16px',
                                borderRadius: 20,
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                cursor: 'pointer',
                                fontSize: 14,
                                fontWeight: 500,
                                color: '#374151',
                                height: 40
                            }}
                        >
                            <option value="newest">Newest Created</option>
                            <option value="oldest">Oldest Created</option>
                            <option value="submissionNewest">Latest Submission</option>
                            <option value="submissionOldest">Oldest Submission</option>
                        </select>
                        <ArrowUpDown size={16} style={{ position: 'absolute', right: 12, top: 12, pointerEvents: 'none', color: '#6b7280' }} />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading quizzes...</p>
                </div>
            ) : sortedQuizzes.length === 0 ? (
                <div style={{ textAlign: "center", padding: 40, background: "#f5f5f5", borderRadius: 12 }}>
                    <h3>No quizzes found</h3>
                    <p>Create a quiz to see it here.</p>
                    <button 
                        onClick={() => navigate('/create-quiz')}
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
                        Create Quiz
                    </button>
                </div>
            ) : (
                <div style={{ display: "grid", gap: 16 }}>
                    {sortedQuizzes.map((quiz) => (
                        <div 
                            key={quiz.id}
                            style={{
                                background: "white",
                                border: "1px solid #e5e7eb",
                                borderRadius: 12,
                                padding: 24,
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
                            }}
                        >
                            <div>
                                <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                                    <BookOpen size={20} color="#7c3aed" />
                                    {quiz.title}
                                </h3>
                                <div style={{ display: "flex", gap: 16, color: "#666", fontSize: 14 }}>
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <Calendar size={16} />
                                        {formatDate(quiz.createdAt)}
                                    </span>
                                    <span>
                                        {quiz.subject || quiz.category || "General"}
                                    </span>
                                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                        <BarChart3 size={16} />
                                        {quiz.submissionCount} Submissions
                                    </span>
                                    <span style={{ 
                                        background: quiz.status === 'published' ? '#dcfce7' : '#f3f4f6',
                                        color: quiz.status === 'published' ? '#166534' : '#374151',
                                        padding: "2px 8px",
                                        borderRadius: 12,
                                        fontSize: 12,
                                        fontWeight: 500
                                    }}>
                                        {quiz.status || 'Draft'}
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/quiz/${quiz.id}/submissions`)}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    padding: "10px 20px",
                                    background: "#f3e8ff",
                                    color: "#7c3aed",
                                    border: "1px solid #d8b4fe",
                                    borderRadius: 8,
                                    cursor: "pointer",
                                    fontWeight: 600,
                                    transition: "all 0.2s"
                                }}
                            >
                                <BarChart3 size={18} />
                                View Submissions
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

