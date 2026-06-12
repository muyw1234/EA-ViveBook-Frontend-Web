import React, { useState, useEffect } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './MyBooks.css';

export default function MyBooks() {
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
        },
      });
      const resData = response.data.data || response.data;
      if (resData) {
        setBooks(resData.libros || []);
        const newTotalPages = resData.totalPages || 1;
        setTotalPages(newTotalPages);
        setCounts(resData.counts || { uploaded: 0, bought: 0, rented: 0, wishlist: 0 });

        if (page > newTotalPages && newTotalPages > 0) {
          setPage(newTotalPages);
        }
      }
    } catch (error: any) {
      console.error('Error fetching my books:', error);
      toast.error('Error al cargar tus libros');
      if (error.response?.status === 401) {
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [category]);

  useEffect(() => {
    fetchMyBooks();
  }, [category, page]);

  const handleRemoveFromWishlist = async (bookId: string) => {
    try {
      await api.post(`/usuarios/wishlist/${bookId}`);
      toast.success('Libro eliminado de la lista de deseos');
      fetchMyBooks();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      toast.error('No se pudo eliminar el libro de la lista de deseos');
    }
  };

  useEffect(() => {
    fetchMyBooks();
  }, []);

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
      toast.success('Libro eliminado correctamente');
      setEditModalOpen(false);
      fetchMyBooks();
    } catch (error) {
      console.error('Error deleting book:', error);
      toast.error('No se pudo eliminar el libro');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteBook = () => {
    if (
      window.confirm('¿Seguro que quieres eliminar este libro? Esta acción no se puede deshacer.')
    ) {
      performDelete();
    }
  };

  const handleUpdateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle || !editIsbn || !editPrice || !editState) {
      toast.warn('Por favor, rellena todos los campos obligatorios');
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
      toast.success('Libro actualizado con éxito');
      setEditModalOpen(false);
      fetchMyBooks();
    } catch (error) {
      console.error('Error updating book:', error);
      toast.error('Error al actualizar el libro');
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
      toast.error('No se pudo identificar al vendedor');
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
      toast.success('¡Valoración publicada correctamente!');
      setRatingModalOpen(false);
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      let msg = error.response?.data?.message || error.message || 'Error al enviar la valoración';
      if (msg.includes('11000') || msg.toLowerCase().includes('duplicate')) {
        msg = 'Ya has valorado a este usuario por este libro.';
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
      statusText = 'El alquiler todavía no ha empezado';
    } else if (now > end) {
      progress = 100;
      statusText = 'Alquiler finalizado';
    } else {
      const total = end - start;
      const elapsed = now - start;
      progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
      const daysRemaining = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
      statusText = `Quedan ${daysRemaining} días de alquiler`;
    }

    return (
      <div className="rental-status-box">
        <div className="rental-dates">
          <span>📅 {new Date(book.rentalStartDate).toLocaleDateString()}</span>
          <span>hasta</span>
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
        <p>Cargando tu biblioteca personal...</p>
      </div>
    );
  }

  return (
    <div className="mybooks-container">
      <div className="mybooks-header">
        <span className="mybooks-icon">📚</span>
        <h1>Mi Biblioteca</h1>
        <p>Gestiona los libros que has subido, comprado o alquilado.</p>
      </div>

      <div className="mybooks-tabs">
        <button
          className={`tab-btn ${category === 'uploaded' ? 'active' : ''}`}
          onClick={() => setCategory('uploaded')}
        >
          📤 Subidos ({counts.uploaded})
        </button>
        <button
          className={`tab-btn ${category === 'bought' ? 'active' : ''}`}
          onClick={() => setCategory('bought')}
        >
          🛍️ Comprados ({counts.bought})
        </button>
        <button
          className={`tab-btn ${category === 'rented' ? 'active' : ''}`}
          onClick={() => setCategory('rented')}
        >
          🔑 Alquilados ({counts.rented})
        </button>
        <button
          className={`tab-btn ${category === 'wishlist' ? 'active' : ''}`}
          onClick={() => setCategory('wishlist')}
        >
          ❤️ Lista de Deseos ({counts.wishlist})
        </button>
      </div>

      {books.length === 0 ? (
        <div className="empty-books-card">
          <span className="empty-emoji">{category === 'wishlist' ? '💖' : '📖'}</span>
          <h3>
            {category === 'wishlist'
              ? 'Tu lista de deseos está vacía'
              : 'No hay libros en esta categoría'}
          </h3>
          <p>
            {category === 'wishlist'
              ? 'Navega por la tienda y añade los libros que te gustaría leer a tu lista de deseos.'
              : 'Explora ViveBook para encontrar y alquilar o comprar tu próxima lectura.'}
          </p>
          {category === 'uploaded' ? (
            <button className="tab-action-btn" onClick={() => navigate('/home')}>
              Subir mi primer libro
            </button>
          ) : category === 'wishlist' ? (
            <button className="tab-action-btn" onClick={() => navigate('/home')}>
              Explorar Libros
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
                    ✍️ {book.authors?.join(', ') || book.autor || 'Autor Desconocido'}
                  </p>
                  <p className="book-meta">🏷️ ISBN: {book.isbn}</p>
                  <p className="book-meta">
                    ✨ Estado: <span className="book-state">{book.estado || 'Normal'}</span>
                  </p>
                  {(category === 'bought' || category === 'rented') && book.owner && (
                    <p className="book-owner-tag">👤 Vendedor: {book.owner.name}</p>
                  )}
                </div>

                {category === 'rented' && renderRentalStatus(book)}

                <div className="card-bottom-actions">
                  {category === 'uploaded' ? (
                    <button className="action-edit-btn" onClick={() => handleEditPress(book)}>
                      ✏️ Editar o Borrar
                    </button>
                  ) : category === 'wishlist' ? (
                    <div className="wishlist-actions">
                      <button className="action-view-btn" onClick={() => navigate(`/libros/${book._id}`)}>
                        👁️ Ver Detalle
                      </button>
                      <button
                        className="action-remove-wishlist-btn"
                        onClick={() => handleRemoveFromWishlist(book._id)}
                      >
                        💔 Quitar
                      </button>
                    </div>
                  ) : (
                    <button className="action-rate-btn" onClick={() => handleRateSeller(book)}>
                      ⭐ Valorar Vendedor
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
                ◀ Anterior
              </button>
              <span className="pag-info">
                Página {page} de {totalPages}
              </span>
              <button
                className="pag-btn"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Siguiente ▶
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
              <h2>Editar Libro</h2>
              <button className="close-btn" onClick={() => setEditModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleUpdateBook} className="modal-form">
              <div className="form-group">
                <label>Título del libro</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Autor / Autores</label>
                <input
                  type="text"
                  value={editAutor}
                  onChange={(e) => setEditAutor(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  value={editIsbn}
                  onChange={(e) => setEditIsbn(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Precio (€)</label>
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
                <label>Estado del libro</label>
                <select value={editState} onChange={(e) => setEditState(e.target.value)} required>
                  <option value="nuevo">Nuevo</option>
                  <option value="como_nuevo">Como nuevo</option>
                  <option value="buen_estado">Buen estado</option>
                  <option value="usado">Usado</option>
                </select>
              </div>

              <div className="modal-actions-row">
                <button
                  type="button"
                  className="modal-delete-btn"
                  onClick={handleDeleteBook}
                  disabled={updating}
                >
                  🗑️ Eliminar Libro
                </button>
                <div className="right-actions">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setEditModalOpen(false)}
                    disabled={updating}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="modal-save-btn" disabled={updating}>
                    {updating ? 'Guardando...' : 'Guardar cambios'}
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
              <h2>Valorar Vendedor</h2>
              <button className="close-btn" onClick={() => setRatingModalOpen(false)}>
                ×
              </button>
            </div>
            <form onSubmit={submitRating} className="modal-form">
              <p className="rating-subtitle">
                ¿Qué tal fue tu experiencia con <strong>{targetBook.owner?.name}</strong> por el
                libro <strong>{targetBook.title}</strong>?
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
                <label>Comentario u opinión (Opcional)</label>
                <textarea
                  placeholder="Describe cómo fue el trato, el estado del libro, la rapidez en la entrega..."
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
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="modal-submit-rating-btn"
                  disabled={submittingRating}
                >
                  {submittingRating ? 'Publicando...' : 'Publicar valoración'}
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
