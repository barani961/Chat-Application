import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { auth, db } from '../firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userId: string, name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (!userData.id) userData.id = firebaseUser.uid;
            setUser(userData as User);
          } else {
            // Fallback to Firebase Auth user if Firestore doc missing
            setUser({
              id: firebaseUser.uid,
              userId: firebaseUser.displayName || '', // fallback, may be blank
              name: firebaseUser.displayName || '',
              email: firebaseUser.email || '',
              avatar: firebaseUser.photoURL || '',
              status: 'online',
            });
          }
        } else {
          setUser(null);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to fetch user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      // User state will be set by onAuthStateChanged
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userId: string, name: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      // Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      console.log('Registration successful, Auth UID:', cred.user.uid);
      // Store user profile in Firestore
      const userProfile: User = {
        id: cred.user.uid, // Firebase UID
        userId,           // Chosen username
        name,
        email,
        avatar: '',
        status: 'online',
      };
      await setDoc(doc(db, 'users', cred.user.uid), userProfile); // Correct path: top-level users collection
      console.log('User profile written to Firestore:', userProfile);
      setUser(userProfile);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
      console.error('Registration error:', err);
      alert('Registration error: ' + (err.message || err));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (userData: Partial<User>) => {
    setLoading(true);
    setError(null);
    try {
      if (user) {
        const updatedUser = { ...user, ...userData };
        await setDoc(doc(db, 'users', auth.currentUser!.uid), updatedUser, { merge: true }); // Correct path: top-level users collection
        setUser(updatedUser);
      }
    } catch (err: any) {
      setError(err.message || 'Profile update failed.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateProfile,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};