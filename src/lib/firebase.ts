import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBJc0xO9KSjCef0pw7-YrJ0w4pzk-PAsCA",
  authDomain: "evoclabs-41905.firebaseapp.com",
  projectId: "evoclabs-41905",
  storageBucket: "evoclabs-41905.firebasestorage.app",
  messagingSenderId: "230797425266",
  appId: "1:230797425266:web:7230b02573b4177e64e0eb",
  measurementId: "G-25T2MC064F",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only if in browser environment
let analytics;
if (typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch (error) {
    console.warn("Analytics initialization failed:", error);
  }
}

export const db = getFirestore(app);
