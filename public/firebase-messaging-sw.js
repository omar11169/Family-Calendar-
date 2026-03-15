importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker by passing in
// your app's Firebase config object.
// https://firebase.google.com/docs/web/setup#config-object
const firebaseConfig = {
  apiKey: "AIzaSyDUOCt-grPGrhtXmSLUf2YKQcPpQdoA67U",
  authDomain: "calendar-a0757.firebaseapp.com",
  projectId: "calendar-a0757",
  storageBucket: "calendar-a0757.firebasestorage.app",
  messagingSenderId: "330314421542",
  appId: "1:330314421542:web:27d0d3d6b50c15f67b5de7",
  measurementId: "G-9EZR7VNGLT"
};

firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: 'https://picsum.photos/seed/familycal/192/192'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
