import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Login from "./Components/InitialPage/Login";
import Register from "./Components/InitialPage/Register";
import Home from "./Components/HomePage/Home";
import BookDetail from "./Components/BookDetail/BookDetail";
import ChatGlobal from "./Components/Chat/ChatGlobal";
import EventoDetail from "./Components/EventoDetail/EventoDetail";
import CategoryPage from "./Components/HomePage/CategoryPage";
import SearchPage from "./Components/SearchPage/searchPage";
import MyBooks from "./Components/MyBooks/MyBooks";
import Profile from "./Components/Profile/Profile";
import { ProfilePage } from "./Components/ProfilePage/UserProfile";

function App() {
  return (
    <Router>
      <nav className="main-nav">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/register" className="nav-link">Crear Cuenta</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/my-books" className="nav-link">Mis Libros</Link>
        <Link to="/profile" className="nav-link">Mi Perfil</Link>
        <Link to="/chat" className="nav-link highlight">Chat Global</Link>
      </nav>

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
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat" element={<ChatGlobal />} />
        <Route path="/my-books" element={<MyBooks />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/profile-old" element={<ProfilePage />} />
        <Route path="/libros/:id" element={<BookDetail />} />
        <Route path="/eventos/:id" element={<EventoDetail />} />
        <Route path="/categorias/:type" element={<CategoryPage />} />
        <Route path="/search" element={<SearchPage />} />
      </Routes>
    </Router>
  )
}

export default App;