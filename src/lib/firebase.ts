// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAKrYmCvcaD5mVxV1w14wpwDbb2rVG6dLM",
  authDomain: "saath-22541.firebaseapp.com",
  projectId: "saath-22541",
  storageBucket: "saath-22541.firebasestorage.app",
  messagingSenderId: "621911507210",
  appId: "1:621911507210:web:7b020f0852b44376e67af3",
  measurementId: "G-318M8GGT5G",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);

export default app;
