// src/pages/QuizSelection.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import "./QuizSelection.css";

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

  // Level 3: Show quiz list for selected subcategory
  if (selectedCategoryId && selectedSubcategory) {
    const category = categories.find((c) => c.id === selectedCategoryId);
    const quizzes = category?.subcategories[selectedSubcategory] || [];

    return (
      <div className="quiz-selection-page">
        <h1 className="quiz-selection-header">
          Quiz Taking / Quiz Selections / {category?.title} / {selectedSubcategory}
        </h1>

        <button
          onClick={() => setSelectedSubcategory(null)}
          className="back-button"
        >
          ← Back to {category?.title} topics
        </button>

        {quizzes.length === 0 ? (
          <div className="empty-state">
            No quizzes available in this topic yet.
          </div>
        ) : (
          <div className="quiz-grid">
            {quizzes.map((quiz) => (
              <div
                key={quiz.id}
                className="quiz-card-item quiz-card-quiz"
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
      <div className="quiz-selection-page">
        <h1 className="quiz-selection-header">
          Quiz Taking / Quiz Selections / {category?.title}
        </h1>

        <button
          onClick={() => setSelectedCategoryId(null)}
          className="back-button"
        >
          ← Back to all categories
        </button>

        {subcategories.length === 0 ? (
          <div className="empty-state">
            No topics available in this category yet.
          </div>
        ) : (
          <div className="quiz-grid">
            {subcategories.map((subcategory) => (
              <div
                key={subcategory}
                className="quiz-card-item quiz-card-topic"
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
    <div className="quiz-selection-page">
      <h1 className="quiz-selection-header">
        Quiz Taking / Quiz Selections
      </h1>

      {loading ? (
        <div className="empty-state">
          Loading available quizzes...
        </div>
      ) : categories.length === 0 ? (
        <div className="empty-state">
          No published quizzes available yet. Create and publish a quiz to see it here!
        </div>
      ) : (
        <div className="quiz-grid">
          {categories.map((category) => (
            <div
              key={category.id}
              className="quiz-card-item quiz-card-category"
              style={{ background: category.color }}
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
