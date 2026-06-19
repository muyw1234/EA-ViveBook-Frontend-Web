import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import { unwrapApiData } from '../../utils/apiResponse';
import { normalizeLibros } from '../../utils/libro';
import './MyBooks.css';

export default function MyBooks() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [books, setBooks] = useState<any[]>([]);
  const [counts, setCounts] = useState<{
    uploaded: number;
    bought: number;
    rented: number;
    wishlist: number;
  }>({ uploaded: 0, bought: 0, rented: 0, wishlist: 0 });
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('uploaded'); // 'uploaded', 'bought', 'rented', 'wishlist'
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const ITEMS_PER_PAGE = 6;

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editAutor, setEditAutor] = useState('');
  const [editIsbn, setEditIsbn] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editState, setEditState] = useState('');
  const [updating, setUpdating] = useState(false);

  // Rating Modal State
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [targetBook, setTargetBook] = useState<any>(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  const fetchMyBooks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/auth/profile/libros', {
        params: {
          category,
          page,
          limit: ITEMS_PER_PAGE,
          search: searchQuery,
        },
      });
      const resData = unwrapApiData<any>(response.data);
      if (resData) {
        setBooks(normalizeLibros(resData.libros));
        const newTotalPages = resData.totalPages || 1;
        setTotalPages(newTotalPages);
        setCounts(resData.counts || { uploaded: 0, bought: 0, rented: 0, wishlist: 0 });

        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }
      }
    } catch (error: any) {
      console.error('Error fetching my books:', error);
      toast.error(t('myBooks.toasts.load_error'));
      if (error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    setSearchQuery('');
  }, [category]);

  useEffect(() => {
    fetchMyBooks();
  }, [category, page, searchQuery]);

  const handleRemoveFromWishlist = async (bookId: string) => {
    try {
      await api.post(`/usuarios/wishlist/${bookId}`);
      toast.success(t('myBooks.toasts.wishlist_remove_success'));
      fetchMyBooks();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error(t('myBooks.toasts.wishlist_remove_error'));
    }
  };

  const handleEditPress = (book: any) => {
    setEditingBook(book);
    setEditTitle(book.title);
    setEditAutor(book.authors?.join(', ') || book.autor || '');
    setEditIsbn(book.isbn);
    setEditPrice(book.precio.toString());
    setEditState(book.estado || 'buen_estado');
    setEditModalOpen(true);
  };

  const performDelete = async () => {
    setUpdating(true);
    try {
      await api.delete(`/libros/${editingBook._id}`);
      toast.success(t('myBooks.toasts.delete_success'));
      setEditModalOpen(false);
      fetchMyBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error(t('myBooks.toasts.delete_error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteBook = () => {
    if (window.confirm(t('myBooks.toasts.confirm_delete'))) {
      performDelete();
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editIsbn || !editPrice || !editState) {
      toast.warn(t('myBooks.toasts.warn_fields'));
      return;
    }

    setUpdating(true);
    try {
      await api.put(`/libros/${editingBook._id}`, {
        title: editTitle,
        authors: [editAutor],
        isbn: editIsbn,
        precio: parseFloat(editPrice),
        estado: editState,
        type: editingBook.type,
      });
      toast.success(t('myBooks.toasts.update_success'));
      setEditModalOpen(false);
      fetchMyBooks();
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error(t('myBooks.toasts.update_error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleRateSeller = (book: any) => {
    setTargetBook(book);
    setRatingValue(5);
    setRatingComment('');
    setRatingModalOpen(true);
  };

  const submitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetBook) return;

    const ownerId = typeof targetBook.owner === 'object' ? targetBook.owner._id : targetBook.owner;
    if (!ownerId) {
      toast.error(t('myBooks.toasts.seller_identify_error'));
      return;
    }

    setSubmittingRating(true);
    try {
      const payload = {
        usuarioValorado: ownerId,
        libro: targetBook._id,
        tipoOperacion: targetBook.type,
        puntuacion: ratingValue,
        comentario: ratingComment,
      };

      await api.post('/valoraciones', payload);
      toast.success(t('myBooks.toasts.rating_success'));
      setRatingModalOpen(false);
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      let msg = error.response?.data?.message || error.message || t('myBooks.toasts.rating_error');
      if (msg.includes('11000') || msg.toLowerCase().includes('duplicate')) {
        msg = t('myBooks.toasts.rating_duplicate');
      }
      toast.error(msg);
    } finally {
      setSubmittingRating(false);
    }
  };

  const renderRentalStatus = (book: any) => {
    if (!book.rentalStartDate || !book.rentalEndDate) return null;

    const start = new Date(book.rentalStartDate).getTime();
    const end = new Date(book.rentalEndDate).getTime();
    const now = Date.now();

    let progress = 0;
    let statusText = '';

    if (now < start) {
      progress = 0;
      statusText = t('myBooks.rental.not_started');
    } else if (now > end) {
      progress = 100;
      statusText = t('myBooks.rental.finished');
    } else {
      const total = end - start;
      const elapsed = now - start;
      progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
      const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      statusText = t('myBooks.rental.remaining', { days: daysRemaining });
    }

    return (
      <div className="rental-status-box">
        <div className="rental-dates">
          <span>📅 {new Date(book.rentalStartDate).toLocaleDateString()}</span>
          <span>{t('myBooks.rental.until')}</span>
          <span>{new Date(book.rentalEndDate).toLocaleDateString()}</span>
        </div>
        <div className="rental-progress-bg">
          <div className="rental-progress-bar" style={{ width: `${progress}%` }}></div>
        </div>
        <span className="rental-status-text">{statusText}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mybooks-loading">
        <div className="spinner"></div>
        <p>{t('myBooks.loading')}</p>
      </div>
    );
  }

  return (
    <div className="mybooks-container">
      <div className="mybooks-header">
        <span className="mybooks-icon">📚</span>
        <h1>{t('myBooks.title')}</h1>
        <p>{t('myBooks.subtitle')}</p>
      </div>

      <div className="mybooks-search-container">
        <input
          type="text"
          placeholder={t('myBooks.search_placeholder')}
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setPage(1);
          }}
          className="mybooks-search-input"
        />
        {searchQuery && (
          <button
            className="clear-search-btn"
            onClick={() => {
              setSearchQuery('');
              setPage(1);
            }}
          >
            ×
          </button>
        )}
      </div>

      <div className="mybooks-tabs">
        <button
          className={`tab-btn ${category === 'uploaded' ? 'active' : ''}`}
          onClick={() => setCategory('uploaded')}
        >
          {t('myBooks.tabs.uploaded', { count: counts.uploaded })}
        </button>
        <button
          className={`tab-btn ${category === 'bought' ? 'active' : ''}`}
          onClick={() => setCategory('bought')}
        >
          {t('myBooks.tabs.bought', { count: counts.bought })}
        </button>
        <button
          className={`tab-btn ${category === 'rented' ? 'active' : ''}`}
          onClick={() => setCategory('rented')}
        >
          {t('myBooks.tabs.rented', { count: counts.rented })}
        </button>
        <button
          className={`tab-btn ${category === 'wishlist' ? 'active' : ''}`}
          onClick={() => setCategory('wishlist')}
        >
          {t('myBooks.tabs.wishlist', { count: counts.wishlist })}
        </button>
      </div>

      {books.length === 0 ? (
        <div className="empty-books-card">
          <span className="empty-emoji">{category === 'wishlist' ? '💖' : '📖'}</span>
          <h3>
            {category === 'wishlist'
              ? t('myBooks.empty.wishlist_title')
              : t('myBooks.empty.default_title')}
          </h3>
          <p>
            {category === 'wishlist'
              ? t('myBooks.empty.wishlist_desc')
              : t('myBooks.empty.default_desc')}
          </p>
          {category === 'uploaded' ? (
            <button className="tab-action-btn" onClick={() => navigate('/home')}>
              {t('myBooks.empty.btn_first_book')}
            </button>
          ) : category === 'wishlist' ? (
            <button className="tab-action-btn" onClick={() => navigate('/home')}>
              {t('myBooks.empty.btn_explore')}
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="mybooks-grid">
            {books.map((book) => (
              <div key={book._id} className="mybooks-card">
                <div className="card-top">
                  <div className="book-badge" data-type={book.type}>
                    {book.type}
                  </div>
                  <div className="book-price">{book.precio}€</div>
                </div>
                <div className="card-mid">
                  <h3 className="book-title" title={book.title}>
                    {book.title}
                  </h3>
                  <p className="book-meta">
                    ✍️ {book.authors?.join(', ') || book.autor || t('myBooks.card.unknown_author')}
                  </p>
                  <p className="book-meta">{t('myBooks.card.isbn', { isbn: book.isbn })}</p>
                  <p className="book-meta">
                    {t('myBooks.card.state')}
                    <span className="book-state">
                      {book.estado
                        ? t(`myBooks.modals.edit.states.${book.estado}`, {
                            defaultValue: book.estado,
                          })
                        : 'Normal'}
                    </span>
                  </p>
                  {(category === 'bought' || category === 'rented') && book.owner && (
                    <p className="book-owner-tag">
                      {t('myBooks.card.seller', { name: book.owner.name })}
                    </p>
                  )}
                </div>

                {category === 'rented' && renderRentalStatus(book)}

                <div className="card-bottom-actions">
                  {category === 'uploaded' ? (
                    <button className="action-edit-btn" onClick={() => handleEditPress(book)}>
                      {t('myBooks.card.btn_edit_delete')}
                    </button>
                  ) : category === 'wishlist' ? (
                    <div className="wishlist-actions">
                      <button
                        className="action-view-btn"
                        onClick={() => navigate(`/libros/${book._id}`)}
                      >
                        {t('myBooks.card.btn_view_detail')}
                      </button>
                      <button
                        className="action-remove-wishlist-btn"
                        onClick={() => handleRemoveFromWishlist(book._id)}
                      >
                        {t('myBooks.card.btn_remove')}
                      </button>
                    </div>
                  ) : (
                    <button className="action-rate-btn" onClick={() => handleRateSeller(book)}>
                      {t('myBooks.card.btn_rate_seller')}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mybooks-pagination">
              <button
                className="pag-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                {t('myBooks.pagination.prev')}
              </button>
              <span className="pag-info">{t('myBooks.pagination.info', { page, totalPages })}</span>
              <button
                className="pag-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                {t('myBooks.pagination.next')}
              </button>
            </div>
          )}
        </>
      )}

      {/* Edit Book Modal */}
      {editModalOpen && editingBook && (
        <div className="modal-overlay" onClick={() => setEditModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('myBooks.modals.edit.title')}</h2>
              <button className="close-btn" onClick={() => setEditModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateBook} className="modal-form">
              <div className="form-group">
                <label>{t('myBooks.modals.edit.label_title')}</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('myBooks.modals.edit.label_author')}</label>
                <input
                  type="text"
                  value={editAutor}
                  onChange={(e) => setEditAutor(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('myBooks.modals.edit.label_isbn')}</label>
                <input
                  type="text"
                  value={editIsbn}
                  onChange={(e) => setEditIsbn(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('myBooks.modals.edit.label_price')}</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>{t('myBooks.modals.edit.label_state')}</label>
                <select value={editState} onChange={(e) => setEditState(e.target.value)} required>
                  <option value="nuevo">{t('myBooks.modals.edit.states.nuevo')}</option>
                  <option value="como_nuevo">{t('myBooks.modals.edit.states.como_nuevo')}</option>
                  <option value="buen_estado">{t('myBooks.modals.edit.states.buen_estado')}</option>
                  <option value="usado">{t('myBooks.modals.edit.states.usado')}</option>
                </select>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="modal-delete-btn"
                  onClick={handleDeleteBook}
                  disabled={updating}
                >
                  {t('myBooks.modals.edit.btn_delete')}
                </button>
                <div className="right-actions">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setEditModalOpen(false)}
                    disabled={updating}
                  >
                    {t('myBooks.modals.edit.btn_cancel')}
                  </button>
                  <button type="submit" className="modal-save-btn" disabled={updating}>
                    {updating
                      ? t('myBooks.modals.edit.btn_saving')
                      : t('myBooks.modals.edit.btn_save')}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rating Modal */}
      {ratingModalOpen && targetBook && (
        <div className="modal-overlay" onClick={() => setRatingModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t('myBooks.modals.rating.title')}</h2>
              <button className="close-btn" onClick={() => setRatingModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={submitRating} className="modal-form">
              <p className="rating-subtitle">
                {t('myBooks.modals.rating.subtitle', {
                  name: targetBook.owner?.name,
                  title: targetBook.title,
                })}
              </p>

              <div className="stars-rating-container">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-select-btn ${star <= ratingValue ? 'selected' : ''}`}
                    onClick={() => setRatingValue(star)}
                  >
                    ★
                  </button>
                ))}
              </div>

              <div className="form-group">
                <label>{t('myBooks.modals.rating.label_comment')}</label>
                <textarea
                  placeholder={t('myBooks.modals.rating.placeholder_comment')}
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="modal-actions-row justify-end">
                <button
                  type="button"
                  className="modal-cancel-btn"
                  onClick={() => setRatingModalOpen(false)}
                  disabled={submittingRating}
                >
                  {t('myBooks.modals.rating.btn_cancel')}
                </button>
                <button
                  type="submit"
                  className="modal-submit-rating-btn"
                  disabled={submittingRating}
                >
                  {submittingRating
                    ? t('myBooks.modals.rating.btn_submitting')
                    : t('myBooks.modals.rating.btn_submit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
