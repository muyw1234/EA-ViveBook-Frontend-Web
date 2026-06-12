import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Login from './Components/InitialPage/Login';
import Register from './Components/InitialPage/Register';
import Home from './Components/HomePage/Home';
import BookDetail from './Components/BookDetail/BookDetail';
import ChatGlobal from './Components/Chat/ChatGlobal';
import EventoDetail from './Components/EventoDetail/EventoDetail';
import CategoryPage from './Components/HomePage/CategoryPage';
import SearchPage from './Components/SearchPage/searchPage';
import MyBooks from './Components/MyBooks/MyBooks';
import Profile from './Components/Profile/Profile';
import { ProfilePage } from './Components/ProfilePage/UserProfile';
import AIChatBox from './Components/AIChatBox/AIChatBox';
import Retos from './Components/Retos/Retos';
import ProtectedRoute from './Components/ProtectedRoute';

function Navigation() {
  useLocation(); // Triggers re-render on route changes
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <nav className="main-nav">
      <Link to="/" className="nav-link">
        Inicio
      </Link>
      <Link to="/categorias/sales" className="nav-link">
        Libros
      </Link>
      <Link to="/categorias/events" className="nav-link">
        Eventos
      </Link>

      {!token ? (
        <>
          <Link to="/register" className="nav-link">
            Crear Cuenta
          </Link>
          <Link to="/login" className="nav-link">
            Login
          </Link>
        </>
      ) : (
        <>
          <Link to="/my-books" className="nav-link">
            Mis Libros
          </Link>
          <Link to="/retos" className="nav-link">
            Retos
          </Link>
          <Link to="/profile" className="nav-link">
            Mi Perfil
          </Link>
          <Link to="/ia" className="nav-link highlight">
            IA
          </Link>
          <Link to="/chat" className="nav-link highlight">
            Chat Global
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
            Cerrar Sesión
          </button>
        </>
      )}
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navigation />

      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/libros/:id" element={<BookDetail />} />
        <Route path="/eventos/:id" element={<EventoDetail />} />
        <Route path="/categorias/:type" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />

        {/* Rutas Privadas */}
        <Route element={<ProtectedRoute />}>
          <Route path="/chat" element={<ChatGlobal />} />
          <Route path="/ia" element={<AIChatBox />} />
          <Route path="/my-books" element={<MyBooks />} />
          <Route path="/retos" element={<Retos />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/profile-old" element={<ProfilePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
