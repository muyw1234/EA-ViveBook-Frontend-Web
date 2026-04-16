import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import UsuarioService from "../Services/Usuario";

const Login: React.FC = () => {
const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const data = await UsuarioService.getUserByEmail({ email, password });
      console.log("Login exitoso", data);
      navigate("/Home"); 
    } catch (err: any) {
      setError("Email o contraseña incorrectos");
      console.error(err);
    }
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required 
        /><br/>
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required 
        /><br/>
        <button type="submit">Entrar</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <p>¿No tienes cuenta?</p>
      <button onClick={() => navigate("/register")}>
        Ir a Registro
      </button>
    </div>
  );
};

export default Login;