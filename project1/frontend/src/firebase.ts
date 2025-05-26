// Aurora Chat App - Firebase Initialization
// Replace the below config with your Firebase project credentials
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyAl-nDJuTtsBcp0M02s2ZoKpa_OT4aysoQ",
  authDomain: "chating-21843.firebaseapp.com",
  projectId: "chating-21843",
  storageBucket: "chating-21843.appspot.com",
  messagingSenderId: "602449863563",
  appId: "1:602449863563:web:edef7accf96ccab9e6858e",
  measurementId: "G-L1C6KPH8VM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// Analytics is optional and only works in browsers
let analytics: ReturnType<typeof getAnalytics> | undefined;
if (typeof window !== 'undefined') {
  try {
    analytics = getAnalytics(app);
  } catch (e) {}
}
export const auth = getAuth(app);
export const db = getFirestore(app);
