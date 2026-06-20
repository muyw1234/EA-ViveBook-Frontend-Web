import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../../api';
import LibroService from '../Services/Libro';
import UsuarioService from '../Services/Usuario';
import type ILibro from '../../Models/Libro';
import { getApiCollection } from '../../utils/apiResponse';
import { formatAuthors } from '../../utils/libro';
import { getSessionToken } from '../../utils/session';
import './BookDetail.css';

type Book = Partial<ILibro> & {
  id?: string;
  author?: string;
  status?: string;
  description?: string;
  editorial?: string;
  publisher?: string;
  publicationDate?: string;
  publishedDate?: string;
};

const BookDetail: React.FC = () => {
  const { t } = useTranslation();
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

  const formatPrice = (price?: string | number) => {
    if (price === undefined || price === null || price === '') {
      return t('consult_price');
    }
    return `${price} EUR`;
  };

  useEffect(() => {
    const fetchBookAndWishlist = async () => {
      if (!id) {
        setError(t('detail_error_id'));
        setLoading(false);
        return;
      }

      try {
        const data = await LibroService.getLibroById(id);
        setBook(data);

        // Check if user is logged in and book is in wishlist/favorites
        const token = getSessionToken();
        if (token) {
          try {
            const profile = await UsuarioService.getProfile();
            setCurrentUser(profile);

            const wishlist = profile.wishlist || [];
            const inWishlist = wishlist.some(
              (b: any) => (typeof b === 'object' ? b._id : b) === id,
            );
            setIsInWishlist(!!inWishlist);

            const favoriteBooks = profile.favoriteBooks || [];
            const inFavorites = favoriteBooks.some(
              (b: any) => (typeof b === 'object' ? b._id : b) === id,
            );
            setIsInFavorites(!!inFavorites);

            // Fetch reservation requests to check if already requested
            const resResponse = await api.get('/reservas/solicitadas');
            const resData = getApiCollection<any>(resResponse.data);
            const hasRes = resData.some((r: any) => (r.libro?._id || r.libro) === id);
            setIsReserved(hasRes);
          } catch (profileError) {
            console.error('Error fetching user profile for wishlist/favorites:', profileError);
          }
        }
      } catch (fetchError) {
        console.error('Error fetching book detail:', fetchError);
        setError(t('detail_error_fetch'));
      } finally {
        setLoading(false);
      }
    };

    fetchBookAndWishlist();
  }, [id, t]);

  const handleWishlistToggle = async () => {
    const token = getSessionToken();
    if (!token) {
      toast.warn(t('toast_login_wishlist'));
      return;
    }

    if (!id) return;

    setTogglingWishlist(true);
    try {
      await UsuarioService.toggleWishlist(id);
      const nextState = !isInWishlist;
      setIsInWishlist(nextState);
      if (nextState) {
        toast.success(t('toast_wishlist_success'));
      } else {
        toast.info(t('toast_wishlist_removed'));
      }
    } catch (toggleError) {
      console.error('Error toggling wishlist:', toggleError);
      toast.error(t('toast_wishlist_error'));
    } finally {
      setTogglingWishlist(false);
    }
  };

  const handleFavoriteToggle = async () => {
    const token = getSessionToken();
    if (!token) {
      toast.warn(t('toast_login_favorites'));
      return;
    }

    if (!id) return;

    setTogglingFavorites(true);
    try {
      await UsuarioService.toggleFavorite(id);
      const nextState = !isInFavorites;
      setIsInFavorites(nextState);
      if (nextState) {
        toast.success(t('toast_favorite_success'));
      } else {
        toast.info(t('toast_favorite_removed'));
      }
    } catch (toggleError) {
      console.error('Error toggling favorites:', toggleError);
      toast.error(t('toast_favorite_error'));
    } finally {
      setTogglingFavorites(false);
    }
  };

  const handleReserve = async () => {
    const token = getSessionToken();
    if (!token) {
      toast.warn(t('toast_login_reserve'));
      return;
    }
    setSubmittingReserve(true);
    try {
      await api.post('/reservas', { libroId: id });
      setIsReserved(true);
      toast.success(t('toast_reserve_success'));
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || t('toast_reserve_error');
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
        initialMessage: initialMessage.trim(),
      });
      toast.success(t('toast_contact_success'));
      setShowContactModal(false);
      setInitialMessage('');
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || t('toast_contact_error');
      toast.error(msg);
    } finally {
      setSubmittingContact(false);
    }
  };

  if (loading) {
    return <div className="book-detail-page">{t('detail_loading')}</div>;
  }

  if (error || !book) {
    return (
      <div className="book-detail-page">
        <button className="back-button" onClick={() => navigate('/')}>
          {t('detail_back')}
        </button>
        <p className="book-detail-error">{error || t('detail_title_fallback')}</p>
      </div>
    );
  }

  return (
    <main className="book-detail-page">
      <button className="back-button" onClick={() => navigate('/')}>
        {t('detail_back')}
      </button>

      <section className="book-detail-layout">
        <div
          className={`book-detail-cover ${book.imageUrl ? 'has-image' : ''}`}
          aria-label={t('detail_cover_alt')}
        >
          {book.imageUrl ? (
            <img src={book.imageUrl} alt={book.title || t('detail_cover_alt')} />
          ) : (
            <span>{t('detail_cover_text')}</span>
          )}
        </div>

        <div className="book-detail-info">
          <span className="book-detail-status">{book.status || t('detail_status_available')}</span>
          <h1>{book.title || t('detail_title_fallback')}</h1>
          <p className="book-detail-author">
            {formatAuthors(book.authors, book.autor || book.author)}
          </p>

          <div className="book-detail-price">{formatPrice(book.precio)}</div>

          {/* Action Row */}
          <div className="book-detail-actions">
            <button
              className={`wishlist-toggle-btn ${isInWishlist ? 'active' : ''}`}
              onClick={handleWishlistToggle}
              disabled={togglingWishlist}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <span className="heart-icon">{isInWishlist ? (isHovered ? '💔' : '❤️') : '🤍'}</span>
              {isInWishlist
                ? isHovered
                  ? t('btn_wishlist_remove')
                  : t('btn_wishlist_added')
                : t('btn_wishlist_add')}
            </button>

            <button
              className={`favorite-toggle-btn ${isInFavorites ? 'active' : ''}`}
              onClick={handleFavoriteToggle}
              disabled={togglingFavorites}
              onMouseEnter={() => setIsFavHovered(true)}
              onMouseLeave={() => setIsFavHovered(false)}
            >
              <span className="star-icon">
                {isInFavorites ? (isFavHovered ? '❌' : '⭐') : '☆'}
              </span>
              {isInFavorites
                ? isFavHovered
                  ? t('btn_favorite_remove')
                  : t('btn_favorite_add')
                : t('btn_favorite_add')}
            </button>

            {currentUser &&
            book.owner &&
            (typeof book.owner === 'object' ? book.owner._id : book.owner) === currentUser._id ? (
              <span className="owner-listing-tag">{t('detail_own_listing')}</span>
            ) : (
              <>
                <button
                  className="reserve-btn"
                  onClick={handleReserve}
                  disabled={isReserved || submittingReserve}
                >
                  {isReserved ? t('btn_reserve_requested') : t('btn_reserve_request')}
                </button>

                <button
                  className="contact-btn"
                  onClick={() => setShowContactModal(true)}
                  disabled={submittingContact}
                >
                  {t('btn_contact_seller')}
                </button>
              </>
            )}
          </div>

          <dl className="book-detail-meta">
            <div>
              <dt>{t('detail_isbn')}</dt>
              <dd>{book.isbn || t('detail_not_available')}</dd>
            </div>
            <div>
              <dt>{t('detail_state')}</dt>
              <dd>{book.estado || t('detail_not_indicated')}</dd>
            </div>
            <div>
              <dt>{t('detail_editorial')}</dt>
              <dd>{book.editorial || book.publisher || t('detail_not_indicated')}</dd>
            </div>
            <div>
              <dt>{t('detail_publication')}</dt>
              <dd>{book.publicationDate || book.publishedDate || t('detail_not_indicated')}</dd>
            </div>
          </dl>

          {book.description && (
            <div className="book-detail-description">
              <h2>{t('detail_description_title')}</h2>
              <p>{book.description}</p>
            </div>
          )}
        </div>
      </section>

      {/* Contact Seller Modal Overlay */}
      {showContactModal && (
        <div className="contact-modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="contact-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{t('modal_contact_title')}</h3>
            <p>{t('modal_contact_subtitle')}</p>
            <form
              onSubmit={handleContactSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <textarea
                placeholder={t('modal_contact_placeholder')}
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
                  {t('modal_contact_cancel')}
                </button>
                <button
                  type="submit"
                  className="contact-btn"
                  style={{ flex: 2, margin: 0, justifyContent: 'center' }}
                  disabled={submittingContact}
                >
                  {submittingContact ? t('modal_contact_sending') : t('modal_contact_send')}
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
