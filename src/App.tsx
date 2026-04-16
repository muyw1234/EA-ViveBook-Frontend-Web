import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./Components/InitialPage/Login";
import Register from "./Components/InitialPage/Register";
import Home from "./Components/HomePage/Home";

function App() {
  return (
    <Router>
      <nav >
        <Link to="/">Login</Link> | <Link to="/register">Crear Cuenta</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  )
  
}
export default App;