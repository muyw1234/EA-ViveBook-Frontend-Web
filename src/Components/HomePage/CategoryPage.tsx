import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import LibroService from '../Services/Libro';
import EventService from '../Services/Evento';
import { useTranslation } from 'react-i18next';
import './Home.css';

const CategoryPage: React.FC = () => {
  const { type } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [timeFilter, setTimeFilter] = useState<'upcoming' | 'expired'>('upcoming');

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [limit] = useState<number>(6);
  const [hasMore, setHasMore] = useState<boolean>(true);

  useEffect(() => {
    setCurrentPage(1);
    setHasMore(true);
  }, [type, timeFilter]); // Reiniciar página si cambia el tipo o el filtro de tiempo

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (type === 'rentals' || type === 'sales') {
          const backendType = type === 'rentals' ? 'ALQUILER' : 'VENTA';
          const response = await LibroService.getAllLibros(currentPage, limit, backendType);
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
  }, [type, currentPage, limit, timeFilter]);

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

  if (loading) {
    return <div className="home-container">Cargando...</div>;
  }

  return (
    <div className="home-container">
      <h1 style={{ marginBottom: '2rem' }}>
        {type === 'rentals' && 'Libros en alquiler'}
        {type === 'sales' && 'Libros en venta'}
        {type === 'events' && 'Eventos'}
        {type === 'posts' && 'Posts'}
      </h1>

      {/* --- SELECTOR DE EVENTOS PRÓXIMOS / EXPIRADOS --- */}
      {type === 'events' && (
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
          <button
            onClick={() => setTimeFilter('upcoming')}
            className="add-book-btn"
            style={{ backgroundColor: timeFilter === 'upcoming' ? '#007bff' : '#ccc' }}
          >
            Próximos
          </button>
          <button
            onClick={() => setTimeFilter('expired')}
            className="add-book-btn"
            style={{ backgroundColor: timeFilter === 'expired' ? '#007bff' : '#ccc' }}
          >
            Expirados
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
                        ? new Date(event.eventDate || event.date).toLocaleString('default', {
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
                  <div className="card-image-placeholder">📚</div>
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
              Anterior
            </button>

            <button
              onClick={handleNextPage}
              disabled={!hasMore}
              className="add-book-btn"
              style={buttonStyle(!hasMore)}
            >
              Siguiente
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p className="no-data-msg">
            {type === 'events' ? 'No hay eventos disponibles' : t('no_sales_available')}
          </p>
          {currentPage > 1 && (
            <button
              onClick={handlePrevPage}
              className="add-book-btn"
              style={{ marginTop: '1.5rem' }}
            >
              Volver a la página anterior
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
