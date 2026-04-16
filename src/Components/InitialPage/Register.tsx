import React, { useState } from "react";
import UsuarioService from "../Services/Usuario";
import { Link } from "react-router-dom";
import "./Auth.css";

const Register: React.FC = () => {
    const [formData, setFormData] = React.useState({
        name: "",
        email: "",
        password: "",
    });

    const [message, setMessage] = useState("");
    const [loading, setLoading] = React.useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        try {
            const newUser = await UsuarioService.createUser(formData);
            console.log("Usuario creado:", newUser);
            setMessage("¡Registro exitoso! Ya puedes iniciar sesión.");
            setFormData({ name: "", email: "", password: "" });
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || "Error al registrar usuario";
            setMessage(`Error: ${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    return(
        <div className="auth-container">
            <div className="auth-card">
                <h2 className="auth-title">Únete a ViveBook</h2>
                <p className="auth-subtitle">Crea tu cuenta y empieza a leer hoy.</p>
                
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Nombre de Usuario</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="auth-input"
                            placeholder="Ej: Laura Pérez"
                        />
                    </div>

                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="auth-input"
                            placeholder="laura@ejemplo.com"
                        />
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="auth-input"
                            placeholder="Mínimo 6 caracteres"
                        />
                    </div>

                    <button type="submit" className="auth-button" disabled={loading}>
                        {loading ? "Registrando..." : "Crear cuenta"}
                    </button>
                    
                    <div style={{ marginTop: "1rem", fontSize: "0.9rem", color: "#64748b" }}>
                        ¿Ya tienes cuenta? <Link to="/" style={{ color: "#7c3aed", textDecoration: "none", fontWeight: "600" }}>Inicia sesión aquí</Link>
                    </div>
                </form>

                {message && (
                    <div className={`auth-message ${message.includes("Error") ? "error" : "success"}`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Register;
