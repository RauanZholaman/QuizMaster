// Firestore helpers for quizzes, submissions, grading, and feedback
import { db } from "../firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

// Collections (adjust names to match your schema once finalized)
const QUIZZES = "quizzes";
const SUBMISSIONS = "submissions"; // suggested: /quizzes/{quizId}/submissions

// Fetch a quiz document
export async function getQuiz(quizId) {
  const ref = doc(db, QUIZZES, quizId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Fetch questions for a quiz (as subcollection), ordered by `order`
export async function getQuizQuestions(quizId) {
  const q = query(collection(db, QUIZZES, quizId, "questions"), orderBy("order"));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Convenience: fetch quiz with its questions
export async function getQuizWithQuestions(quizId) {
  const [quiz, questions] = await Promise.all([
    getQuiz(quizId),
    getQuizQuestions(quizId),
  ]);
  return { quiz, questions };
}

export function computeQuizMaxTotal(questions) {
  return (questions || []).reduce((sum, q) => sum + (Number(q.maxScore) || 0), 0);
}

// List quizzes for an educator (if you store ownerId)
export async function listQuizzesByOwner(ownerId) {
  const q = query(collection(db, QUIZZES), where("ownerId", "==", ownerId));
  const snaps = await getDocs(q);
  return snaps.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Get a submission (suggested path: quizzes/{quizId}/submissions/{submissionId})
export async function getSubmission(quizId, submissionId) {
  const ref = doc(db, QUIZZES, quizId, SUBMISSIONS, submissionId);
  const snap = await getDoc(ref);
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// Save per-question scores (merge into submission)
export async function saveScores(quizId, submissionId, scores) {
  const ref = doc(db, QUIZZES, quizId, SUBMISSIONS, submissionId);
  await setDoc(ref, { scores }, { merge: true });
}

// Publish final feedback and total
export async function publishFeedback(quizId, submissionId, feedback, total) {
  const ref = doc(db, QUIZZES, quizId, SUBMISSIONS, submissionId);
  await updateDoc(ref, { feedback, total, publishedAt: serverTimestamp() });
}
