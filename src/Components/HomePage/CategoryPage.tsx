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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (type === 'rentals') {
          const books = await LibroService.getAllLibros();
          setItems(books.filter((b: any) => b.type === 'ALQUILER'));
        } else if (type === 'sales') {
          const books = await LibroService.getAllLibros();
          setItems(books.filter((b: any) => b.type === 'VENTA'));
        } else if (type === 'events') {
          const events = await EventService.getAllEventos();
          setItems(events || []);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [type]);

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

      {/* CONTROL DINÁMICO DE DISEÑO */}
      {items.length > 0 ? (
        type === 'events' ? (
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

                  {item.price && <span className="card-price">{item.price} €</span>}

                  {item.estado && <span className="card-meta">{item.estado}</span>}

                  {item.authors && <span className="card-meta">{item.authors.join(', ')}</span>}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <p className="no-data-msg">
          {type === 'events' ? 'No hay eventos disponibles' : t('no_sales_available')}
        </p>
      )}
    </div>
  );
};

export default CategoryPage;
