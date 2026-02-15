import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyA1CuBigtgZ9BFiF5sh-7nAb2G00iuhed4",
    authDomain: "venosense-2a458.firebaseapp.com",
    projectId: "venosense-2a458",
    storageBucket: "venosense-2a458.firebasestorage.app",
    messagingSenderId: "467494137411",
    appId: "1:467494137411:web:19bce12a8a1b499b56aef6",
    measurementId: "G-6Z8HNFEXPJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app); // Optional, but good to keep since user included it
const db = getFirestore(app);

export { db, app, analytics };
