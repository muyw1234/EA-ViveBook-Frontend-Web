import React, { useState } from "react";
import UsuarioService from "../Services/Usuario";

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
    <div style={{ maxWidth: "400px", margin: "0 auto", padding: "20px" }}>
            <h2>Crear Nuevo Usuario</h2>
            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "10px" }}>
                    <label>Nombre de Usuario:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", display: "block" }}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", display: "block" }}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Contraseña:</label>
                    <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        style={{ width: "100%", display: "block" }}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Registrando..." : "Registrarse"}
                </button>
            </form>

            {message && (
                <p style={{ marginTop: "15px", color: message.includes("Error") ? "red" : "green" }}>
                    {message}
                </p>
            )}
        </div>
    );
};

export default Register;
