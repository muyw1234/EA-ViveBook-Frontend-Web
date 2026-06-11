import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LibroService from "../Services/Libro";
import UsuarioService from "../Services/Usuario";
import ImageFrame from "../HomePage/ImageFrame";
import "./searchPage.css";

const ALL_CATEGORIES = [
  "Todas",
  "Terror",
  "Misterio",
  "Aventura",
  "Juvenil",
  "Policíaco",
  "Infantil",
  "Autoayuda",
  "Novela",
  "Biografías",
  "Cómics",
  "Otros",
];

export default function SearchPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial search query from routing state
  const initialTerm = (location.state?.term as string) || "";

  // Component States
  const [searchQuery, setSearchQuery] = useState(initialTerm);
  const [bookResults, setBookResults] = useState<any[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [filterType, setFilterType] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // Search execution
  const performSearch = async (query: string) => {
    setLoading(true);
    try {
      const term = query.trim();
      if (term) {
        // Query both endpoints in parallel using Promise.allSettled for robustness
        const [booksRes, usersRes] = await Promise.allSettled([
          LibroService.searchLibro(term),
          UsuarioService.searchUsuarios(term),
        ]);

        if (booksRes.status === "fulfilled") {
          const resData = booksRes.value.data;
          const booksArray = Array.isArray(resData)
            ? resData
            : Array.isArray(resData?.data)
            ? resData.data
            : [];
          setBookResults(booksArray);
        } else {
          console.error("Error searching books:", booksRes.reason);
          setBookResults([]);
          toast.error(t("search_books_error", "No se pudieron buscar los libros."));
        }

        if (usersRes.status === "fulfilled") {
          const resData = usersRes.value.data;
          const usersArray = Array.isArray(resData)
            ? resData
            : Array.isArray(resData?.data)
            ? resData.data
            : [];
          setUserResults(usersArray);
        } else {
          console.error("Error searching users:", usersRes.reason);
          setUserResults([]);
          const status = (usersRes.reason as any).response?.status;
          // De-escalate toast alert if guest/no-session user is hit with auth block, otherwise show error
          if (status !== 401 && status !== 403) {
            toast.error(t("search_users_error", "No se pudieron buscar los usuarios."));
          }
        }
      } else {
        // If query is empty, load all books by default
        const allBooks = await LibroService.getAllLibros();
        setBookResults(allBooks || []);
        setUserResults([]);
      }
    } catch (error) {
      console.error("Error during search operation:", error);
      toast.error(t("search_error", "Ocurrió un error al realizar la búsqueda."));
    } finally {
      setLoading(false);
    }
  };

  // Run search on mount and when initial term changes
  useEffect(() => {
    performSearch(initialTerm);
    document.title = `${t("search_title", "Buscador")} - ViveBook`;
  }, [initialTerm]);

  // Handle manual search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  // Client side filters application
  const filteredBooks = bookResults.filter((book) => {
    // Type Filter
    if (filterType && book.type !== filterType) {
      return false;
    }
    // Category Filter
    if (filterCategory && book.categoria !== filterCategory) {
      return false;
    }
    // Max Price Filter
    const price = book.precio !== undefined ? book.precio : book.price;
    if (filterMaxPrice && !isNaN(parseFloat(filterMaxPrice))) {
      if (price === undefined || parseFloat(price) > parseFloat(filterMaxPrice)) {
        return false;
      }
    }
    return true;
  });

  const handleClearFilters = () => {
    setFilterCategory("");
    setFilterMaxPrice("");
    setFilterType("");
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/libros/${bookId}`);
  };

  return (
    <div className="search-page-container">
      <h1 className="search-page-title">{t("search_title", "Buscador")}</h1>

      {/* Search and Filters Controls */}
      <div className="search-controls-wrapper">
        <form onSubmit={handleSearchSubmit} className="search-input-row">
          <div className="search-field-container">
            <span className="search-field-icon">🔍</span>
            <input
              type="text"
              className="search-input-field"
              placeholder={t("search_placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="search-action-btn">
            {t("search_button", "Buscar")}
          </button>
          <button
            type="button"
            className={`filter-toggle-btn ${showFilters ? "active" : ""}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            ⚙️ {t("filters", "Filtros")}
          </button>
        </form>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div className="filter-panel">
            {/* Category Filter */}
            <div className="filter-section">
              <span className="filter-label">{t("category", "Categoría")}:</span>
              <div className="category-chips-grid">
                {ALL_CATEGORIES.map((cat) => {
                  const isSelected = filterCategory === (cat === "Todas" ? "" : cat);
                  return (
                    <button
                      key={cat}
                      type="button"
                      className={`filter-chip ${isSelected ? "selected" : ""}`}
                      onClick={() => setFilterCategory(cat === "Todas" ? "" : cat)}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price and Type Filters Row */}
            <div className="filter-bottom-row">
              <div className="filter-input-group">
                <span className="filter-label">{t("max_price", "Precio Máximo")} (€):</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="filter-numeric-input"
                  placeholder={t("max_price_placeholder", "Ej: 20")}
                  value={filterMaxPrice}
                  onChange={(e) => setFilterMaxPrice(e.target.value)}
                />
              </div>

              <div className="filter-input-group">
                <span className="filter-label">{t("type", "Tipo")}:</span>
                <div className="type-buttons-group">
                  {[
                    { value: "", label: t("all_types", "Todos") },
                    { value: "VENTA", label: t("sale", "Venta") },
                    { value: "ALQUILER", label: t("rent", "Alquiler") },
                  ].map((item) => {
                    const isSelected = filterType === item.value;
                    return (
                      <button
                        key={item.label}
                        type="button"
                        className={`type-filter-btn ${isSelected ? "selected" : ""}`}
                        onClick={() => setFilterType(item.value)}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="button"
                className="clear-filters-btn"
                onClick={handleClearFilters}
              >
                {t("clear_filters", "Limpiar Filtros")}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Container */}
      {loading ? (
        <div className="search-loading-container">
          <div className="search-spinner"></div>
          <p>{t("searching", "Buscando resultados...")}</p>
        </div>
      ) : (
        <div className="search-results-content">
          {/* 1. Users Results Section */}
          {userResults.length > 0 && (
            <div className="results-section">
              <div className="results-section-header">
                <h2 className="results-section-title">
                  {t("users_section", "Usuarios")}
                </h2>
              </div>
              <div className="users-list-grid">
                {userResults.map((user) => (
                  <div
                    key={user._id}
                    className="search-user-card"
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div className="search-user-avatar">
                      {(user.name || "U").substring(0, 2).toUpperCase()}
                    </div>
                    <div className="search-user-info">
                      <p className="search-user-name">{user.name}</p>
                      <p className="search-user-email">{user.email}</p>
                    </div>
                    <span className="user-card-arrow">➔</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Books Results Section */}
          <div className="results-section">
            <div className="results-section-header">
              <h2 className="results-section-title">
                {t("books_section", "Libros")}
              </h2>
            </div>
            {filteredBooks.length > 0 ? (
              <div className="books-list-grid">
                {filteredBooks.map((book) => {
                  const bookPrice =
                    book.precio !== undefined ? book.precio : book.price;
                  return (
                    <div
                      key={book._id}
                      className="book-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleBookClick(book._id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          handleBookClick(book._id);
                        }
                      }}
                    >
                      <div className="card-image-placeholder modern-card-image">
                        <ImageFrame imageUrl={book.imageUrl} />
                      </div>
                      <div className="card-info">
                        <span className="card-price">
                          {bookPrice !== undefined && bookPrice !== null
                            ? `${bookPrice} €`
                            : t("consult_price")}
                        </span>
                        <span className="card-title" title={book.title}>
                          {book.title}
                        </span>
                        <span className="card-meta">
                          {book.authors?.join(", ") || t("unknown_author")}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="search-empty-state">
                <div className="search-empty-icon">📚</div>
                <p className="search-empty-text">
                  {bookResults.length > 0
                    ? t(
                        "no_books_found_filters",
                        "¡No hay ningún libro disponible con esos requisitos por el momento!"
                      )
                    : t(
                        "search_no_results",
                        "No se encontraron libros que coincidan con tu búsqueda."
                      )}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
