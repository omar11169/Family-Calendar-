import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

// REPLACE THIS WITH YOUR FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyDUOCt-grPGrhtXmSLUf2YKQcPpQdoA67U",
  authDomain: "calendar-a0757.firebaseapp.com",
  projectId: "calendar-a0757",
  storageBucket: "calendar-a0757.firebasestorage.app",
  messagingSenderId: "330314421542",
  appId: "1:330314421542:web:27d0d3d6b50c15f67b5de7",
  measurementId: "G-9EZR7VNGLT"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Messaging setup (may fail if not supported in browser or no config)
let messaging: ReturnType<typeof getMessaging> | null = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.warn("Firebase Messaging not supported or failed to initialize", error);
}

export { messaging };

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      // Replace with your VAPID key from Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration
      const currentToken = await getToken(messaging, { vapidKey: 'BFU4qW6muiS1dAoRGlEAIPZoNv3vR6xgSezzdNNkANwTwFn0vZPGOuI9nKcsu3MNRUmyTgGZTzjbz-W4TwaIDkk' });
      if (currentToken) {
        console.log('FCM Token:', currentToken);
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Unable to get permission to notify.');
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
  }
  return null;
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    if (!messaging) return;
    onMessage(messaging, (payload) => {
      resolve(payload);
    });
  });
