import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./Components/InitialPage/Login";
import Register from "./Components/InitialPage/Register";
import Home from "./Components/HomePage/Home";
import BookDetail from "./Components/BookDetail/BookDetail";
import ChatGlobal from "./Components/Chat/ChatGlobal";

function App() {
  return (
    <Router>
      <nav style={{ padding: "1rem", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", gap: "1rem", justifyContent: "center" }}>
        <Link to="/" style={{ textDecoration: "none", color: "#64748b", fontWeight: "600" }}>Login</Link>
        <Link to="/register" style={{ textDecoration: "none", color: "#64748b", fontWeight: "600" }}>Crear Cuenta</Link>
        <Link to="/home" style={{ textDecoration: "none", color: "#64748b", fontWeight: "600" }}>Home</Link>
        <Link to="/chat" style={{ textDecoration: "none", color: "#7c3aed", fontWeight: "bold" }}>Chat Global 🌍</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/chat" element={<ChatGlobal />} />
        <Route path="/libros/:id" element={<BookDetail />} />
      </Routes>
    </Router>
  )
  
}
export default App;
