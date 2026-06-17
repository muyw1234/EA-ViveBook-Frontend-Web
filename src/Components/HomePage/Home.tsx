import React, { useState, useEffect } from 'react';

import UsuarioService from '../Services/Usuario';
import LibroService from '../Services/Libro';
import { useNavigate } from 'react-router-dom';
import type { IPost } from '../Services/Post';
import PostService from '../Services/Post';
import EventoService from '../Services/Evento';
import './Home.css';
import ImageService from '../Services/Image';
import 'leaflet/dist/leaflet.css';
import { useTranslation } from 'react-i18next';

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';

import L from 'leaflet';
import { toast, ToastContainer } from 'react-toastify';
import ImageFrame from './ImageFrame';
import { getSessionToken } from '../../utils/session';
import { useMatomo } from 'matomo-tracker-for-react';
import type ILibro from '../../Models/Libro';

// Icono para el Usuario (Azul)
const UserIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// Icono para los Eventos (Rojo)
const EventIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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

  const [searchQuery, setSearchQuery] = useState('');
  const [user, setUser] = useState<any | null>(null);
  const [books, setBooks] = useState<any[]>([]);
  const [posts, setPosts] = useState<Partial<IPost>[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);

  // Guardamos dinámicamente si hay un token en el localStorage para escuchar cambios
  const [authToken, setAuthToken] = useState<string | null>(() => getSessionToken());

  const latestBooks = [...books].reverse();
  const heroBooks = latestBooks.slice(0, 3);

  // Form state corresponding to book fields
  const [newBookType, setNewBookType] = useState('VENTA');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookIsbn, setNewBookIsbn] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookState, setNewBookState] = useState('nuevo');
  const [newBookPrice, setNewBookPrice] = useState('');
  const [onlyISBN, setOnlyISBN] = useState<boolean>(false);

  const [imageUrl, setImageUrl] = useState<string | null>(null);

  // Form state corresponding to event fields
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventDate, setNewEventDate] = useState('');
  const [newEventLocation, setNewEventLocation] = useState<[number, number] | null>(null);
  const [newEventDireccionExacta, setNewEventDireccionExacta] = useState('');

  function AddingBookInput(data: Partial<ILibro>) {
    const { trackEvent } = useMatomo();
    console.log('Sending metrics of Adding Book to Matomo.');
    trackEvent('Libro', 'Adding Book', data.type as string);

    return (
      <input
        type="submit"
        className="submit-btn"
        value={t('submit_book_btn')}
        onClick={(e) => handleAddBookSubmit(e)}
      />
    );
  }

  const navigate = useNavigate();

  const checkAuthAndOpen = (openModalSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    if (!getSessionToken()) {
      toast.warn('Inicia sesión para usar esta función');
      navigate('/login');
    } else {
      openModalSetter(true);
    }
  };

  // 1. Efecto separado únicamente para la geolocalización (Solo corre al montar)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        () => {
          console.log('Acceso a ubicación denegado. Usando Barcelona por defecto.');
          setUserLocation([41.3851, 2.1734]);
        },
      );
    }
  }, []);

  // 2. Efecto periódico para verificar si el usuario inició o cerró sesión en otra vista
  useEffect(() => {
    const handleStorageChange = () => {
      setAuthToken(getSessionToken());
    };

    // Escucha cambios en el mismo componente y entre pestañas
    window.addEventListener('storage', handleStorageChange);
    const interval = setInterval(() => {
      const currentToken = getSessionToken();
      if (currentToken !== authToken) {
        setAuthToken(currentToken);
      }
    }, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, [authToken]);

  // 3. Efecto encargado de traer los datos (Se dispara al montar Y cada vez que el token cambie)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (authToken) {
          try {
            const userData = await UsuarioService.getProfile();
            setUser(userData);
          } catch (err) {
            console.error('Error fetching user profile:', err);
            setUser(null);
          }
        } else {
          setUser(null); // Si no hay token, limpiamos explícitamente el usuario
        }

        try {
          PostService.readAllPosts(setPosts);
        } catch (postErr) {
          console.error('Error fetching posts:', postErr);
        }

        try {
          const booksData = await LibroService.getAllLibros();
          const processedBooks = booksData.map((b: any, index: number) => ({
            ...b,
            type: b.type || (index % 2 === 0 ? 'VENTA' : 'ALQUILER'),
          }));
          setBooks(processedBooks);
        } catch (bookErr) {
          console.error('Error fetching books:', bookErr);
        }

        try {
          const eventosData = await EventoService.getAllEventos();
          setEventos(eventosData);
        } catch (eventErr) {
          console.error('Error fetching events:', eventErr);
        }
      } catch (error) {
        console.error('General error in Home fetchData:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [authToken]); // <-- CORRECCIÓN CLAVE: Al añadir authToken aquí, los libros se recargarán inmediatamente al iniciar sesión

  const handleAddBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const bookData = {
        isbn: newBookIsbn,
        title: newBookTitle,
        authors: [newBookAuthor],
        type: newBookType,
        precio: Number(newBookPrice),
        estado: newBookState,
        imageUrl: imageUrl || undefined,
      };

      const newBookResponse = await LibroService.addLibroListing(bookData);

      const addedBook =
        newBookResponse && newBookResponse._id
          ? {
              ...newBookResponse,
              type: newBookType,
              precio: Number(newBookPrice),
              authors: [newBookAuthor],
            }
          : {
              _id: Date.now().toString(),
              title: newBookTitle,
              authors: [newBookAuthor],
              precio: Number(newBookPrice),
              type: newBookType,
            };

      setBooks((prev) => [...prev, addedBook]);

      alert('Libro añadido con éxito');
      setIsAddBookModalOpen(false);

      setNewBookTitle('');
      setNewBookIsbn('');
      setNewBookAuthor('');
      setNewBookPrice('');
    } catch (error) {
      console.error('Error submitting book:', error);
      alert('Error al añadir el libro. Revisa la consola del navegador y del backend.');
    }
  };

  const handleAddEventSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !user._id) {
      alert('Debes estar autenticado para crear un evento.');
      return;
    }

    if (!newEventLocation) {
      alert('Por favor, selecciona una ubicación haciendo clic en el mapa.');
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
          type: 'Point' as const,
          coordinates: [newEventLocation[1], newEventLocation[0]] as [number, number],
        },
        direccionExacta: newEventDireccionExacta,
      };

      const newEventResponse = await EventoService.createEvento(eventData);

      setEventos((prev) => [
        ...prev,
        newEventResponse || { ...eventData, _id: Date.now().toString() },
      ]);

      alert('¡Evento creado con éxito!');
      setIsAddEventModalOpen(false);

      setNewEventTitle('');
      setNewEventDescription('');
      setNewEventDate('');
      setNewEventDireccionExacta('');
      setNewEventLocation(null);
    } catch (error) {
      console.error('Error submitting event:', error);
      alert('Error al añadir el evento.');
    }
  };

  const alquilerBooks = latestBooks.filter((b) => b.type === 'ALQUILER').slice(0, 5);
  const ventaBooks = latestBooks.filter((b) => b.type === 'VENTA').slice(0, 5);

  const openBookDetail = (bookId?: string) => {
    if (bookId) {
      navigate(`/libros/${bookId}`);
    }
  };

  if (loading) {
    return <div className="home-container">Cargando ViveBook...</div>;
  }

  function search() {
    navigate('/search', { state: { term: searchQuery } });
  }

  return (
    <div className="home-container">
      {/* Header & Search */}
      <header className="search-header">
        <div className="logo-container">
          <span className="logo-text">ViveBook</span>
          <div className="user-info-nav">
            {user && (
              <button
                className="add-book-btn"
                onClick={() => checkAuthAndOpen(setIsAddBookModalOpen)}
              >
                + {t('add_book_btn', 'Añadir Libro')}
              </button>
            )}
            {user ? (
              <div className="user-profile-badge">
                <button onClick={() => navigate('/profile')} className="profile-btn">
                  <span className="username-display">{user.name}</span>
                  <div className="user-avatar-placeholder"></div>
                </button>
              </div>
            ) : (
              <button onClick={() => navigate('/login')} className="login-btn">
                {t('login_btn')}
              </button>
            )}
          </div>
        </div>
        <div className="search-bar-wrapper">
          <div className="search-field-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-bar"
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
              }}
            />
            <div className="search-filter-btn-container">
              <div className="search-field-divider"></div>
              <button
                type="button"
                className="search-filter-toggle-btn"
                onClick={() =>
                  navigate('/search', { state: { term: searchQuery, openFilters: true } })
                }
                title={t('filters', 'Filtros')}
              >
                ⚙️
              </button>
            </div>
          </div>

          <button className="add-book-btn" onClick={() => search()}>
            Buscar
          </button>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="hero-banner-bookshub">
        <div className="hero-content">
          <h1>Libros del Mes</h1>
          <p>
            Descubre las lecturas más recientes subidas por nuestra comunidad de lectores y atrévete
            con una nueva historia.
          </p>
          <button className="read-more-btn" onClick={() => navigate('/categorias/sales')}>
            Explorar Catálogo
          </button>
        </div>
        <div className="hero-books-display">
          {heroBooks.map((book, idx) => {
            const positionClass =
              idx === 0 ? 'left-book' : idx === 1 ? 'center-book' : 'right-book';
            const defaultGradient =
              idx === 0
                ? 'linear-gradient(135deg, #F5E4F0, #D183BA)'
                : idx === 1
                  ? 'linear-gradient(135deg, #D183BA, #a85890)'
                  : 'linear-gradient(135deg, #fbcfe8, #e0a3cd)';

            return (
              <div
                key={book._id || idx}
                className={`hero-book-card ${positionClass}`}
                onClick={() => book._id && openBookDetail(book._id)}
                style={{ cursor: book._id ? 'pointer' : 'default' }}
              >
                {book.imageUrl ? (
                  <img
                    src={book.imageUrl}
                    alt={book.title}
                    className="book-cover-placeholder"
                    style={{ objectFit: 'cover' }}
                  />
                ) : (
                  <div
                    className="book-cover-placeholder modern-cover"
                    style={{
                      background: defaultGradient,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '1rem',
                      textAlign: 'center',
                      boxSizing: 'border-box',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.9rem',
                        fontWeight: 800,
                        color: 'white',
                        marginBottom: '0.25rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {book.title || 'Título'}
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        color: 'rgba(255,255,255,0.8)',
                        fontWeight: 600,
                      }}
                    >
                      {book.authors?.join(', ') || 'Autor'}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
          {heroBooks.length === 0 && (
            <>
              <div className="hero-book-card left-book">
                <div
                  className="book-cover-placeholder modern-cover"
                  style={{ background: 'linear-gradient(135deg, #F5E4F0, #D183BA)' }}
                ></div>
              </div>
              <div className="hero-book-card center-book">
                <div
                  className="book-cover-placeholder modern-cover"
                  style={{ background: 'linear-gradient(135deg, #D183BA, #a85890)' }}
                ></div>
              </div>
              <div className="hero-book-card right-book">
                <div
                  className="book-cover-placeholder modern-cover"
                  style={{ background: 'linear-gradient(135deg, #fbcfe8, #e0a3cd)' }}
                ></div>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Dashboard Section */}
      {user && (
        <section className="content-section dashboard-section">
          <h2 className="section-title">Mi Panel de Control</h2>
          <div className="dashboard-grid">
            <div className="dashboard-card" onClick={() => navigate('/categorias/sales')}>
              <div className="dash-icon">🛍️</div>
              <h3>Libros en Venta</h3>
              <p>Explora el catálogo de libros disponibles para compra directa.</p>
              <span className="dash-action-link">Ver catálogo →</span>
            </div>

            <div className="dashboard-card" onClick={() => navigate('/categorias/rentals')}>
              <div className="dash-icon">🔑</div>
              <h3>Libros en Alquiler</h3>
              <p>Encuentra lecturas para alquilar por periodos de tiempo flexibles.</p>
              <span className="dash-action-link">Explorar alquileres →</span>
            </div>

            <div className="dashboard-card" onClick={() => setIsAddBookModalOpen(true)}>
              <div className="dash-icon">➕</div>
              <h3>Subir Libro</h3>
              <p>Comparte tus libros con otros usuarios vendiéndolos o alquilándolos.</p>
              <span className="dash-action-link">Añadir ahora →</span>
            </div>
          </div>
        </section>
      )}

      {/* Social Dashboard Section */}
      {user && (
        <section className="content-section social-dashboard-section">
          <div className="social-dashboard-grid">
            {/* Left Column: Mi Red & Preferencias */}
            <div className="following-container-box">
              <h2 className="section-title">Mi Red & Preferencias</h2>
              {!user.followingUsers?.length &&
              !user.favoriteAuthors?.length &&
              !user.favoriteCategories?.length ? (
                <p className="no-following-msg">
                  Aún no sigues a ningún lector ni has añadido favoritos. ¡Ve a tu perfil para
                  configurar tus gustos!
                </p>
              ) : (
                <div className="following-subgrid-vertical">
                  {user.followingUsers && user.followingUsers.length > 0 && (
                    <div className="following-group">
                      <h3>👥 Lectores que sigues</h3>
                      <div className="following-list">
                        {user.followingUsers.map((followedUser: any) => (
                          <div key={followedUser._id || followedUser} className="followed-user-row">
                            <span className="followed-user-name">
                              {followedUser.name || 'Lector'}
                            </span>
                            <button
                              className="view-followed-btn"
                              onClick={() =>
                                navigate(`/profile/${followedUser._id || followedUser}`)
                              }
                            >
                              Ver Perfil
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.favoriteAuthors && user.favoriteAuthors.length > 0 && (
                    <div className="following-group">
                      <h3>✍️ Autores Favoritos</h3>
                      <div className="fav-items-list">
                        {user.favoriteAuthors.map((author: string, idx: number) => (
                          <span key={idx} className="fav-item-badge author">
                            {author}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {user.favoriteCategories && user.favoriteCategories.length > 0 && (
                    <div className="following-group">
                      <h3>🏷️ Géneros Favoritos</h3>
                      <div className="fav-items-list">
                        {user.favoriteCategories.map((cat: string, idx: number) => (
                          <span key={idx} className="fav-item-badge category">
                            {cat}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Column: Eventos y Mapa */}
            <div className="events-map-container-box">
              <div className="events-box-header">
                <h2 className="section-title">Eventos & Mapa local</h2>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    className="add-book-btn"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    onClick={() => checkAuthAndOpen(setIsAddEventModalOpen)}
                  >
                    + Nuevo Evento
                  </button>
                  <button
                    className="see-all-btn-link"
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--primary)',
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      textDecoration: 'underline',
                    }}
                    onClick={() => navigate('/categorias/events')}
                  >
                    Ver todos
                  </button>
                </div>
              </div>

              {/* Map displaying events */}
              <div
                className="social-map-wrapper"
                style={{
                  height: '260px',
                  width: '100%',
                  borderRadius: '1rem',
                  overflow: 'hidden',
                  border: '1px solid var(--border)',
                }}
              >
                {userLocation && (
                  <MapContainer
                    center={userLocation}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={userLocation} icon={UserIcon}>
                      <Popup>Estás aquí</Popup>
                    </Marker>
                    {eventos.map((evt: any) => (
                      <Marker
                        key={evt._id}
                        position={[evt.location.coordinates[1], evt.location.coordinates[0]]}
                        icon={EventIcon}
                      >
                        <Popup>
                          <strong>{evt.title}</strong>
                          <br />
                          {evt.direccionExacta}
                        </Popup>
                      </Marker>
                    ))}
                    <RecenterMap coords={userLocation} />
                  </MapContainer>
                )}
              </div>

              {/* List of 2 upcoming events */}
              <div
                className="social-events-list"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.75rem',
                  marginTop: '0.75rem',
                }}
              >
                {eventos && eventos.length > 0 ? (
                  eventos
                    .filter((event: any) => {
                      const dateStr = event.eventDate || event.date;
                      if (!dateStr) return false;
                      const eventDate = new Date(dateStr);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      eventDate.setHours(0, 0, 0, 0);
                      return eventDate >= today;
                    })
                    .sort((a: any, b: any) => {
                      const dateA = new Date(a.eventDate || a.date).getTime();
                      const dateB = new Date(b.eventDate || b.date).getTime();
                      return dateA - dateB;
                    })
                    .slice(0, 2)
                    .map((event: any) => (
                      <div
                        key={event._id}
                        className="social-event-row-card"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '1rem',
                          padding: '0.75rem',
                          background: '#faf5f9',
                          borderRadius: '0.75rem',
                          cursor: 'pointer',
                          border: '1px solid #f1e2f0',
                        }}
                        onClick={() => navigate(`/eventos/${event._id}`)}
                      >
                        <div
                          className="event-date-badge"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'white',
                            border: '1px solid #d183ba',
                            color: '#d183ba',
                            borderRadius: '0.5rem',
                            width: '45px',
                            height: '45px',
                            flexShrink: 0,
                          }}
                        >
                          <span style={{ fontWeight: '800', fontSize: '1rem', lineHeight: 1 }}>
                            {event.eventDate ? new Date(event.eventDate).getDate() : '---'}
                          </span>
                          <span
                            style={{
                              fontSize: '0.65rem',
                              textTransform: 'uppercase',
                              fontWeight: 600,
                            }}
                          >
                            {event.eventDate
                              ? new Date(event.eventDate).toLocaleString('default', {
                                  month: 'short',
                                })
                              : '---'}
                          </span>
                        </div>
                        <div
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.15rem',
                            textAlign: 'left',
                          }}
                        >
                          <span
                            style={{
                              fontWeight: '700',
                              fontSize: '0.9rem',
                              color: 'var(--text-h)',
                            }}
                          >
                            {event.title}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text)' }}>
                            📍 {event.direccionExacta}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <p
                    style={{
                      color: 'var(--text)',
                      fontStyle: 'italic',
                      fontSize: '0.85rem',
                      margin: 0,
                    }}
                  >
                    No hay eventos próximos en tu zona.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Posts Section */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('section_posts')}</h2>
          <a href="#" className="see-all">
            {t('see_all')}
          </a>
        </div>
        <div className="card-grid">
          {posts.length > 0 ? (
            posts.map((post) => (
              <div key={`Post: ${post._id}`} className="book-card">
                <div className="card-image-placeholder modern-card-image">
                  <ImageFrame imageUrl={post.imageUrl} />
                </div>
                <div className="card-info">
                  <span>
                    <span className="card-title" title={post.description}>
                      {post.description}
                    </span>
                    <span className="card-meta">{post.status}</span>
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data-msg">
              {t('no_posts_available', 'No hay publicaciones disponibles')}
            </p>
          )}
        </div>
      </section>

      {/* Books Section - Alquiler */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('section_rentals')}</h2>
          <button
            className="see-all"
            onClick={() => navigate('/categorias/rentals')}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {t('see_all')}
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
                  if (e.key === 'Enter' || e.key === ' ') {
                    openBookDetail(book._id);
                  }
                }}
              >
                <div className="card-image-placeholder modern-card-image">
                  <ImageFrame imageUrl={book.imageUrl} />{' '}
                </div>
                <div className="card-info">
                  <span className="card-price">
                    {book.precio !== undefined ? `${book.precio} €` : t('consult_price')}
                  </span>
                  <span className="card-title" title={book.title}>
                    {book.title}
                  </span>
                  <span className="card-meta">
                    {book.authors?.join(', ') || t('unknown_author')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data-msg">{t('no_rentals_available')}</p>
          )}
        </div>
      </section>

      {/* Books Section - Venta */}
      <section className="content-section">
        <div className="section-header">
          <h2 className="section-title">{t('section_sales')}</h2>
          <button
            className="see-all"
            onClick={() => navigate('/categorias/sales')}
            style={{
              background: 'none',
              border: 'none',
              color: 'inherit',
              font: 'inherit',
              cursor: 'pointer',
              textDecoration: 'underline',
            }}
          >
            {t('see_all')}
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
                  if (e.key === 'Enter' || e.key === ' ') {
                    openBookDetail(book._id);
                  }
                }}
              >
                <div className="card-image-placeholder modern-card-image">
                  <ImageFrame imageUrl={book.imageUrl} />
                </div>
                <div className="card-info">
                  <span className="card-price">
                    {book.precio !== undefined ? `${book.precio} €` : t('consult_price')}
                  </span>
                  <span className="card-title" title={book.title}>
                    {book.title}
                  </span>
                  <span className="card-meta">
                    {book.authors?.join(', ') || t('unknown_author')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="no-data-msg">{t('no_sales_available')}</p>
          )}
        </div>
      </section>

      {/* Add Book Modal */}
      {isAddBookModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddBookModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('modal_add_title')}</h2>
              <button className="close-btn" onClick={() => setIsAddBookModalOpen(false)}>
                ×
              </button>
            </div>
            <div className="form-check">
              <input
                className="form-check-input"
                type="checkbox"
                id="flexCheckDefault"
                onChange={(e) => setOnlyISBN(e.target.checked)}
              />
              <label className="form-check-label">{t('use_openlibrary')}</label>
            </div>
            {!onlyISBN ? (
              <div className="add-book-form">
                <div className="form-group">
                  <label>{t('label_operation_type')}</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="VENTA"
                        checked={newBookType === 'VENTA'}
                        onChange={(e) => setNewBookType(e.target.value)}
                      />
                      {t('for_sale')}
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="ALQUILER"
                        checked={newBookType === 'ALQUILER'}
                        onChange={(e) => setNewBookType(e.target.value)}
                      />
                      {t('for_rent')}
                    </label>
                  </div>
                </div>
                {/* He vuelto a poner estos campos obligatorios, no lo volveis a borrar indiscriminadamente. */}
                <div className="form-group">
                  <label>{t('label_book_title')}</label>
                  <input
                    type="text"
                    placeholder="Ej: Cien años de soledad"
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>{t('label_id_data')}</label>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <div
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <label style={{ fontSize: '0.8rem' }}>ISBN</label>
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
                <div
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                  }}
                >
                  <label style={{ fontSize: '0.8rem' }}>{t('label_author')}</label>
                  <input
                    type="text"
                    placeholder="Ej: Gabriel García Márquez"
                    value={newBookAuthor}
                    onChange={(e) => setNewBookAuthor(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('label_book_state')}</label>
                  <select value={newBookState} onChange={(e) => setNewBookState(e.target.value)}>
                    <option value="nuevo">{t('state_new')}</option>
                    <option value="como_nuevo">{t('state_like_new')}</option>
                    <option value="buen_estado">{t('state_good')}</option>
                    <option value="usado">{t('state_used')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('label_price')}</label>
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

                <div className="form-group">
                  <label> Subir Foto</label>
                  <input
                    type="file"
                    src="./"
                    id="imageSelector"
                    alt="Subir foto"
                    /* T-T Por favor comprobad el codigo antes de subir al repositorio, lo he tenido que volver a añadir. */
                    onChange={(e) => {
                      const file = e.target.files![0];
                      //toast(JSON.stringify(path)); // aqui no aparece
                      //console.log(path);
                      const formData: FormData = new FormData();
                      formData.append('file', file);
                      // no es lo mejor ponerlo asi, la subida de la imagen tendria que hacerlo al Subir el Libro
                      ImageService.upload(formData)
                        .then((url) => setImageUrl(url!))
                        .catch((error) => {
                          toast.error(JSON.stringify(error));
                        });
                    }}
                  />
                </div>

                {/* <button  // repetido? Creo que si, en la Linea 211 ya hay algo asi. Confuso? Si.
                  className="submit-btn"
                  disabled={!newBookIsbn || !newBookPrice}
                  onClick={async () => {
                    setOnlyISBN(false);
                    await LibroService.addLibroListing()
                    setIsAddBookModalOpen(false);
                  }}
                >
                  {t('submit_book_btn')}
                </button> */}
                {/* <input
                  type="submit"
                  className="submit-btn"
                  value={t('submit_book_btn')}
                  onClick={(e) => handleAddBookSubmit(e)}
                /> */}
                <AddingBookInput />
              </div>
            ) : (
              <form className="add-book-form" onSubmit={handleAddBookSubmit}>
                <div className="form-group">
                  <label>{t('label_operation_type')}</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="VENTA"
                        checked={newBookType === 'VENTA'}
                        onChange={(e) => setNewBookType(e.target.value)}
                      />
                      {t('for_sale')}
                    </label>
                    <label className="radio-label">
                      <input
                        type="radio"
                        value="ALQUILER"
                        checked={newBookType === 'ALQUILER'}
                        onChange={(e) => setNewBookType(e.target.value)}
                      />
                      {t('for_rent')}
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>{t('label_book_title')}</label>
                  <input
                    type="text"
                    placeholder="Ej: Cien años de soledad"
                    value={newBookTitle}
                    onChange={(e) => setNewBookTitle(e.target.value)}
                    required
                  />
                </div>

                <button
                  className="submit-btn"
                  disabled={!newBookIsbn || !newBookPrice}
                  onClick={async () => {
                    setOnlyISBN(false);
                    await LibroService.addLibroByIsbn(newBookIsbn);
                    setIsAddBookModalOpen(false);
                  }}
                >
                  {t('submit_book_btn')}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Add Event Modal */}
      {isAddEventModalOpen && (
        <div className="modal-overlay" onClick={() => setIsAddEventModalOpen(false)}>
          <div
            className="modal-content"
            style={{ maxWidth: '600px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>Crear Nuevo Evento</h2>
              <button className="close-btn" onClick={() => setIsAddEventModalOpen(false)}>
                ×
              </button>
            </div>
            <form className="add-book-form" onSubmit={handleAddEventSubmit}>
              <div className="form-group">
                <label>Título del Evento</label>
                <input
                  type="text"
                  placeholder="Ej: Club de lectura semanal"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Descripción</label>
                <textarea
                  className="auth-input"
                  style={{
                    width: '100%',
                    minHeight: '60px',
                    padding: '10px',
                    borderRadius: '5px',
                    boxSizing: 'border-box',
                  }}
                  placeholder="¿De qué trata el evento?"
                  value={newEventDescription}
                  onChange={(e) => setNewEventDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Fecha y Hora</label>
                <input
                  type="datetime-local"
                  value={newEventDate}
                  onChange={(e) => setNewEventDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Dirección Exacta</label>
                <input
                  type="text"
                  placeholder="Ej: Calle Mayor 12, Planta 1"
                  value={newEventDireccionExacta}
                  onChange={(e) => setNewEventDireccionExacta(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Ubicación en el Mapa (Haz clic para seleccionar)</label>
                <div
                  style={{
                    height: '250px',
                    width: '100%',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--border)',
                  }}
                >
                  <MapContainer
                    center={userLocation || [41.3851, 2.1734]}
                    zoom={13}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <MapClickHandler
                      onMapClick={(lat, lng) => {
                        setNewEventLocation([lat, lng]);
                      }}
                    />
                    {newEventLocation && (
                      <Marker position={newEventLocation} icon={EventIcon}>
                        <Popup>Ubicación seleccionada</Popup>
                      </Marker>
                    )}
                  </MapContainer>
                </div>
                {newEventLocation && (
                  <span style={{ fontSize: '0.8rem', color: 'green', marginTop: '0.25rem' }}>
                    Coordenadas seleccionadas: {newEventLocation[0].toFixed(5)},{' '}
                    {newEventLocation[1].toFixed(5)}
                  </span>
                )}
              </div>

              <button type="submit" className="submit-btn" disabled={!newEventLocation}>
                {!newEventLocation ? 'Selecciona ubicación en el mapa' : 'Publicar Evento'}
              </button>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Home;
