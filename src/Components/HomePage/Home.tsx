import React, { useState, useEffect } from "react";
import "./Home.css";
import UsuarioService from "../Services/Usuario";
import LibroService from "../Services/Libro";
import { useNavigate } from "react-router-dom";

const Home: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [books, setBooks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Profile
                const userData = await UsuarioService.getProfile();
                setUser(userData);

                // Fetch Books from DB
                const booksData = await LibroService.getAllLibros();
                setBooks(booksData);
            } catch (error) {
                console.error("Error fetching data:", error);
                // If unauthorized, redirect to login
                if ((error as any).response?.status === 401) {
                    navigate("/");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    // Mock data for bookstore events (keep mock for now as requested "everything from backend" applies to books first)
    const mockEvents = [
        { id: 1, title: "Firma de Libros: Elvira Sastre", location: "Librería Central", date: "15 Oct" },
        { id: 2, title: "Club de Lectura Sci-Fi", location: "La madriguera", date: "20 Oct" },
        { id: 3, title: "Taller de Escritura Creativa", location: "Ateneo", date: "12 Nov" },
    ];

    if (loading) {
        return <div className="home-container">Cargando ViveBook...</div>;
    }

    return (
        <div className="home-container">
            {/* Header & Search */}
            <header className="search-header">
                <div className="logo-container">
                    <span className="logo-text">ViveBook</span>
                    <div className="user-info-nav">
                        {user ? (
                            <div className="user-profile-badge">
                                <span className="username-display">{user.name}</span>
                                <div className="user-avatar-placeholder"></div>
                            </div>
                        ) : (
                            <button onClick={() => navigate("/")} className="login-btn">Iniciar Sesión</button>
                        )}
                    </div>
                </div>
                <div className="search-bar-wrapper">
                    <span className="search-icon">🔍</span>
                    <input 
                        type="text" 
                        className="search-bar" 
                        placeholder="Busca libros, autores o librerías..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </header>

            {/* Hero Banner */}
            <section className="hero-banner">
                <h1>Tu próxima historia <br/> te está esperando.</h1>
                <p>Alquila, comparte y vive la lectura en tu comunidad.</p>
            </section>

            {/* Books Section */}
            <section className="content-section">
                <div className="section-header">
                    <h2 className="section-title">Libros en Alquiler</h2>
                    <a href="#" className="see-all">Ver todos</a>
                </div>
                <div className="card-grid">
                    {books.length > 0 ? (
                        books.map(book => (
                            <div key={book._id} className="book-card">
                                <div className="card-image-placeholder">
                                    📚 <br/> [Imagen]
                                </div>
                                <div className="card-info">
                                    <span className="card-price">{book.price || "Check availability"}</span>
                                    <span className="card-title" title={book.title}>{book.title}</span>
                                    <span className="card-meta">{book.authors?.join(", ") || "Unknown Author"}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-data-msg">No hay libros disponibles en este momento.</p>
                    )}
                </div>
            </section>

            {/* Events Section */}
            <section className="content-section">
                <div className="section-header">
                    <h2 className="section-title">Eventos Destacados</h2>
                    <a href="#" className="see-all">Ver todos</a>
                </div>
                <div className="events-grid">
                    {mockEvents.map(event => (
                        <div key={event.id} className="event-card">
                            <div className="event-date">
                                <span className="day">{event.date.split(" ")[0]}</span>
                                <span className="month">{event.date.split(" ")[1]}</span>
                            </div>
                            <div className="event-details">
                                <span className="event-title">{event.title}</span>
                                <span className="event-location">📍 {event.location}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

export default Home;