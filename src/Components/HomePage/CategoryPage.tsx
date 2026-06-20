import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LibroService from '../Services/Libro';
import EventService from '../Services/Evento';
import { useTranslation } from 'react-i18next';
import './Home.css';

const CategoryPage: React.FC = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'expired'>('upcoming');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(6);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [excludeOwnBooks, setExcludeOwnBooks] = useState(false);

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
  }, [type, timeFilter, excludeOwnBooks]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (type === 'rentals' || type === 'sales') {
          const backendType = type === 'rentals' ? 'ALQUILER' : 'VENTA';
          const response = await LibroService.getAllLibros(
            currentPage,
            limit,
            backendType,
            excludeOwnBooks,
          );
          setItems(response);
          setHasMore(response.length === limit);
        } else if (type === 'events') {
          const response = await EventService.getAllEventos(currentPage, limit, timeFilter);
          const dataArray = response.data ? response.data : response;
          setItems(dataArray);
          setHasMore(dataArray.length === limit);
        }
      } catch (error) {
        console.error('Error al cargar los datos paginados:', error);
        setItems([]);
        setHasMore(false);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type, currentPage, limit, timeFilter, excludeOwnBooks]);

  const handleNextPage = () => {
    if (hasMore) setCurrentPage((prev) => prev + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const buttonStyle = (isDisabled: boolean): React.CSSProperties => ({
    opacity: isDisabled ? 0.5 : 1,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    pointerEvents: isDisabled ? 'none' : 'auto',
  });

  const isBookCategory = type === 'rentals' || type === 'sales';

  if (loading) {
    return <div className="home-container">{t('category_page.loading')}</div>;
  }

  return (
    <div className="home-container">
      <h1 style={{ marginBottom: '2rem' }}>
        {type === 'rentals' && t('category_page.title_rentals')}
        {type === 'sales' && t('category_page.title_sales')}
        {type === 'events' && t('category_page.title_events')}
        {type === 'posts' && t('category_page.title_posts')}
      </h1>

      {isBookCategory && (
        <div className="category-controls">
          <div className="category-switcher" aria-label="Cambiar categoria de libros">
            <button
              type="button"
              className={`category-switch-btn ${type === 'sales' ? 'active' : ''}`}
              onClick={() => navigate('/categorias/sales')}
            >
              {t('category_page.title_sales')}
            </button>
            <button
              type="button"
              className={`category-switch-btn ${type === 'rentals' ? 'active' : ''}`}
              onClick={() => navigate('/categorias/rentals')}
            >
              {t('category_page.title_rentals')}
            </button>
          </div>

          <label className="exclude-own-filter">
            <input
              type="checkbox"
              checked={excludeOwnBooks}
              onChange={(event) => setExcludeOwnBooks(event.target.checked)}
            />
            <span>{t('category_page.exclude_own_books')}</span>
          </label>
        </div>
      )}

      {/* --- SELECTOR DE EVENTOS PRÓXIMOS / EXPIRADOS --- */}
      {type === 'events' && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setTimeFilter('upcoming')}
            className="add-book-btn"
            style={{ backgroundColor: timeFilter === 'upcoming' ? '#007bff' : '#ccc' }}
          >
            {t('category_page.filter_upcoming')}
          </button>
          <button
            onClick={() => setTimeFilter('expired')}
            className="add-book-btn"
            style={{ backgroundColor: timeFilter === 'expired' ? '#007bff' : '#ccc' }}
          >
            {t('category_page.filter_expired')}
          </button>
        </div>
      )}

      {/* CONTROL DINÁMICO DE DISEÑO */}
      {items.length > 0 ? (
        <>
          {type === 'events' ? (
            /* --- DISEÑO PARA EVENTOS --- */
            <div className="events-grid">
              {items.map((event: any) => (
                <div
                  key={event._id}
                  className="event-card"
                  onClick={() => navigate(`/eventos/${event._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="event-date">
                    <span className="day">
                      {event.eventDate || event.date
                        ? new Date(event.eventDate || event.date).getDate()
                        : '---'}
                    </span>
                    <span className="month">
                      {event.eventDate || event.date
                        ? new Date(event.eventDate || event.date).toLocaleString(i18n.language, {
                            month: 'short',
                          })
                        : '---'}
                    </span>
                  </div>
                  <div className="event-details">
                    <span className="event-title">{event.title}</span>
                    <span className="event-location">📍 {event.direccionExacta}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* --- DISEÑO PARA LIBROS --- */
            <div className="card-grid">
              {items.map((item: any) => (
                <div
                  key={item._id}
                  className="book-card"
                  onClick={() => navigate(`/libros/${item._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={`category-book-image ${item.imageUrl ? 'has-image' : ''}`}>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.title || 'Portada del libro'} />
                    ) : (
                      <span>Sin imagen</span>
                    )}
                  </div>
                  <div className="card-info">
                    <span className="card-title">{item.title || item.description}</span>

                    {item.precio && <span className="card-price">{item.precio} €</span>}

                    {item.estado && <span className="card-meta">{item.estado}</span>}

                    {item.authors && (
                      <span className="card-meta">
                        {item.authors.map((auth: any) => auth.fullName || auth).join(', ')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* --- CONTROLES DE PAGINACIÓN ADAPTADOS --- */}
          <div
            className="pagination-controls"
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '3rem',
              gap: '1.5rem',
            }}
          >
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="add-book-btn"
              style={buttonStyle(currentPage === 1)}
            >
              {t('category_page.btn_prev')}
            </button>

            <button
              onClick={handleNextPage}
              disabled={!hasMore}
              className="add-book-btn"
              style={buttonStyle(!hasMore)}
            >
              {t('category_page.btn_next')}
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p className="no-data-msg">
            {type === 'events' ? t('category_page.no_events') : t('category_page.no_books')}
          </p>
          {currentPage > 1 && (
            <button
              onClick={handlePrevPage}
              className="add-book-btn"
              style={{ marginTop: '1.5rem' }}
            >
              {t('category_page.btn_back_prev')}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
