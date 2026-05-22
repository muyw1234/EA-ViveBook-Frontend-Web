import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./Components/InitialPage/Login";
import Register from "./Components/InitialPage/Register";
import Home from "./Components/HomePage/Home";
import BookDetail from "./Components/BookDetail/BookDetail";
import ChatGlobal from "./Components/Chat/ChatGlobal";
import EventoDetail from "./Components/EventoDetail/EventoDetail";
import CategoryPage from "./Components/HomePage/CategoryPage";
import SearchPage from "./Components/SearchPage/searchPage";

function App() {
  return (
    <Router>
      <nav className="main-nav">
        <Link to="/" className="nav-link">Login</Link>
        <Link to="/register" className="nav-link">Crear Cuenta</Link>
        <Link to="/home" className="nav-link">Home</Link>
        <Link to="/chat" className="nav-link highlight">Chat Global</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<ChatGlobal />} />
        <Route path="/libros/:id" element={<BookDetail />} />
        <Route path="/eventos/:id" element={<EventoDetail />} />
        <Route path="/categorias/:type" element={<CategoryPage />} />
        {/* <Route path="/search/:term" element=<SearchPage/> /> // Esto era pasando como parametro */}
        <Route path="/search" element=<SearchPage/> /> {/* Pero aqui lo pasamos como estado en la navegacion*/}
      </Routes>
    </Router>
  )
  
}
export default App;
