import React from "react";
import { useNavigate } from "react-router-dom";

const Login: React.FC = () => {
  const navigate = useNavigate(); 

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Iniciar Sesión</h2>
      <form>
        <input type="email" placeholder="Email" /><br/>
        <input type="password" placeholder="Contraseña" /><br/>
        <button type="submit">Entrar</button>
      </form>

      <p>¿No tienes cuenta?</p>
      <button onClick={() => navigate("/register")}>
        Ir a Registro
      </button>
    </div>
  );
};

export default Login;