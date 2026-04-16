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
    const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
    
    // Form state corresponding to fields
    const [newBookType, setNewBookType] = useState("VENTA");
    const [newBookTitle, setNewBookTitle] = useState("");
    const [newBookIsbn, setNewBookIsbn] = useState("");
    const [newBookAuthor, setNewBookAuthor] = useState("");
    const [newBookState, setNewBookState] = useState("nuevo");
    const [newBookPrice, setNewBookPrice] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch User Profile
                const userData = await UsuarioService.getProfile();
                setUser(userData);

                // Fetch Books from DB
                const booksData = await LibroService.getAllLibros();
                const processedBooks = booksData.map((b: any, index: number) => ({
                    ...b,
                    status: b.status || (index % 2 === 0 ? "VENTA" : "ALQUILER")
                }));
                setBooks(processedBooks);
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

    const handleAddBookSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("status", newBookType);
            formData.append("title", newBookTitle);
            formData.append("isbn", newBookIsbn);
            formData.append("author", newBookAuthor);
            formData.append("state", newBookState);
            formData.append("price", newBookPrice);
            
            const newBookResponse = await LibroService.addLibroListing(formData);
            
            // Si el backend no nos devuelve la info formateada, creamos una simulación local
            const addedBook = newBookResponse && newBookResponse._id 
                ? { ...newBookResponse, status: newBookType, price: newBookPrice, authors: [newBookAuthor] } 
                : {
                _id: Date.now().toString(),
                title: newBookTitle,
                authors: [newBookAuthor],
                price: newBookPrice,
                status: newBookType
            };
            setBooks(prev => [...prev, addedBook]);
            
            alert("Libro añadido con éxito");
            setIsAddBookModalOpen(false);
            
            // Limpiar formulario
            setNewBookTitle("");
            setNewBookIsbn("");
            setNewBookAuthor("");
            setNewBookPrice("");
        } catch (error) {
            console.error("Error submitting book:", error);
            alert("Error al añadir el libro. Revisa la consola.");
        }
    };

    const alquilerBooks = books.filter(b => b.status === "ALQUILER");
    const ventaBooks = books.filter(b => b.status === "VENTA");

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
                        <button className="add-book-btn" onClick={() => setIsAddBookModalOpen(true)}>+ Añadir Libro</button>
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

            {/* Books Section - Alquiler */}
            <section className="content-section">
                <div className="section-header">
                    <h2 className="section-title">Libros en Alquiler</h2>
                    <a href="#" className="see-all">Ver todos</a>
                </div>
                <div className="card-grid">
                    {alquilerBooks.length > 0 ? (
                        alquilerBooks.map(book => (
                            <div key={`alquiler-${book._id}`} className="book-card">
                                <div className="card-image-placeholder">
                                    📚 <br/> [Imagen]
                                </div>
                                <div className="card-info">
                                    <span className="card-price">{book.price ? `${book.price} €` : "Consultar precio"}</span>
                                    <span className="card-title" title={book.title}>{book.title}</span>
                                    <span className="card-meta">{book.authors?.join(", ") || "Unknown Author"}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-data-msg">No hay libros de alquiler disponibles en este momento.</p>
                    )}
                </div>
            </section>

            {/* Books Section - Venta */}
            <section className="content-section">
                <div className="section-header">
                    <h2 className="section-title">Libros a la Venta</h2>
                    <a href="#" className="see-all">Ver todos</a>
                </div>
                <div className="card-grid">
                    {ventaBooks.length > 0 ? (
                        ventaBooks.map(book => (
                            <div key={`venta-${book._id}`} className="book-card">
                                <div className="card-image-placeholder">
                                    📚 <br/> [Imagen]
                                </div>
                                <div className="card-info">
                                    <span className="card-price">{book.price ? `${book.price} €` : "Consultar precio"}</span>
                                    <span className="card-title" title={book.title}>{book.title}</span>
                                    <span className="card-meta">{book.authors?.join(", ") || "Unknown Author"}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-data-msg">No hay libros a la venta disponibles en este momento.</p>
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

            {/* Add Book Modal */}
            {isAddBookModalOpen && (
                <div className="modal-overlay" onClick={() => setIsAddBookModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Añadir un Libro</h2>
                            <button className="close-btn" onClick={() => setIsAddBookModalOpen(false)}>×</button>
                        </div>
                        <form className="add-book-form" onSubmit={handleAddBookSubmit}>
                            <div className="form-group">
                                <label>Tipo de Operación</label>
                                <div className="radio-group">
                                    <label className="radio-label">
                                        <input type="radio" value="VENTA" checked={newBookType === "VENTA"} onChange={(e) => setNewBookType(e.target.value)} />
                                        Para Vender
                                    </label>
                                    <label className="radio-label">
                                        <input type="radio" value="ALQUILER" checked={newBookType === "ALQUILER"} onChange={(e) => setNewBookType(e.target.value)} />
                                        Para Alquilar
                                    </label>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Título del libro</label>
                                <input type="text" placeholder="Ej: Cien años de soledad" value={newBookTitle} onChange={(e) => setNewBookTitle(e.target.value)} required />
                            </div>

                            <div className="form-group">
                                <label>Datos de identificación</label>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.8rem' }}>ISBN</label>
                                        <input type="text" placeholder="Ej: 978-3-16-148410-0" value={newBookIsbn} onChange={(e) => setNewBookIsbn(e.target.value)} required />
                                    </div>
                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <label style={{ fontSize: '0.8rem' }}>Autor</label>
                                        <input type="text" placeholder="Ej: Gabriel García Márquez" value={newBookAuthor} onChange={(e) => setNewBookAuthor(e.target.value)} required />
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Estado del libro</label>
                                <select value={newBookState} onChange={(e) => setNewBookState(e.target.value)}>
                                    <option value="nuevo">Nuevo</option>
                                    <option value="como_nuevo">Como nuevo</option>
                                    <option value="buen_estado">Buen estado</option>
                                    <option value="usado">Usado con marcas</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Precio (€)</label>
                                <input type="number" step="0.01" min="0" placeholder="Ej: 15.50" value={newBookPrice} onChange={(e) => setNewBookPrice(e.target.value)} required />
                            </div>

                            <button type="submit" className="submit-btn" disabled={!newBookTitle || !newBookIsbn || !newBookPrice}>Subir Libro</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Home;