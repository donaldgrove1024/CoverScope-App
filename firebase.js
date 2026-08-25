import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBhooIcxcFso2HezWSabqH0kEsHxwAcev4", 
  authDomain: "coverscope-ac374.firebaseapp.com",
  projectId: "coverscope-ac374",
  storageBucket: "coverscope-ac374.firebasestorage.app",
  messagingSenderId: "787915218213",
  appId: "1:787915218213:web:279ecb8a79bee9caed8ecc"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services so they can be imported in other files
export const auth = getAuth(app);
export const db = getFirestore(app);
