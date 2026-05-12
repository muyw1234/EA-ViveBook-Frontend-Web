import React, { useState, useEffect } from "react";
import "./Home.css";
import UsuarioService from "../Services/Usuario";
import LibroService from "../Services/Libro";
import { useNavigate } from "react-router-dom";
import type { IPost } from "../Services/Post";
import PostService from "../Services/Post";

import AccessibilityMenu from "../Accessibility/AccessibilityMenu";
import { useTranslation } from "react-i18next";
import Login from "../InitialPage/Login";

const Home: React.FC = () => {
  
  const { t } = useTranslation();

  const [searchQuery, setSearchQuery] = useState("");
  const [user, setUser] = useState<{ name: string } | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [posts, setPosts] = useState<Partial<IPost>[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);

  // Form state corresponding to fields
  const [newBookType, setNewBookType] = useState("VENTA");
  const [newBookTitle, setNewBookTitle] = useState("");
  const [newBookIsbn, setNewBookIsbn] = useState("");
  const [newBookAuthor, setNewBookAuthor] = useState("");
  const [newBookState, setNewBookState] = useState("nuevo");
  const [newBookPrice, setNewBookPrice] = useState("");
  const [onlyISBN, setOnlyISBN] = useState<boolean>(false);

  const navigate = useNavigate();

  // Inicializacion?
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch User Profile
        const userData = await UsuarioService.getProfile();
        setUser(userData);

        // Fetch Books from DB
        PostService.readAllPosts(setPosts);
        const booksData = await LibroService.getAllLibros();
        const processedBooks = booksData.map((b: any, index: number) => ({
          ...b,
          status: b.status || (index % 2 === 0 ? "VENTA" : "ALQUILER"),
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
    {
      id: 1,
      title: "Firma de Libros: Elvira Sastre",
      location: "Librería Central",
      date: "15 Oct",
    },
    {
      id: 2,
      title: "Club de Lectura Sci-Fi",
      location: "La madriguera",
      date: "20 Oct",
    },
    {
      id: 3,
      title: "Taller de Escritura Creativa",
      location: "Ateneo",
      date: "12 Nov",
    },
  ];

  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        // Creamos el objeto con la estructura que pide el nuevo servicio y Joi
        const bookData = {
            isbn: newBookIsbn,
            title: newBookTitle,
            authors: [newBookAuthor], // Metemos el string en un array porque Joi espera Joi.array()
            type: newBookType,        // 'VENTA' o 'ALQUILER'
            precio: Number(newBookPrice), // Aseguramos que viaje como número, no como string
            estado: newBookState      // El estado seleccionado en el select
        };

        // Llamamos al servicio pasándole el objeto. ¡TypeScript ya no se quejará!
        const newBookResponse = await LibroService.addLibroListing(bookData);

        // Lógica para actualizar tu estado local de React
        const addedBook = newBookResponse && newBookResponse._id
            ? {
                ...newBookResponse,
                status: newBookType,
                price: newBookPrice,
                authors: [newBookAuthor],
              }
            : {
                _id: Date.now().toString(),
                title: newBookTitle,
                authors: [newBookAuthor],
                price: newBookPrice,
                status: newBookType,
              };
              
        setBooks((prev) => [...prev, addedBook]);

        alert("Libro añadido con éxito");
        setIsAddBookModalOpen(false);

        // Limpiar formulario
        setNewBookTitle("");
        setNewBookIsbn("");
        setNewBookAuthor("");
        setNewBookPrice("");
    } catch (error) {
        console.error("Error submitting book:", error);
        alert("Error al añadir el libro. Revisa la consola del navegador y del backend.");
    }
};

  const alquilerBooks = books.filter((b) => b.status === "ALQUILER");
  const ventaBooks = books.filter((b) => b.status === "VENTA");

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
                    {/* <span className="card-price">
                      {post.price ? `${post.price} €` : "Consultar precio"}
                    </span> */}
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
          <a href="#" className="see-all">
            {t("see_all")}
          </a>
        </div>
        <div className="card-grid">
          {alquilerBooks.length > 0 ? (
            alquilerBooks.map((book) => (
              <div key={`alquiler-${book._id}`} className="book-card">
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
          <a href="#" className="see-all">
            {t("see_all")}
          </a>
        </div>
        <div className="card-grid">
          {ventaBooks.length > 0 ? (
            ventaBooks.map((book) => (
              <div key={`venta-${book._id}`} className="book-card">
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

      {/* Events Section */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t("section_events")}</h2>
          <a href="#" className="see-all">
            {t("see_all")}
          </a>
        </div>
        <div className="events-grid">
          {mockEvents.map((event) => (
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
                    //console.log(`Libro agregado: ${JSON.stringify(data)}`);
                    if (data) {
                      // toast(`Libro agregado: ${JSON.stringify(data)}`);
                    } else {
                      // toast.error(`Error happened!`);
                    }
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
      <AccessibilityMenu />
    </div>
  );
};

export default Home;
