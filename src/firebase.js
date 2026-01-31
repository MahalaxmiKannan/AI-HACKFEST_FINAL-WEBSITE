// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyBYQzsctg4jD_wjHrUmhsdefH-til_QKz4",
    authDomain: "hack-4bbcb.firebaseapp.com",
    projectId: "hack-4bbcb",
    storageBucket: "hack-4bbcb.firebasestorage.app",
    messagingSenderId: "421219363783",
    appId: "1:421219363783:web:c2e7d1b79c1d7caafc87e2",
    measurementId: "G-2KC2XB81BE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app);
export const auth = getAuth(app);
