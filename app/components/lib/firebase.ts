import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage, ref } from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6fJE0QSv4hWCBkDRxmWLYkNP3tyAklmQ",
  authDomain: "si-135-halloween.firebaseapp.com",
  projectId: "si-135-halloween",
  storageBucket: "si-135-halloween.firebasestorage.app",
  messagingSenderId: "868998930778",
  appId: "1:868998930778:web:e11b4f740967b2238c5363",
};

// Avoids "app already exists" errors during Next.js hot reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const storage = getStorage(app);
export const storageRef = ref(storage);
export const db = getFirestore(app, "si-135-halloween-db");
