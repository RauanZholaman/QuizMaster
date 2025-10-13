// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAWwnrhz5zCg0iS3DCgFVmmAOOq8m1If-g",
  authDomain: "quizmaster-e0449.firebaseapp.com",
  projectId: "quizmaster-e0449",
  storageBucket: "quizmaster-e0449.appspot.com", // IMPORTANT: appspot.com
  messagingSenderId: "305844463785",
  appId: "1:305844463785:web:8f3b77f7b1a9100da9e1b8",
  measurementId: "G-M3BL8DK7ZY"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;
