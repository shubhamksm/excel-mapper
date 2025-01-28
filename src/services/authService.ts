import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

export const authService = {
  // Initialize auth
  auth: getAuth(),

  // Google sign in
  signInWithGoogle: async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(getAuth(), provider);

      // Create/update user in Firestore
      const user = result.user;
      await authService.createOrUpdateUser(user);

      return user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  },

  // Create or update user in Firestore
  createOrUpdateUser: async (firebaseUser: FirebaseUser) => {
    const userRef = doc(db, "users", firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create new user
      await setDoc(userRef, {
        id: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp(),
      });
    } else {
      // Update last login
      await setDoc(
        userRef,
        {
          lastLoginAt: serverTimestamp(),
        },
        { merge: true }
      );
    }
  },

  // Sign out
  signOut: () => getAuth().signOut(),

  // Get current user
  getCurrentUser: () => getAuth().currentUser,

  // Subscribe to auth state changes
  onAuthStateChanged: (callback: (user: FirebaseUser | null) => void) =>
    onAuthStateChanged(getAuth(), callback),
};
