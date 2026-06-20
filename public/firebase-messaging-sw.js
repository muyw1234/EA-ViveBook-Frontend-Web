/* eslint-env serviceworker */
/* global importScripts, firebase */
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: 'AIzaSyAFB9g4-Sn0b93oYoTpc_HaGLcCV-fgK4w',
  authDomain: 'ea-vivebook-frontend-web.firebaseapp.com',
  projectId: 'ea-vivebook-frontend-web',
  storageBucket: 'ea-vivebook-frontend-web.firebasestorage.app',
  messagingSenderId: '870483568720',
  appId: '1:870483568720:web:dd4452b22e2c47ae82c955',
  measurementId: 'G-DNXTF3D8MB',
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Mensaje en segundo plano interceptado:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.svg',
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
