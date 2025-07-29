import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, User } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebasestorage.app`,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

export const authService = {
  async signUp(email: string, password: string, displayName: string, schoolLevel: string) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Register user in our backend
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: user.email,
        displayName,
        schoolLevel,
        firebaseUid: user.uid,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to register user in backend');
    }
    
    return user;
  },

  async signIn(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Login user in our backend
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firebaseUid: user.uid,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to login user in backend');
    }
    
    return user;
  },

  async signOut() {
    await signOut(auth);
  },

  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  },
};
