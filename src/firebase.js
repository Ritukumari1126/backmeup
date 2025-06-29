import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ✅ Your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyAm9HIZ7oxSy4KquMIaclA-X33Kk4xNJvo",
  authDomain: "backmeup-995aa.firebaseapp.com",
  projectId: "backmeup-995aa",
  storageBucket: "backmeup-995aa.firebasestorage.app",
  messagingSenderId: "1039685036174",
  appId: "1:1039685036174:web:24a181bf207d6f612bc1df"
};

// ✅ Initialize Firebase
const app = initializeApp(firebaseConfig);

// ✅ Export Auth & Google provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
