import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyA37vIjy51YBR5HLM0lhj6_LGH-gAnyHx8",
  authDomain: "learnsmarthub-2ec80.firebaseapp.com",
  projectId: "learnsmarthub-2ec80",
  storageBucket: "learnsmarthub-2ec80.firebasestorage.app",
  messagingSenderId: "240775963901",
  appId: "1:240775963901:web:7b855fa044ca224810ca94",
  measurementId: "G-MPRJGQ8P9P"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);