import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import api from '../../api';
import { toast } from 'react-toastify';

const firebaseConfig = {
  apiKey: 'AIzaSyAFB9g4-Sn0b93oYoTpc_HaGLcCV-fgK4w',
  authDomain: 'ea-vivebook-frontend-web.firebaseapp.com',
  projectId: 'ea-vivebook-frontend-web',
  storageBucket: 'ea-vivebook-frontend-web.firebasestorage.app',
  messagingSenderId: '870483568720',
  appId: '1:870483568720:web:dd4452b22e2c47ae82c955',
  measurementId: 'G-DNXTF3D8MB',
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const solicitarPermisosYObtenerToken = async () => {
  try {
    const permission = await Notification.requestPermission();

    if (permission === 'granted') {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('Service Worker registrado correctamente para FCM:', registration);

      const token = await getToken(messaging, {
        vapidKey:
          'BIcoahhckzky0gMhRfx-3bqMJ8d7tMBfVLto8nlUa-Uvh3ueD7H8Bhi2dUF47esdOkj3-c2e7PvX7w6nsdCeSdA',
        serviceWorkerRegistration: registration,
      });

      if (token) {
        console.log('Token FCM del navegador listo:', token);

        try {
          await api.post('/auth/update-fcm-token', { fcmToken: token });
          console.log('Token actualizado correctamente en el backend');
        } catch (apiError) {
          console.error('El backend no pudo guardar el token:', apiError);
        }
      }
    } else {
      console.log('El usuario rechazó los permisos de notificación.');
    }
  } catch (error) {
    console.error('Error configurando las notificaciones web push:', error); // Aquí es donde te saltaba el log
  }
};

export const escucharNotificacionesActivas = () => {
  onMessage(messaging, (payload) => {
    console.log('Mensaje recibido en primer plano:', payload);

    toast.info(
      `📚 ${payload.notification?.title || 'Nuevo Libro'}: ${payload.notification?.body}`,
      {
        icon: () => '📚',
        progressClassName: 'bg-purple-500',
      },
    );
  });
};
