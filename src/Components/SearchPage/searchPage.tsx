import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LibroService from '../Services/Libro';
import UsuarioService from '../Services/Usuario';
import ImageFrame from '../HomePage/ImageFrame';
import type ILibro from '../../Models/Libro';
import './searchPage.css';

// Las claves se mantienen estáticas para la lógica, la traducción ocurre en el renderizado
const CATEGORY_KEYS = [
  'Todas',
  'Terror',
  'Misterio',
  'Aventura',
  'Juvenil',
  'Policíaco',
  'Infantil',
  'Autoayuda',
  'Novela',
  'Biografías',
  'Cómics',
  'Otros',
];

export default function SearchPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  // Get initial search query from routing state
  const initialTerm = (location.state?.term as string) || '';

  // Component States
  const [searchQuery, setSearchQuery] = useState(initialTerm);
  const [bookResults, setBookResults] = useState<ILibro[]>([]);
  const [userResults, setUserResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Filters State
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMaxPrice, setFilterMaxPrice] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showFilters, setShowFilters] = useState(location.state?.openFilters || false);

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

        if (booksRes.status === 'fulfilled') {
          setBookResults(booksRes.value);
        } else {
          console.error('Error searching books:', booksRes.reason);
          setBookResults([]);
          toast.error(t('search.errors.books'));
        }

        if (usersRes.status === 'fulfilled') {
          const resData = usersRes.value.data;
          const usersArray = Array.isArray(resData)
            ? resData
            : Array.isArray(resData?.data)
              ? resData.data
              : [];
          setUserResults(usersArray);
        } else {
          console.error('Error searching users:', usersRes.reason);
          setUserResults([]);
          const status = (usersRes.reason as any).response?.status;
          // De-escalate toast alert if guest/no-session user is hit with auth block, otherwise show error
          if (status !== 401 && status !== 403) {
            toast.error(t('search.errors.users'));
          }
        }
      } else {
        // If query is empty, load all books by default
        const allBooks = await LibroService.getAllLibros();
        setBookResults(allBooks || []);
        setUserResults([]);
      }
    } catch (error) {
      console.error('Error during search operation:', error);
      toast.error(t('search.errors.general'));
    } finally {
      setLoading(false);
    }
  };

  // Run search on mount and when initial term changes
  useEffect(() => {
    performSearch(initialTerm);
    document.title = `${t('search.title')} - ViveBook`;
    if (location.state?.openFilters) {
      setShowFilters(true);
    }
  }, [initialTerm, location.state, t]);

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
    const price = book.precio;
    if (filterMaxPrice && !isNaN(parseFloat(filterMaxPrice))) {
      if (price === undefined || price > parseFloat(filterMaxPrice)) {
        return false;
      }
    }
    return true;
  });

  const handleClearFilters = () => {
    setFilterCategory('');
    setFilterMaxPrice('');
    setFilterType('');
  };

  const handleUserClick = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/libros/${bookId}`);
  };

  return (
    <div className="search-page-container">
      <h1 className="search-page-title">{t('search.title')}</h1>

      {/* Search and Filters Controls */}
      <div className="search-controls-wrapper">
        <form onSubmit={handleSearchSubmit} className="search-input-row">
          <div className="search-field-container">
            <span className="search-field-icon">🔍</span>
            <input
              type="text"
              className="search-input-field"
              placeholder={t('search.placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="search-filter-btn-container">
              <div className="search-field-divider"></div>
              <button
                type="button"
                className={`search-filter-toggle-btn ${showFilters ? 'active' : ''}`}
                onClick={() => setShowFilters(!showFilters)}
                title={t('search.filters_title')}
              >
                ⚙️
              </button>
            </div>
          </div>
          <button type="submit" className="search-action-btn">
            {t('search.button')}
          </button>
        </form>

        {/* Collapsible Filters Panel */}
        {showFilters && (
          <div className="filter-panel">
            {/* Category Filter */}
            <div className="filter-section">
              <span className="filter-label">{t('search.category')}:</span>
              <div className="category-chips-grid">
                {CATEGORY_KEYS.map((catKey) => {
                  const isSelected = filterCategory === (catKey === 'Todas' ? '' : catKey);
                  return (
                    <button
                      key={catKey}
                      type="button"
                      className={`filter-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => setFilterCategory(catKey === 'Todas' ? '' : catKey)}
                    >
                      {t(`search.categories.${catKey}`)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price and Type Filters Row */}
            <div className="filter-bottom-row">
              <div className="filter-input-group">
                <span className="filter-label">{t('search.max_price')} (€):</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="filter-numeric-input"
                  placeholder={t('search.max_price_placeholder')}
                  value={filterMaxPrice}
                  onChange={(e) => setFilterMaxPrice(e.target.value)}
                />
              </div>

              <div className="filter-input-group">
                <span className="filter-label">{t('search.type')}:</span>
                <div className="type-buttons-group">
                  {[
                    { value: '', label: t('search.types.all') },
                    { value: 'VENTA', label: t('search.types.sale') },
                    { value: 'ALQUILER', label: t('search.types.rent') },
                  ].map((item) => {
                    const isSelected = filterType === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        className={`type-filter-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => setFilterType(item.value)}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button type="button" className="clear-filters-btn" onClick={handleClearFilters}>
                {t('search.clear_filters')}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Container */}
      {loading ? (
        <div className="search-loading-container">
          <div className="search-spinner"></div>
          <p>{t('search.searching')}</p>
        </div>
      ) : (
        <div className="search-results-content">
          {/* 1. Users Results Section */}
          {userResults.length > 0 && (
            <div className="results-section">
              <div className="results-section-header">
                <h2 className="results-section-title">{t('search.users_section')}</h2>
              </div>
              <div className="users-list-grid">
                {userResults.map((user) => (
                  <div
                    key={user._id}
                    className="search-user-card"
                    onClick={() => handleUserClick(user._id)}
                  >
                    <div className="search-user-avatar">
                      {(user.name || 'U').substring(0, 2).toUpperCase()}
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
              <h2 className="results-section-title">{t('search.books_section')}</h2>
            </div>
            {filteredBooks.length > 0 ? (
              <div className="books-list-grid">
                {filteredBooks.map((book) => {
                  const bookPrice = book.precio;
                  return (
                    <div
                      key={book._id}
                      className="book-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => handleBookClick(book._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
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
                            : t('search.consult_price')}
                        </span>
                        <span className="card-title" title={book.title}>
                          {book.title}
                        </span>
                        <span className="card-meta">
                          {book.authors?.join(', ') || t('search.unknown_author')}
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
                    ? t('search.no_books_found_filters')
                    : t('search.search_no_results')}
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
