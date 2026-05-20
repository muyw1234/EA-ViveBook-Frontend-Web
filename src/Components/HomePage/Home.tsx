import React, { useState, useEffect } from "react";
import "./Home.css";
import UsuarioService from "../Services/Usuario";
import LibroService from "../Services/Libro";
import { useNavigate } from "react-router-dom";
import type { IPost } from "../Services/Post";
import PostService from "../Services/Post";
import EventoService from "../Services/Evento";

import AccessibilityMenu from "../Accessibility/AccessibilityMenu";
import { useTranslation } from "react-i18next";
import Login from "../InitialPage/Login";

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Icono para el Usuario (Azul)
const UserIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Icono para los Eventos (Rojo)
const EventIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const RecenterMap = ({ coords }: { coords: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(coords, 14);
    }, [coords, map]);
    return null;
};

const MapClickHandler = ({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) => {
    const map = useMap();
    useEffect(() => {
        const handleLayoutClick = (e: L.LeafletMouseEvent) => {
            onMapClick(e.latlng.lat, e.latlng.lng);
        };
        
        map.on('click', handleLayoutClick);
        return () => {
            map.off('click', handleLayoutClick);
        };
    }, [map, onMapClick]);
    
    return null;
};

const Home: React.FC = () => {
  
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{ _id?: string; name: string } | null>(null);  
  const [books, setBooks] = useState<any[]>([]);
  const [posts, setPosts] = useState<Partial<IPost>[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const latestBooks = [...books].reverse();

  // Form state corresponding to book fields 
  const [newBookType, setNewBookType] = useState("VENTA");
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookIsbn, setNewBookIsbn] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");
  const [newBookState, setNewBookState] = useState("nuevo");
  const [newBookPrice, setNewBookPrice] = useState("");
  const [onlyISBN, setOnlyISBN] = useState<boolean>(false);

  // Form state corresponding to event fields
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDescription, setNewEventDescription] = useState("");
  const [newEventDate, setNewEventDate]= useState("");
  const [newEventLocation, setNewEventLocation] = useState<[number, number] | null>(null);
  const [newEventDireccionExacta, setNewEventDireccionExacta] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation([latitude, longitude]);
            },
            () => {
                console.log("Acceso a ubicación denegado. Usando Barcelona por defecto.");
                setUserLocation([41.3851, 2.1734]); 
            }
        );
    }
    const fetchData = async () => {
      try {
        const userData = await UsuarioService.getProfile();
        setUser(userData);

        PostService.readAllPosts(setPosts);
        const booksData = await LibroService.getAllLibros();
        const processedBooks = booksData.map((b: any, index: number) => ({
          ...b,
          type: b.type || (index % 2 === 0 ? "VENTA" : "ALQUILER"),
        }));
        setBooks(processedBooks);

        const eventosData = await EventoService.getAllEventos();
        setEventos(eventosData);
      } catch (error) {
        console.error("Error fetching data:", error);
        if ((error as any).response?.type === 401) {
          navigate("/");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const bookData = {
            isbn: newBookIsbn,
            title: newBookTitle,
            authors: [newBookAuthor], 
            type: newBookType,        
            precio: Number(newBookPrice), 
            estado: newBookState      
        };

        const newBookResponse = await LibroService.addLibroListing(bookData);

        const addedBook = newBookResponse && newBookResponse._id
            ? {
                ...newBookResponse,
                type: newBookType,
                price: newBookPrice,
                authors: [newBookAuthor],
              }
            : {
                _id: Date.now().toString(),
                title: newBookTitle,
                authors: [newBookAuthor],
                price: newBookPrice,
                type: newBookType,
              };
              
        setBooks((prev) => [...prev, addedBook]);

        alert("Libro añadido con éxito");
        setIsAddBookModalOpen(false);

        setNewBookTitle("");
        setNewBookIsbn("");
        setNewBookAuthor("");
        setNewBookPrice("");
    } catch (error) {
        console.error("Error submitting book:", error);
        alert("Error al añadir el libro. Revisa la consola del navegador y del backend.");
    }
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user._id) {
        alert("Debes estar autenticado para crear un evento.");
        return;
    }

    if (!newEventLocation) {
        alert("Por favor, selecciona una ubicación haciendo clic en el mapa.");
        return;
    }

    try {
        const eventData = {
          title: newEventTitle,
          description: newEventDescription,
          creator: user._id,
          eventDate: new Date(newEventDate),
          createdDate: new Date(),
          location: {
            type: "Point" as const, 
            coordinates: [newEventLocation[1], newEventLocation[0]] as [number, number],
          },
          direccionExacta: newEventDireccionExacta
        };

        const newEventResponse = await EventoService.createEvento(eventData);
        
        setEventos((prev) => [...prev, newEventResponse || { ...eventData, _id: Date.now().toString() }]);

        alert("¡Evento creado con éxito!");
        setIsAddEventModalOpen(false);

        setNewEventTitle("");
        setNewEventDescription("");
        setNewEventDate("");
        setNewEventDireccionExacta("");
        setNewEventLocation(null); 
    } catch (error) {
        console.error("Error submitting event:", error);
        alert("Error al añadir el evento.");
    }
  };

  const alquilerBooks = latestBooks.filter((b) => b.type === "ALQUILER").slice(0, 5);
  const ventaBooks = latestBooks.filter((b) => b.type === "VENTA").slice(0, 5);

  const openBookDetail = (bookId?: string) => {
    if (bookId) {
      navigate(`/libros/${bookId}`);
    }
  };

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
            <button
              className="add-book-btn"
              onClick={() => setIsAddBookModalOpen(true)}
            >
              + Añadir Libro
            </button>
            {user ? (
              <div className="user-profile-badge">
                <span className="username-display">{user.name}</span>
                <div className="user-avatar-placeholder"></div>
              </div>
            ) : (
              <button onClick={() => navigate("/")} className="login-btn">
                {t("login_btn")}
              </button>
            )}
          </div>
        </div>
        <div className="search-bar-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-bar"
            placeholder={t("search_placeholder")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </header>

      {/* Hero Banner */}
      <section className="hero-banner">
        <h1>
          {t("hero_title_line1")} <br /> {t("hero_title_line2")}
        </h1>
        <p>{t("hero_subtitle")}</p>
      </section>
      
      {/* Aqui estan los posts */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t("section_posts")}</h2>
          <a href="#" className="see-all">
            {t("see_all")}
          </a>
        </div>
        <div className="card-grid">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={`Post: ${post._id}`} className="book-card">
                <div className="card-image-placeholder">
                  📚 <br /> [Imagen]
                </div>
                <div className="card-info">
                  <span>
                    <span className="card-title" title={post.description}>
                      {post.description}
                    </span>
                    <span className="card-meta">
                      {post.status}
                    </span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data-msg">
              {t("no_rentals_available")}
            </p>
          )}
        </div>
      </section>

      {/* Books Section - Alquiler */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t("section_rentals")}</h2>
          <button className="see-all" 
            onClick={() => navigate("/categorias/rentals")} 
            style={{ background: "none", border: "none", color: "inherit", 
            font: "inherit", cursor: "pointer", textDecoration: "underline" }} 
            >
             {t("see_all")} 
          </button>
        </div>
        <div className="card-grid home-limit">
          {alquilerBooks.length > 0 ? (
            alquilerBooks.map((book) => (
              <div
                key={`alquiler-${book._id}`}
                className="book-card"
                role="button"
                tabIndex={0}
                onClick={() => openBookDetail(book._id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    openBookDetail(book._id);
                  }
                }}
              >
                <div className="card-image-placeholder">
                  📚 <br /> [Imagen]
                </div>
                <div className="card-info">
                  <span className="card-price">
                    {book.price ? `${book.price} €` : t("consult_price")}
                  </span>
                  <span className="card-title" title={book.title}>
                    {book.title}
                  </span>
                  <span className="card-meta">
                    {book.authors?.join(", ") || t("unknown_author")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data-msg">
              {t("no_rentals_available")}
            </p>
          )}
        </div>
      </section>

      {/* Books Section - Venta */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t("section_sales")}</h2>
          <button className="see-all" 
            onClick={() => navigate("/categorias/sales")} 
            style={{ background: "none", border: "none", color: "inherit", 
            font: "inherit", cursor: "pointer", textDecoration: "underline" }} 
          > 
            {t("see_all")} 
          </button>
        </div>
        <div className="card-grid home-limit">
          {ventaBooks.length > 0 ? (
            ventaBooks.map((book) => (
              <div
                key={`venta-${book._id}`}
                className="book-card"
                role="button"
                tabIndex={0}
                onClick={() => openBookDetail(book._id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    openBookDetail(book._id);
                  }
                }}
              >
                <div className="card-image-placeholder">
                  📚 <br /> [Imagen]
                </div>
                <div className="card-info">
                  <span className="card-price">
                    {book.price ? `${book.price} €` : t("consult_price")}
                  </span>
                  <span className="card-title" title={book.title}>
                    {book.title}
                  </span>
                  <span className="card-meta">
                    {book.authors?.join(", ") || t("unknown_author")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data-msg">
              {t("no_sales_available")}
            </p>
          )}
        </div>
      </section>

      {/* Sección del Mapa */}
      <section className="content-section">
        <h2 className="section-title">Eventos cerca de ti</h2>
        <div style={{ height: "450px", width: "100%", borderRadius: "15px", overflow: "hidden" }}>
          {userLocation && (
          <MapContainer center={userLocation} zoom={13} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      
            {/* MARCADO DE USUARIO*/}
            <Marker position={userLocation} icon={UserIcon}>
              <Popup>Estás aquí</Popup>
            </Marker>

            {/* USA EventIcon (Rojo) */}
            {eventos.map((evt) => (
              <Marker 
                key={evt._id} 
                position={[evt.location.coordinates[1], evt.location.coordinates[0]]}
                icon={EventIcon} 
                >
                <Popup>
                  <strong>{evt.title}</strong><br/>
                    {evt.direccionExacta}
                </Popup>
              </Marker>
            ))}

            <RecenterMap coords={userLocation} />
              </MapContainer>
          )}
        </div>
      </section>

      {/* Events Section */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t("section_events")}</h2> 
          <button
              className="add-book-btn"
              onClick={() => setIsAddEventModalOpen(true)}
            >
              + Añadir Evento
            </button>
          <button className="see-all" 
            onClick={() => navigate("/categorias/events")} 
            style={{ background: "none", border: "none", color: "inherit", 
                    font: "inherit", cursor: "pointer", textDecoration: "underline" }} 
          > 
            {t("see_all")} 
          </button>
        </div>
        <div className="events-grid">
          {eventos.map((event) => (
            <div
                key={event._id} 
                className="event-card"
                onClick={() => navigate(`/eventos/${event._id}`)}
                style={{ cursor: "pointer" }}
              >
              <div className="event-date">
                <span className="day">{event.date ? new Date(event.date).getDate() : "---"}</span>
                <span className="month">
                  {event.date ? new Date(event.date).toLocaleString('default', { month: 'short' }) : "---"}
                </span>
              </div>
              <div className="event-details">
                <span className="event-title">{event.title}</span>
                <span className="event-location">📍 {event.direccionExacta}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Book Modal */}
      {isAddBookModalOpen && (
        <div
          className="modal-overlay"
          onClick={() => setIsAddBookModalOpen(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("modal_add_title")}</h2>
              <button
                className="close-btn"
                onClick={() => setIsAddBookModalOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                value=""
                id="flexCheckDefault"
                onChange={(e) => setOnlyISBN(e.target.checked)}
              />
              <label className="form-check-label">{t("use_open_library")}</label>
            </div>
            {onlyISBN ? (
              <div className="add-book-form">
                <div className="form-group">
                  <label>{t("label_operation_type")}</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="VENTA"
                        checked={newBookType === "VENTA"}
                        onChange={(e) => setNewBookType(e.target.value)}
                      />
                      {t("for_sale")}
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="ALQUILER"
                        checked={newBookType === "ALQUILER"}
                        onChange={(e) => setNewBookType(e.target.value)}
                      />
                      {t("for_rent")}
                    </label>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t("label_id_data")}</label>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <label style={{ fontSize: "0.8rem" }}>ISBN</label>
                      <input
                        type="text"
                        placeholder="Ej: 978-3-16-148410-0"
                        value={newBookIsbn}
                        onChange={(e) => setNewBookIsbn(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t("label_book_state")}</label>
                  <select
                    value={newBookState}
                    onChange={(e) => setNewBookState(e.target.value)}
                  >
                    <option value="nuevo">{t("state_new")}</option>
                    <option value="como_nuevo">{t("state_like_new")}</option>
                    <option value="buen_estado">{t("state_good")}</option>
                    <option value="usado">{t("state_used")}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t("label_price")}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 15.50"
                    value={newBookPrice}
                    onChange={(e) => setNewBookPrice(e.target.value)}
                    required
                  />
                </div>

                <button
                  className="submit-btn"
                  disabled={!newBookIsbn || !newBookPrice}
                  onClick={async () => {
                    setOnlyISBN(false);
                    const data = await LibroService.addLibroByIsbn(newBookIsbn);
                    setIsAddBookModalOpen(false);
                  }}
                >
                  {t("submit_book_btn")}
                </button>
              </div>
            ) : (
              <form className="add-book-form" onSubmit={handleAddBookSubmit}>
                <div className="form-group">
                  <label>{t("label_operation_type")}</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="VENTA"
                        checked={newBookType === "VENTA"}
                        onChange={(e) => setNewBookType(e.target.value)}
                      />
                      {t("for_sale")}
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="ALQUILER"
                        checked={newBookType === "ALQUILER"}
                        onChange={(e) => setNewBookType(e.target.value)}
                      />
                      {t("for_rent")}
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t("label_book_title")}</label>
                  <input
                    type="text"
                    placeholder="Ej: Cien años de soledad"
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t("label_id_data")}</label>
                  <div style={{ display: "flex", gap: "1rem" }}>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <label style={{ fontSize: "0.8rem" }}>{t("label_isbn")}</label>
                      <input
                        type="text"
                        placeholder="Ej: 978-3-16-148410-0"
                        value={newBookIsbn}
                        onChange={(e) => setNewBookIsbn(e.target.value)}
                        required
                      />
                    </div>
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.5rem",
                      }}
                    >
                      <label style={{ fontSize: "0.8rem" }}>{t("label_author")}</label>
                      <input
                        type="text"
                        placeholder="Ej: Gabriel García Márquez"
                        value={newBookAuthor}
                        onChange={(e) => setNewBookAuthor(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Estado del libro</label>
                  <select
                    value={newBookState}
                    onChange={(e) => setNewBookState(e.target.value)}
                  >
                    <option value="nuevo">{t("state_new")}</option>
                    <option value="como_nuevo">{t("state_like_new")}</option>
                    <option value="buen_estado">{t("state_good")}</option>
                    <option value="usado">{t("state_used")}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t("label_price")}</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="Ej: 15.50"
                    value={newBookPrice}
                    onChange={(e) => setNewBookPrice(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="submit-btn"
                  disabled={!newBookTitle || !newBookIsbn || !newBookPrice}
                >
                  Subir Libro
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddEventModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddEventModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h2>Crear Nuevo Evento</h2>
              <button className="close-btn" onClick={() => setIsAddEventModalOpen(false)}>×</button>
            </div>
            
            <form className="add-book-form" onSubmit={handleAddEventSubmit}>
              <div className="form-group">
                <label>Título del Evento</label>
                <input type="text" placeholder="Ej: Club de lectura" value={newEventTitle} onChange={(e) => setNewEventTitle(e.target.value)} required />
              </div>
              
              <div className="form-group">
                <label>Descripción</label>
                <textarea className="auth-input" style={{ width: '100%', minHeight: '60px', padding: '10px', borderRadius: '5px' }} placeholder="¿De qué trata el evento?" value={newEventDescription} onChange={(e) => setNewEventDescription(e.target.value)} required />
              </div>
              
              <div className="form-group">
                <label>Fecha del Evento</label>
                <input type="datetime-local" value={newEventDate} onChange={(e) => setNewEventDate(e.target.value)} required />
              </div>
              
              <div className="form-group">
                <label>Dirección Exacta (Texto)</label>
                <input type="text" placeholder="Ej: Calle Gran Vía, 24, Planta 2" value={newEventDireccionExacta} onChange={(e) => setNewEventDireccionExacta(e.target.value)} required />
              </div>

              {/* SECCIÓN DEL MAPA INTERACTIVO DENTRO DEL MODAL */}
              <div className="form-group">
                <label style={{ display: 'block', marginBottom: '5px' }}>
                  Ubicación en el Mapa <span style={{ color: '#e74c3c', fontSize: '0.85rem' }}>(Haz clic en el lugar exacto)</span>
                </label>
                <div style={{ height: "250px", width: "100%", borderRadius: "8px", overflow: "hidden", border: "1px solid #ccc" }}>
                  <MapContainer 
                    center={newEventLocation || userLocation || [41.3851, 2.1734]} 
                    zoom={14} 
                    style={{ height: "100%", width: "100%" }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    
                    {newEventLocation && (
                      <Marker position={newEventLocation} icon={EventIcon}>
                        <Popup>El evento será aquí</Popup>
                      </Marker>
                    )}

                    <MapClickHandler onMapClick={(lat, lng) => {
                      setNewEventLocation([lat, lng]);
                    }} />
                  </MapContainer>
                </div>
                {newEventLocation && (
                  <p style={{ fontSize: '0.8rem', color: '#2ecc71', marginTop: '5px' }}>
                    📍 Coordenadas seleccionadas: {newEventLocation[0].toFixed(5)}, {newEventLocation[1].toFixed(5)}
                  </p>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={!newEventLocation}>
                {!newEventLocation ? "Selecciona ubicación en el mapa" : "Publicar Evento"}
              </button>
            </form>
          </div>
        </div>
      )}
      <AccessibilityMenu />
    </div>
  );
};

export default Home;