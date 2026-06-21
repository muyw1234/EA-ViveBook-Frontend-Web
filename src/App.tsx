import { useEffect } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Importaciones de Firebase Web SDK
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

import Login from './Components/InitialPage/Login';
import Register from './Components/InitialPage/Register';
import Home from './Components/HomePage/Home';
import BookDetail from './Components/BookDetail/BookDetail';
import EventoDetail from './Components/EventoDetail/EventoDetail';
import CategoryPage from './Components/HomePage/CategoryPage';
import SearchPage from './Components/SearchPage/searchPage';
import MyBooks from './Components/MyBooks/MyBooks';
import Profile from './Components/Profile/Profile';
import { ProfilePage } from './Components/ProfilePage/UserProfile';
import AIChatBox from './Components/AIChatBox/AIChatBox';
import Retos from './Components/Retos/Retos';
import ProtectedRoute from './Components/ProtectedRoute';
import Discover from './Components/Discover/Discover';
import Buzon from './Components/Buzon/Buzon';
import { clearSession } from './utils/session';
import { useSessionToken } from './hooks/useSessionToken';
import { MatomoProvider } from 'matomo-tracker-for-react';

// Configuración de Firebase que ya tenías definida
const firebaseConfig = {
  apiKey: 'AIzaSyAFB9g4-Sn0b93oYoTpc_HaGLcCV-fgK4w',
  authDomain: 'ea-vivebook-frontend-web.firebaseapp.com',
  projectId: 'ea-vivebook-frontend-web',
  storageBucket: 'ea-vivebook-frontend-web.firebasestorage.app',
  messagingSenderId: '870483568720',
  appId: '1:870483568720:web:dd4452b22e2c47ae82c955',
  measurementId: 'G-DNXTF3D8MB',
};

// Inicializar Firebase
const firebaseApp = initializeApp(firebaseConfig);
const messaging = getMessaging(firebaseApp);

function Navigation() {
  const { t } = useTranslation();
  useLocation();
  const token = useSessionToken();

  const handleLogout = () => {
    clearSession();
    window.location.assign('/');
  };

  return (
    <nav className="main-nav">
      <Link to="/" className="nav-link">
        {t('nav.home')}
      </Link>
      <Link to="/categorias/sales" className="nav-link">
        {t('nav.books')}
      </Link>
      <Link to="/categorias/events" className="nav-link">
        {t('nav.events')}
      </Link>

      {!token ? (
        <>
          <Link to="/register" className="nav-link">
            {t('nav.register')}
          </Link>
          <Link to="/login" className="nav-link">
            {t('nav.login')}
          </Link>
        </>
      ) : (
        <>
          <Link to="/discover" className="nav-link">
            {t('nav.discover')}
          </Link>
          <Link to="/buzon" className="nav-link">
            {t('nav.mailbox')}
          </Link>
          <Link to="/my-books" className="nav-link">
            {t('nav.myBooks')}
          </Link>
          <Link to="/retos" className="nav-link">
            {t('nav.challenges')}
          </Link>
          <Link to="/profile" className="nav-link">
            {t('nav.profile')}
          </Link>
          <Link to="/ia" className="nav-link highlight">
            {t('nav.ai')}
          </Link>

          <button
            onClick={handleLogout}
            className="nav-link"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: 'inherit',
              fontWeight: 600,
              padding: '0.5rem 1rem',
              borderRadius: '99px',
            }}
          >
            {t('nav.logout')}
          </button>
        </>
      )}
    </nav>
  );
}

function App() {
  const location = useLocation();
  const currentPath = location.pathname + location.search + location.hash;

  useEffect(() => {
    const activarNotificacionesWeb = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Obtener el Token Web. Reemplaza 'TU_CLAVE_VAPID_PUBLICA' con tu par de claves web de la consola de Firebase.
          const tokenWeb = await getToken(messaging, {
            vapidKey:
              'BIcoahhckzky0gMhRfx-3bqMJ8d7tMBfVLto8nlUa-Uvh3ueD7H8Bhi2dUF47esdOkj3-c2e7PvX7w6nsdCeSdA',
          });
          console.log('👉 TU TOKEN WEB FCM:', tokenWeb);
        } else {
          console.log('❌ Permiso de notificaciones denegado.');
        }
      } catch (error) {
        console.error('❌ Error al configurar FCM Web:', error);
      }
    };

    activarNotificacionesWeb();

    // Capturar mensajes cuando el usuario tiene la pestaña abierta e interactuando
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('📨 Mensaje recibido en primer plano (Web):', payload);
      alert(`Notificación: ${payload.notification?.title}\n${payload.notification?.body}`);
    });

    return () => unsubscribe();
  }, []);

  return (
    <MatomoProvider urlBase="https://ea3upc.matomo.cloud" siteId="1" path={currentPath}>
      <Navigation />

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/libros/:id" element={<BookDetail />} />
        <Route path="/eventos/:id" element={<EventoDetail />} />
        <Route path="/categorias/:type" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/ia" element={<AIChatBox />} />
          <Route path="/discover" element={<Discover />} />
          <Route path="/buzon" element={<Buzon />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/retos" element={<Retos />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile-old" element={<ProfilePage />} />
        </Route>
      </Routes>
    </MatomoProvider>
  );
}

export default App;
