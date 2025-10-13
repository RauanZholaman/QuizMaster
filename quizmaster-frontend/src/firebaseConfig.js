// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAWwnrhz5zCg0iS3DCgFVmmAOOq8m1If-g",
  authDomain: "quizmaster-e0449.firebaseapp.com",
  projectId: "quizmaster-e0449",
  storageBucket: "quizmaster-e0449.firebasestorage.app",
  messagingSenderId: "305844463785",
  appId: "1:305844463785:web:8f3b77f7b1a9100da9e1b8",
  measurementId: "G-M3BL8DK7ZY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);