// src/api.js
import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

/* ------------------ helpers to prettify titles ------------------ */

// Derive a subject name from explicit fields or keywords in title/description.
function deriveSubject(x) {
  if (x && x.subject) return x.subject;
  if (x && typeof x.category === "string" && x.category.trim()) return x.category;
  if (x && Array.isArray(x.tags) && x.tags.length > 0) return x.tags[0];

  var title = (x && x.title) ? x.title : "";
  var desc  = (x && x.description) ? x.description : "";
  var text  = (title + " " + desc).toLowerCase();

  var rules = [
    ["data structure", "Data Structures"],
    ["datastructure", "Data Structures"],
    ["seng1120", "Data Structures"],
    ["oop", "Object-Oriented Programming"],
    ["object oriented", "Object-Oriented Programming"],
    ["programming", "Programming"],
    ["python", "Python"],
    ["java", "Java"],
    ["dbms", "Databases"],
    ["database", "Databases"],
    ["sql", "Databases"],
    ["math", "Maths"],
    ["probability", "Maths"],
    ["network", "Networking"],
    ["web", "Web Development"],
  ];
  for (var i = 0; i < rules.length; i++) {
    var needle = rules[i][0];
    var nice   = rules[i][1];
    if (text.indexOf(needle) !== -1) return nice;
  }
  return "General";
}

// Prefer a human title like “Data Structures” over “Quiz 1 / Test”.
function deriveDisplayTitle(x, id) {
  var subject = deriveSubject(x);
  var raw = (x && (x.title || x.name || x.quizTitle)) ? (x.title || x.name || x.quizTitle) : "";
  var looksLikePlaceholder =
    !raw || /^test$/i.test(raw) || /^quiz\s*\d*$/i.test(raw);

  if (looksLikePlaceholder) return subject;
  return raw.length > 2 ? raw : (subject || ("Quiz " + id));
}

/* ------------------ normalizer ------------------ */

function normalizeQuiz(docSnap) {
  var x = docSnap.data() || {};

  var title = deriveDisplayTitle(x, docSnap.id);
  var description =
    (x.description && x.description !== title) ? x.description : "";

  var timeLimit =
    (typeof x.timeLimit !== "undefined" ? x.timeLimit :
    (typeof x.timeLimitMinutes !== "undefined" ? x.timeLimitMinutes :
    (typeof x.timeLimitSeconds === "number"
      ? Math.max(1, Math.round(x.timeLimitSeconds / 60))
      : 10)));

  var category = x.quizType || x.category || "";
  if (!category && x.difficulty && typeof x.difficulty === "object") {
    var keys = Object.keys(x.difficulty);
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      if (x.difficulty[k] === true) {
        category = k.toUpperCase();
        break;
      }
    }
  }

  var subject = deriveSubject(x);
  var questions = Array.isArray(x.questions) ? x.questions : [];

  return {
    id: docSnap.id,
    title: title,          // pretty title (e.g., “Data Structures”, “Maths”)
    description: description,
    timeLimit: timeLimit,
    category: category,
    subject: subject,      // available if you want to show a subject tag
    questions: questions,  // inline questions if present
    _raw: x,               // raw doc (for filtering decisions)
  };
}

/* ------------------ public API ------------------ */

// Tolerant list: shows published; if none marked, show all so UI isn't empty.
export async function listPublishedQuizzes() {
  const colRef = collection(db, "quizzes");
  const snap = await getDocs(colRef);

  // normalize all
  const items = snap.docs.map(function (d) {
    const norm = normalizeQuiz(d);
    norm._raw = d.data() || {};
    return norm;
  });

  // treat any of these as "published"
  function isPublished(raw) {
    return (
      raw.status === "published" ||
      raw.status === "Published" ||
      raw.published === true ||
      raw.isPublished === true ||
      raw.visibility === "public"
    );
  }

  const published = items.filter(function (q) { return isPublished(q._raw); });

  // if nothing explicitly published, fallback to all items
  return published.length ? published : items;
}

// Get a single quiz by ID and normalize fields.
export async function getQuizById(quizId) {
  const ref = doc(db, "quizzes", quizId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return normalizeQuiz(snap);
}

// Fallback: load questions from a subcollection if not embedded in the doc.
export async function getQuestionsFromSubcollection(quizId) {
  const ref = doc(db, "quizzes", quizId);
  const sub = collection(ref, "questions");
  const qs = await getDocs(sub);
  return qs.docs.map(function (d, i) {
    const data = d.data() || {};
    return {
      id: d.id || ("Q" + (i + 1)),
      text: data.text || data.question || ("Question " + (i + 1)),
      type: data.type || (Array.isArray(data.choices || data.options) ? "MCQ" : "SHORT"),
      choices: data.choices || data.options || [],
    };
  });
}

/* ------------------ NEW helper: find by subject + category --------- */

// Find a single quiz by subject + category (e.g. "Maths" + "Algebra")
export async function findQuizBySubjectAndCategory(subject, category) {
  const colRef = collection(db, "quizzes");

  // exact-match query on subject + category
  const qSnap = await getDocs(
    query(colRef, where("subject", "==", subject), where("category", "==", category))
  );

  if (qSnap.empty) return null;

  const docSnap = qSnap.docs[0];
  const norm = normalizeQuiz(docSnap);
  norm._raw = docSnap.data() || {};

  // Ensure the normalized object reflects what we queried by
  if (subject) norm.subject = subject;
  if (category) norm.category = category;

  return norm;
}
