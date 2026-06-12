import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';
import LibroService from '../Services/Libro';
import UsuarioService from '../Services/Usuario';
import './BookDetail.css';

type Book = {
  _id?: string;
  id?: string;
  title?: string;
  authors?: string[];
  author?: string;
  autor?: string;
  isbn?: string;
  price?: string | number;
  precio?: number;
  status?: string;
  state?: string;
  estado?: string;
  description?: string;
  editorial?: string;
  publisher?: string;
  publicationDate?: string;
  publishedDate?: string;
  owner?: {
    _id: string;
    name: string;
    email: string;
  } | string;
  type?: 'COMPRA' | 'ALQUILER';
};

const formatAuthors = (book: Book) => {
  if (book.authors?.length) {
    return book.authors.join(', ');
  }

  return book.author || book.autor || 'Autor desconocido';
};

const formatPrice = (price?: string | number) => {
  if (price === undefined || price === null || price === '') {
    return 'Consultar precio';
  }

  return `${price} EUR`;
};

const BookDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Current User
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Wishlist and Favorites States
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [togglingWishlist, setTogglingWishlist] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [isInFavorites, setIsInFavorites] = useState(false);
  const [togglingFavorites, setTogglingFavorites] = useState(false);
  const [isFavHovered, setIsFavHovered] = useState(false);

  // Reservation & Contact states
  const [isReserved, setIsReserved] = useState(false);
  const [submittingReserve, setSubmittingReserve] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');
  const [submittingContact, setSubmittingContact] = useState(false);

  useEffect(() => {
    const fetchBookAndWishlist = async () => {
      if (!id) {
        setError('No se encontro el identificador del libro.');
        setLoading(false);
        return;
      }

      try {
        const data = await LibroService.getLibroById(id);
        setBook(data);

        // Check if user is logged in and book is in wishlist/favorites
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const profile = await UsuarioService.getProfile();
            setCurrentUser(profile);
            
            const wishlist = profile.wishlist || [];
            const inWishlist = wishlist.some(
              (b: any) => (typeof b === "object" ? b._id : b) === id
            );
            setIsInWishlist(!!inWishlist);

            const favoriteBooks = profile.favoriteBooks || [];
            const inFavorites = favoriteBooks.some(
              (b: any) => (typeof b === "object" ? b._id : b) === id
            );
            setIsInFavorites(!!inFavorites);

            // Fetch reservation requests to check if already requested
            const resResponse = await api.get('/reservas/solicitadas');
            const resData = resResponse.data.data || resResponse.data || [];
            const hasRes = resData.some((r: any) => (r.libro?._id || r.libro) === id);
            setIsReserved(hasRes);
          } catch (profileError) {
            console.error("Error fetching user profile for wishlist/favorites:", profileError);
          }
        }
      } catch (fetchError) {
        console.error('Error fetching book detail:', fetchError);
        setError('No se pudo cargar el detalle del libro.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndWishlist();
  }, [id]);

  const handleWishlistToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warn("Debes iniciar sesión para añadir libros a tu lista de deseos.");
      return;
    }

    if (!id) return;

    setTogglingWishlist(true);
    try {
      await UsuarioService.toggleWishlist(id);
      const nextState = !isInWishlist;
      setIsInWishlist(nextState);
      if (nextState) {
        toast.success("¡Libro añadido a tu lista de deseos!");
      } else {
        toast.info("Libro eliminado de tu lista de deseos.");
      }
    } catch (toggleError) {
      console.error("Error toggling wishlist:", toggleError);
      toast.error("No se pudo actualizar la lista de deseos.");
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleFavoriteToggle = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warn("Debes iniciar sesión para añadir libros a tus favoritos.");
      return;
    }

    if (!id) return;

    setTogglingFavorites(true);
    try {
      await UsuarioService.toggleFavorite(id);
      const nextState = !isInFavorites;
      setIsInFavorites(nextState);
      if (nextState) {
        toast.success("¡Libro añadido a tus favoritos!");
      } else {
        toast.info("Libro eliminado de tus favoritos.");
      }
    } catch (toggleError) {
      console.error("Error toggling favorites:", toggleError);
      toast.error("No se pudo actualizar los favoritos.");
    } finally {
      setTogglingFavorites(false);
    }
  };

  const handleReserve = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.warn("Debes iniciar sesión para reservar un libro.");
      return;
    }
    setSubmittingReserve(true);
    try {
      await api.post('/reservas', { libroId: id });
      setIsReserved(true);
      toast.success("¡Solicitud de reserva enviada con éxito!");
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Error al realizar la reserva";
      toast.error(msg);
    } finally {
      setSubmittingReserve(false);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!initialMessage.trim()) return;

    setSubmittingContact(true);
    try {
      await api.post('/message-requests', {
        bookId: id,
        initialMessage: initialMessage.trim()
      });
      toast.success("¡Solicitud de contacto enviada con éxito!");
      setShowContactModal(false);
      setInitialMessage('');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Error al enviar la solicitud de mensaje";
      toast.error(msg);
    } finally {
      setSubmittingContact(false);
    }
  };

  if (loading) {
    return <div className="book-detail-page">Cargando detalle del libro...</div>;
  }

  if (error || !book) {
    return (
      <div className="book-detail-page">
        <button className="back-button" onClick={() => navigate('/home')}>
          Volver
        </button>
        <p className="book-detail-error">{error || 'Libro no encontrado.'}</p>
      </div>
    );
  }

  return (
    <main className="book-detail-page">
      <button className="back-button" onClick={() => navigate('/home')}>
        Volver
      </button>

      <section className="book-detail-layout">
        <div className="book-detail-cover" aria-label="Portada del libro">
          <span>Libro</span>
        </div>

        <div className="book-detail-info">
          <span className="book-detail-status">{book.status || 'Disponible'}</span>
          <h1>{book.title || 'Titulo sin nombre'}</h1>
          <p className="book-detail-author">{formatAuthors(book)}</p>

          <div className="book-detail-price">{formatPrice(book.price)}</div>

          {/* Action Row */}
          <div className="book-detail-actions">
            <button
              className={`wishlist-toggle-btn ${isInWishlist ? "active" : ""}`}
              onClick={handleWishlistToggle}
              disabled={togglingWishlist}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="heart-icon">
                {isInWishlist ? (isHovered ? "💔" : "❤️") : "🤍"}
              </span>
              {isInWishlist 
                ? (isHovered ? "Quitar de lista" : "En lista de deseos") 
                : "Añadir a lista"
              }
            </button>

            <button
              className={`favorite-toggle-btn ${isInFavorites ? "active" : ""}`}
              onClick={handleFavoriteToggle}
              disabled={togglingFavorites}
              onMouseEnter={() => setIsFavHovered(true)}
              onMouseLeave={() => setIsFavHovered(false)}
            >
              <span className="star-icon">
                {isInFavorites ? (isFavHovered ? "❌" : "⭐") : "☆"}
              </span>
              {isInFavorites 
                ? (isFavHovered ? "Quitar" : "Favorito") 
                : "Favorito"
              }
            </button>

            {currentUser && book.owner && (
              (typeof book.owner === 'object' ? book.owner._id : book.owner) === currentUser._id
            ) ? (
              <span className="owner-listing-tag">👤 Publicación propia</span>
            ) : (
              <>
                <button
                  className="reserve-btn"
                  onClick={handleReserve}
                  disabled={isReserved || submittingReserve}
                >
                  {isReserved ? "Reserva Solicitada" : "Solicitar Reserva"}
                </button>

                <button
                  className="contact-btn"
                  onClick={() => setShowContactModal(true)}
                  disabled={submittingContact}
                >
                  Contactar Vendedor
                </button>
              </>
            )}
          </div>

          <dl className="book-detail-meta">
            <div>
              <dt>ISBN</dt>
              <dd>{book.isbn || 'No disponible'}</dd>
            </div>
            <div>
              <dt>Estado</dt>
              <dd>{book.state || 'No indicado'}</dd>
            </div>
            <div>
              <dt>Editorial</dt>
              <dd>{book.editorial || book.publisher || 'No indicada'}</dd>
            </div>
            <div>
              <dt>Publicacion</dt>
              <dd>{book.publicationDate || book.publishedDate || 'No indicada'}</dd>
            </div>
          </dl>

          {book.description && (
            <div className="book-detail-description">
              <h2>Descripcion</h2>
              <p>{book.description}</p>
            </div>
          )}
        </div>
      </section>
      
      {/* Contact Seller Modal Overlay */}
      {showContactModal && (
        <div className="contact-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Contactar al Vendedor</h3>
            <p>Envía un mensaje inicial para iniciar la conversación sobre este libro.</p>
            <form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                placeholder="Hola, me interesa tu libro y me gustaría..."
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                className="contact-textarea"
                required
              />
              <div className="contact-actions">
                <button
                  type="button"
                  onClick={() => setShowContactModal(false)}
                  className="back-button"
                  style={{ flex: 1, textAlign: 'center', justifyContent: 'center', margin: 0 }}
                  disabled={submittingContact}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="contact-btn"
                  style={{ flex: 2, margin: 0, justifyContent: 'center' }}
                  disabled={submittingContact}
                >
                  {submittingContact ? "Enviando..." : "Enviar Solicitud"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </main>
  );
};

export default BookDetail;
