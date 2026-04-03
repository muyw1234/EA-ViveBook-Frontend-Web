import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./Components/InitialPage/LogIn";
import Register from "./Components/InitialPage/Register";

function App() {
  return (
    <Router>
      <nav >
        <Link to="/">Login</Link> | <Link to="/register">Crear Cuenta</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </Router>
  )
  
}
export default App;