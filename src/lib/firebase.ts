import { initializeApp, getApps } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, User } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBvg47Aoh48Ygz8VIcVcg6UbeSjMpxUkgs",
  authDomain: "journeyhouseonboardin.firebaseapp.com",
  projectId: "journeyhouseonboardin",
  storageBucket: "journeyhouseonboardin.firebasestorage.app",
  messagingSenderId: "470268962499",
  appId: "1:470268962499:web:aaf10aa91902dc090ae476",
  measurementId: "G-W3ZTD3SFS0"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

// Only initialize analytics on the client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Auth functions
export const loginUser = async (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};

export const registerUser = async (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};

export const logoutUser = async () => {
  return signOut(auth);
};

export { auth };
export default app; 