// src/pages/QuizSelection.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";

export default function QuizSelection() {
  const nav = useNavigate();
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Predefined categories with colors and titles
  const CATEGORY_DEFINITIONS = {
    "data-structures": { title: "Data Structures", color: "#E9DAF7" },
    "maths": { title: "Maths", color: "#E6E8EB" },
    "programming": { title: "Programming", color: "#F7C9CB" },
    "oop": { title: "Object Oriented Programming", color: "#EEE6AD" },
    "web": { title: "Web Development", color: "#C9D5FF" },
    "dbms": { title: "Database Management", color: "#F1E1F5" },
    "networking": { title: "Networking", color: "#F4C2C2" },
    "python": { title: "Python", color: "#E6E8EB" },
    "java": { title: "Java", color: "#EEE6AD" },
    "general": { title: "General", color: "#E6E8EB" }
  };

  // Fetch ALL published quizzes and organize by category → subcategory → quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        console.log("🔍 Fetching all quizzes from Firebase...");
        const quizzesRef = collection(db, 'quizzes');
        const snapshot = await getDocs(quizzesRef);
        
        console.log(`📊 Found ${snapshot.docs.length} total quizzes`);
        
        // Filter published quizzes only
        const publishedQuizzes = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(quiz => quiz.status === 'published' || quiz.published === true);
        
        console.log(`✅ Found ${publishedQuizzes.length} published quizzes`);
        
        // Organize by category → subcategory → quizzes
        const categoryMap = {};
        
        publishedQuizzes.forEach(quiz => {
          let categoryId = quiz.category;
          let subcategory = quiz.subcategory;
          
          // If no category/subcategory (old quizzes), put in General
          if (!categoryId || !CATEGORY_DEFINITIONS[categoryId]) {
            categoryId = 'general';
            subcategory = 'General';
          }
          if (!subcategory) {
            subcategory = 'General';
          }
          
          console.log("📝 Quiz:", { title: quiz.title, category: categoryId, subcategory: subcategory });
          
          // Initialize category if not exists
          if (!categoryMap[categoryId]) {
            const categoryDef = CATEGORY_DEFINITIONS[categoryId];
            categoryMap[categoryId] = {
              id: categoryId,
              title: categoryDef.title,
              color: categoryDef.color,
              subcategories: {}
            };
          }
          
          // Initialize subcategory if not exists
          if (!categoryMap[categoryId].subcategories[subcategory]) {
            categoryMap[categoryId].subcategories[subcategory] = [];
          }
          
          // Add quiz to subcategory
          categoryMap[categoryId].subcategories[subcategory].push(quiz);
        });
        
        // Convert to array
        const categoriesArray = Object.values(categoryMap);
        console.log("✅ Organized categories:", categoriesArray.map(c => `${c.title} (${Object.keys(c.subcategories).length} subcategories)`));
        
        setCategories(categoriesArray);
      } catch (error) {
        console.error("❌ Error fetching quizzes:", error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const page = {
    maxWidth: "1100px",
    margin: "0 auto",
    padding: "32px 24px",
  };

  const grid = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "32px",
    justifyItems: "center",
  };

  const card = (bg) => ({
    width: "320px",
    height: "160px",
    background: bg,
    borderRadius: "20px",
    boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    color: "#111",
    fontSize: "20px",
    fontWeight: 600,
    transition: "transform .18s ease, box-shadow .18s ease",
    cursor: "pointer",
  });

  const hover = {
    transform: "translateY(-4px)",
    boxShadow: "0 14px 24px rgba(0,0,0,0.12)",
  };

  const topicCard = {
    width: "320px",
    height: "160px",
    background: "#CBE39A", // light green
    borderRadius: "20px",
    boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textDecoration: "none",
    color: "#111",
    fontSize: "20px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform .18s ease, box-shadow .18s ease",
  };

  const quizCard = {
    width: "320px",
    height: "160px",
    background: "#F9E4B7", // light yellow for quiz names
    borderRadius: "20px",
    boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "20px",
    textDecoration: "none",
    color: "#111",
    fontSize: "18px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform .18s ease, box-shadow .18s ease",
  };

  // Level 3: Show quiz list for selected subcategory
  if (selectedCategoryId && selectedSubcategory) {
    const category = categories.find((c) => c.id === selectedCategoryId);
    const quizzes = category?.subcategories[selectedSubcategory] || [];

    return (
      <div style={page}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
          Quiz Taking / Quiz Selections / {category?.title} / {selectedSubcategory}
        </h1>

        <button
          onClick={() => setSelectedSubcategory(null)}
          style={{
            marginTop: 8,
            marginBottom: 24,
            border: "none",
            background: "transparent",
            color: "#555",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Back to {category?.title} topics
        </button>

        {quizzes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
            No quizzes available in this topic yet.
          </div>
        ) : (
          <div style={grid}>
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                style={quizCard}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, hover)}
                onMouseLeave={(e) =>
                  Object.assign(e.currentTarget.style, {
                    transform: "none",
                    boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
                  })
                }
                onClick={() =>
                  nav(`/quiz/${selectedCategoryId}/intro`, {
                    state: {
                      quiz: quiz,
                      subject: category?.title || "",
                      category: selectedSubcategory,
                    },
                  })
                }
              >
                {quiz.title}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Level 2: Show subcategories for selected category
  if (selectedCategoryId) {
    const category = categories.find((c) => c.id === selectedCategoryId);
    const subcategories = category ? Object.keys(category.subcategories) : [];

    return (
      <div style={page}>
        <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 8 }}>
          Quiz Taking / Quiz Selections / {category?.title}
        </h1>

        <button
          onClick={() => setSelectedCategoryId(null)}
          style={{
            marginTop: 8,
            marginBottom: 24,
            border: "none",
            background: "transparent",
            color: "#555",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          ← Back to all categories
        </button>

        {subcategories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
            No topics available in this category yet.
          </div>
        ) : (
          <div style={grid}>
            {subcategories.map((subcategory) => (
              <div
                key={subcategory}
                style={topicCard}
                onMouseEnter={(e) => Object.assign(e.currentTarget.style, hover)}
                onMouseLeave={(e) =>
                  Object.assign(e.currentTarget.style, {
                    transform: "none",
                    boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
                  })
                }
                onClick={() => setSelectedSubcategory(subcategory)}
              >
                {subcategory}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Level 1: Show main category list (default view)
  return (
    <div style={page}>
      <h1 style={{ fontSize: 28, fontWeight: 600, marginBottom: 24 }}>
        Quiz Taking / Quiz Selections
      </h1>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
          Loading available quizzes...
        </div>
      ) : categories.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', fontSize: '18px', color: '#666' }}>
          No published quizzes available yet. Create and publish a quiz to see it here!
        </div>
      ) : (
        <div style={grid}>
          {categories.map((category) => (
            <div
              key={category.id}
              style={card(category.color)}
              onMouseEnter={(e) => Object.assign(e.currentTarget.style, hover)}
              onMouseLeave={(e) =>
                Object.assign(e.currentTarget.style, {
                  transform: "none",
                  boxShadow: "0 10px 18px rgba(0,0,0,0.08)",
                })
              }
              onClick={() => setSelectedCategoryId(category.id)}
            >
              {category.title}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
