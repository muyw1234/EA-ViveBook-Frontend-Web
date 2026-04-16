import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import UsuarioService from "../Services/Usuario";
import "./Auth.css";

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const data = await UsuarioService.getUserByEmail({ email, password });
            console.log("Login exitoso", data);
            navigate("/Home"); 
        } catch (err: any) {
            setError("Email o contraseña incorrectos");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Bienvenido de nuevo</h2>
                <p className="auth-subtitle">Inicia sesión y continúa tu lectura.</p>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input 
                            type="email" 
                            placeholder="laura@ejemplo.com" 
                            className="auth-input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div className="input-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            placeholder="Tu contraseña" 
                            className="auth-input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? "Entrando..." : "Entrar"}
                    </button>
                    
                    <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#64748b" }}>
                        ¿No tienes cuenta? <Link to="/register" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: "600" }}>Regístrate aquí</Link>
                    </div>
                </form>

                {error && (
                    <div className="auth-message error">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Login;