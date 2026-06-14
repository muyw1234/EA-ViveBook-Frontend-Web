import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Profile.css';
import RetoService from '../Services/Reto';
import { calculateUserLevel, type UserLevelInfo } from '../../utils/levelHelper';
import type IUsuario from '../../Models/Usuario';
import AvatarFrame from './AvatarFrame';
import Usuario from '../Services/Usuario';
import { unwrapApiData } from '../../utils/apiResponse';
import { clearSession } from '../../utils/session';

export default function Profile() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<Partial<IUsuario>>({}); // con esto ya basta, por favor pedid al agente que sea menos redudante, eliminaria algunos los de abajo pero me da 62 expecptions
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [updating, setUpdating] = useState(false);
  const [isMyProfile, setIsMyProfile] = useState(true);
  const [userLevel, setUserLevel] = useState<UserLevelInfo | null>(null);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState({ averageRating: 0, totalReviews: 0 });
  const [followers, setFollowers] = useState<any[]>([]);

  // Follow/following state for viewing another user
  const [isFollowing, setIsFollowing] = useState(false);

  // Favorites state
  const [favoriteAuthors, setFavoriteAuthors] = useState<string[]>([]);
  const [favoriteBooks, setFavoriteBooks] = useState<any[]>([]);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);

  const [followedEvents, setFollowedEvents] = useState<any[]>([]);

  const [newAuthor, setNewAuthor] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'menu' | 'confirm_soft' | 'confirm_perm'>('menu');
  const [deleting, setDeleting] = useState(false);

  const ALL_CATEGORIES = [
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

  const fetchProfile = async () => {
    setLoading(true);
    try {
      let loggedInUser: any = null;

      // 1. Get logged-in user profile
      try {
        const profileRes = await api.get('/auth/profile');
        loggedInUser = unwrapApiData<any>(profileRes.data);
        setCurrentUser(loggedInUser);
      } catch (err) {
        console.error('Error reading current user profile:', err);
      }

      const activeUserId = userId || loggedInUser?._id;
      if (!activeUserId) {
        toast.error('No se ha podido identificar el perfil a mostrar');
        navigate('/');
        return;
      }

      // Check if we are viewing our own profile
      const myProfile = !userId || userId === loggedInUser?._id;
      setIsMyProfile(myProfile);

      // 2. Fetch the profile details of the target user
      let response;
      if (myProfile) {
        response = { data: loggedInUser };
        try {
          const retosRes = await RetoService.getMisRetos();
          const computedLevel = calculateUserLevel(retosRes);
          setUserLevel(computedLevel);
        } catch (err) {
          console.error('Error fetching user retos for profile:', err);
        }
      } else {
        response = await api.get(`/usuarios/${activeUserId}`);
        setUserLevel(null);
      }

      const u = unwrapApiData<Partial<IUsuario>>(response.data);
      setProfileUser(u);
      // en verdad, con lo de arriba ya es suficiente
      setName(u.name!);
      setEmail(u.email!);
      setDescription(u.description || '');
      setFavoriteAuthors(Array.isArray(u.favoriteAuthors) ? u.favoriteAuthors : []);
      setFavoriteBooks(Array.isArray(u.favoriteBooks) ? u.favoriteBooks : []);
      setFavoriteCategories(Array.isArray(u.favoriteCategories) ? u.favoriteCategories : []);

      setFollowedEvents(Array.isArray(u.eventos) ? u.eventos : []);

      // 3. Fetch reviews & followers count
      if (activeUserId && activeUserId.length === 24) {
        const [reviewsRes, followersRes] = await Promise.all([
          api.get(`/valoraciones/received/${activeUserId}`),
          api.get(`/usuarios/${activeUserId}/followers`),
        ]);
        setReviews(Array.isArray(reviewsRes.data.valoraciones) ? reviewsRes.data.valoraciones : []);
        setStats(reviewsRes.data.stats || { averageRating: 0, totalReviews: 0 });
        setFollowers(Array.isArray(followersRes.data) ? followersRes.data : []);
      }

      // Determine follow status if viewing someone else
      if (!myProfile && loggedInUser) {
        const followingList = Array.isArray(loggedInUser.followingUsers)
          ? loggedInUser.followingUsers.map((item: any) => item._id || item)
          : [];
        setIsFollowing(followingList.includes(activeUserId));
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast.error('Error al cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      toast.warn('El nombre y el correo electrónico son obligatorios');
      return;
    }

    setUpdating(true);
    try {
      const payload = {
        name,
        email,
        description,
        favoriteAuthors,
        favoriteBooks: favoriteBooks
          .map((b: any) => (typeof b === 'object' && b !== null ? b._id : b))
          .filter((id: any) => typeof id === 'string' && /^[0-9a-fA-F]{24}$/.test(id)),
        favoriteCategories,
      };

      const response = await Usuario.updateUsuario(profileUser, payload); // lo he tenido que refactorizar y extraer. Recordad de que tenemos la capa de servicios.
      if (response.status === 200) {
        setProfileUser(response.data);
        setIsEditing(false);
        toast.success('Perfil actualizado correctamente');
        fetchProfile();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error('Error al guardar los cambios del perfil');
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUser) {
      toast.warn('Debes iniciar sesión para seguir a otros usuarios');
      return;
    }

    try {
      let updatedFollowing = Array.isArray(currentUser.followingUsers)
        ? currentUser.followingUsers.map((item: any) => item._id || item)
        : [];

      if (isFollowing) {
        updatedFollowing = updatedFollowing.filter((id: string) => id !== profileUser._id);
        setIsFollowing(false);
        setFollowers((prev) => prev.filter((item) => item._id !== currentUser._id));
        toast.success(`Has dejado de seguir a ${profileUser.name}`);
      } else {
        updatedFollowing.push(profileUser._id);
        setIsFollowing(true);
        setFollowers((prev) => [...prev, currentUser]);
        toast.success(`Ahora sigues a ${profileUser.name}`);
      }

      await api.put(`/usuarios/${currentUser._id}`, {
        followingUsers: updatedFollowing,
      });

      const updatedUser = { ...currentUser, followingUsers: updatedFollowing };
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error('No se pudo procesar la acción de seguimiento');
    }
  };

  const logout = () => {
    clearSession();
    navigate('/');
  };

  const executeSoftDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/usuarios/${profileUser._id}`);
      toast.success('Tu cuenta ha sido desactivada con éxito');
      logout();
    } catch (error) {
      console.error('Error deleting profile (soft):', error);
      toast.error('No se pudo desactivar tu cuenta');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setDeleteStep('menu');
    }
  };

  const executePermanentDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/usuarios/permanent/${profileUser._id}`);
      toast.success('Tu cuenta ha sido eliminada de forma permanente');
      logout();
    } catch (error) {
      console.error('Error deleting profile (permanent):', error);
      toast.error('No se pudo eliminar permanentemente tu cuenta');
    } finally {
      setDeleting(false);
      setDeleteModalOpen(false);
      setDeleteStep('menu');
    }
  };

  const handleAddAuthor = () => {
    const author = newAuthor.trim();
    if (author && !favoriteAuthors.includes(author)) {
      if (favoriteAuthors.length >= 5) {
        toast.warn('Límite de 5 autores favoritos alcanzado');
        return;
      }
      setFavoriteAuthors([...favoriteAuthors, author]);
      setNewAuthor('');
    }
  };

  const handleToggleCategory = (cat: string) => {
    if (favoriteCategories.includes(cat)) {
      setFavoriteCategories(favoriteCategories.filter((c) => c !== cat));
    } else {
      setFavoriteCategories([...favoriteCategories, cat]);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="spinner"></div>
        <p>Cargando información del perfil...</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-error">
        <h3>Error al cargar</h3>
        <p>No se pudo cargar el perfil del usuario solicitado.</p>
        <button onClick={fetchProfile} className="retry-btn">
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Top Banner Profile Details */}
      <div className="profile-header-card">
        {/* <div className="profile-avatar">{(name || 'U').substring(0, 2).toUpperCase()}</div> */}
        <AvatarFrame avatar={profileUser.avatar} name={name} />
        <div className="profile-main-info">
          <h1>{name}</h1>
          <p className="profile-email">✉ {email}</p>
          <div className="profile-stats-row">
            <div className="stat-box">
              <span className="stat-num">{followers.length}</span>
              <span className="stat-label">Seguidores</span>
            </div>
            {stats.totalReviews > 0 && (
              <div className="stat-box">
                <span className="stat-num rating">
                  {'★'.repeat(Math.max(0, Math.round(stats.averageRating)))}
                  {'☆'.repeat(Math.max(0, 5 - Math.round(stats.averageRating)))}{' '}
                  {stats.averageRating}
                </span>
                <span className="stat-label">({stats.totalReviews} Valoraciones)</span>
              </div>
            )}
            {isMyProfile && userLevel && (
              <div className="stat-box level-badge-box">
                <span className="stat-num">
                  {userLevel.medal || '❔'} {userLevel.levelName}
                </span>
                <span className="stat-label">
                  Nivel ({userLevel.completedCount} / {userLevel.totalCount} Retos)
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="profile-header-actions">
          {isMyProfile ? (
            <div className="profile-my-actions">
              {!isEditing && (
                <button className="edit-profile-btn" onClick={() => setIsEditing(true)}>
                  ✏️ Editar Perfil
                </button>
              )}
              <button className="edit-profile-btn" onClick={logout}>
                🚪 Cerrar Sesión
              </button>
            </div>
          ) : (
            <button
              className={`follow-profile-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleToggleFollow}
            >
              {isFollowing ? '👥 Siguiendo' : '👤 Seguir'}
            </button>
          )}
        </div>
      </div>

      <div className="profile-content-grid">
        {/* Left Card: Info, Favorites, Wishlist & Events */}
        <div className="profile-details-card">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="profile-edit-form">
              <h3>Editar mi Información</h3>

              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group"></div>

              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group container">
                <input
                  className="form-control"
                  type="file"
                  src="./"
                  id="imageSelector"
                  alt="Cambiar avatar"
                  /* T-T Por favor comprobad el codigo antes de subir al repositorio, lo he tenido que volver a añadir. */
                  onChange={(e) => {
                    async function update(data: FormData) {
                      const user = await Usuario.changeAvatar(data, profileUser);
                      setProfileUser(user!);
                    }
                    const file = e.target.files![0];
                    //toast(JSON.stringify(path)); // aqui no aparece
                    //console.log(path);
                    const formData: FormData = new FormData();
                    formData.append('file', file);
                    // no es lo mejor ponerlo asi, la subida de la imagen tendria que hacerlo al Subir el Libro
                    update(formData);
                  }}
                />
              </div>

              <div className="form-group">
                <label>Sobre Mí (Biografía)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Cuéntanos un poco sobre ti, tus gustos de lectura, etc..."
                  rows={4}
                />
              </div>

              <hr />

              <h4 className="favorites-heading">Mis Preferencias & Favoritos</h4>

              <div className="form-group">
                <label>Autores Favoritos (Máx 5)</label>
                <div className="input-with-btn">
                  <input
                    type="text"
                    placeholder="Añadir un autor..."
                    value={newAuthor}
                    onChange={(e) => setNewAuthor(e.target.value)}
                  />
                  <button type="button" onClick={handleAddAuthor}>
                    +
                  </button>
                </div>
                <div className="chips-row">
                  {favoriteAuthors.map((author, index) => (
                    <span key={`author-${index}`} className="tag-chip">
                      {author}
                      <button
                        type="button"
                        className="chip-remove"
                        onClick={() =>
                          setFavoriteAuthors(favoriteAuthors.filter((_, i) => i !== index))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Libros Favoritos (Gestionables desde el detalle del libro)</label>
                <p
                  className="favorites-helper-text"
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text)',
                    opacity: 0.8,
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  Añade libros a tus favoritos visitando la página de detalles de cada libro. Puedes
                  eliminar favoritos actuales pulsando en la tecla &quot;×&quot; a continuación.
                </p>
                <div className="chips-row">
                  {favoriteBooks.map((book, index) => {
                    const bookTitle = typeof book === 'object' && book !== null ? book.title : book;
                    return (
                      <span key={`book-${index}`} className="tag-chip static favorite-chip">
                        ⭐ {bookTitle}
                        <button
                          type="button"
                          className="chip-remove"
                          onClick={() =>
                            setFavoriteBooks(favoriteBooks.filter((_, i) => i !== index))
                          }
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="form-group">
                <label>Categorías Literarias Favoritas</label>
                <button
                  type="button"
                  className="dropdown-toggle-btn"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                >
                  Seleccionar categorías {categoryDropdownOpen ? '▲' : '▼'}
                </button>

                {categoryDropdownOpen && (
                  <div className="categories-dropdown">
                    {ALL_CATEGORIES.map((cat) => {
                      const isSelected = favoriteCategories.includes(cat);
                      return (
                        <label key={cat} className="dropdown-item">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleCategory(cat)}
                          />
                          {cat}
                        </label>
                      );
                    })}
                  </div>
                )}

                <div className="chips-row margin-top">
                  {favoriteCategories.map((cat) => (
                    <span key={cat} className="tag-chip category">
                      {cat}
                      <button
                        type="button"
                        className="chip-remove"
                        onClick={() =>
                          setFavoriteCategories(favoriteCategories.filter((c) => c !== cat))
                        }
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="form-actions-row">
                <button
                  type="button"
                  className="delete-acc-btn"
                  onClick={() => {
                    setDeleteStep('menu');
                    setDeleteModalOpen(true);
                  }}
                >
                  🗑️ Borrar Cuenta
                </button>
                <div className="right-btn-group">
                  <button
                    type="button"
                    className="edit-cancel-btn"
                    onClick={() => {
                      setIsEditing(false);
                      setName(profileUser.name!);
                      setEmail(profileUser.email!);
                      setDescription(profileUser.description || '');
                      setFavoriteAuthors(profileUser.favoriteAuthors || []);
                      setFavoriteBooks(profileUser.favoriteBooks || []);
                      setFavoriteCategories(profileUser.favoriteCategories || []);
                    }}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="edit-save-btn" disabled={updating}>
                    {updating ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="profile-details-view">
              <div className="details-section">
                <h3>Sobre Mí</h3>
                <p className="description-text">
                  {profileUser.description || 'Este lector aún no ha escrito una biografía.'}
                </p>
              </div>

              <hr />

              {(Array.isArray(profileUser.favoriteAuthors) &&
                profileUser.favoriteAuthors.length > 0) ||
              (Array.isArray(profileUser.favoriteBooks) && profileUser.favoriteBooks.length > 0) ||
              (Array.isArray(profileUser.favoriteCategories) &&
                profileUser.favoriteCategories.length > 0) ? (
                <div className="details-section">
                  <h3>Mis Favoritos</h3>

                  {Array.isArray(profileUser.favoriteAuthors) &&
                    profileUser.favoriteAuthors.length > 0 && (
                      <div className="fav-subset">
                        <span className="fav-label">✍️ Autores favoritos</span>
                        <p className="fav-value">{profileUser.favoriteAuthors.join(', ')}</p>
                      </div>
                    )}

                  {Array.isArray(profileUser.favoriteBooks) &&
                    profileUser.favoriteBooks.length > 0 && (
                      <div className="fav-subset">
                        <span className="fav-label">📚 Libros favoritos</span>
                        <div className="chips-row" style={{ marginTop: '0.5rem' }}>
                          {profileUser.favoriteBooks.map((book: any) => {
                            const bookTitle =
                              typeof book === 'object' && book !== null ? book.title : 'Libro';
                            const bookId =
                              typeof book === 'object' && book !== null ? book._id : book;
                            return (
                              <span
                                key={bookId}
                                className="tag-chip static favorite-chip"
                                onClick={() => navigate(`/libros/${bookId}`)}
                                style={{ cursor: 'pointer' }}
                                title="Haga clic para ver el detalle del libro"
                              >
                                ⭐ {bookTitle}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}

                  {Array.isArray(profileUser.favoriteCategories) &&
                    profileUser.favoriteCategories.length > 0 && (
                      <div className="fav-subset">
                        <span className="fav-label">🏷️ Géneros favoritos</span>
                        <div className="chips-row">
                          {profileUser.favoriteCategories.map((cat: string) => (
                            <span key={cat} className="tag-chip static">
                              {cat}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <p className="no-favs-yet">Este lector aún no ha seleccionado favoritos.</p>
              )}

              {/* Wishlist Section */}
              <hr />
              <div className="details-section">
                <h3>Lista de Deseos</h3>
                {Array.isArray(profileUser.wishlist) && profileUser.wishlist.length > 0 ? (
                  <div className="chips-row">
                    {profileUser.wishlist.map((book: any) => {
                      const bookTitle = typeof book === 'object' ? book.title : 'Libro';
                      const bookId = typeof book === 'object' ? book._id : book;
                      return (
                        <span
                          key={bookId}
                          className="tag-chip static wishlist-chip"
                          onClick={() => navigate(`/libros/${bookId}`)}
                          style={{ cursor: 'pointer' }}
                          title="Haga clic para ver el detalle del libro"
                        >
                          📖 {bookTitle}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-favs-yet">No hay libros en la lista de deseos.</p>
                )}
              </div>

              {/* 🚀 NUEVO: Sección de Eventos Seguidos */}
              <hr />
              <div className="details-section">
                <h3>Eventos Seguidos</h3>
                {followedEvents.length > 0 ? (
                  <div className="chips-row">
                    {followedEvents.map((evento: any) => {
                      const eventTitle = typeof evento === 'object' ? evento.title : 'Evento';
                      const eventId = typeof evento === 'object' ? evento._id : evento;
                      return (
                        <span
                          key={eventId}
                          className="tag-chip static followed-event-chip"
                          onClick={() => navigate(`/eventos/${eventId}`)} // Navega a la ruta de tu evento
                          style={{
                            cursor: 'pointer',
                            backgroundColor: '#e3f2fd',
                            color: '#0d47a1',
                          }} // Un color azulado de ejemplo
                          title="Haga clic para ver el detalle del evento"
                        >
                          📅 {eventTitle}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-favs-yet">No estás siguiendo ningún evento.</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Card: Reviews Received */}
        <div className="profile-reviews-card">
          <h2>Valoraciones como vendedor</h2>
          {reviews.length === 0 ? (
            <p className="no-reviews-msg">
              Este usuario aún no ha recibido valoraciones como vendedor.
            </p>
          ) : (
            <div className="reviews-feed">
              {reviews.map((rev) => (
                <div key={rev._id} className="review-item">
                  <div className="review-item-header">
                    <span className="reviewer-name">{rev.usuarioAutor?.name}</span>
                    <span className="review-stars">
                      {'★'.repeat(Math.max(0, rev.puntuacion || 0)) +
                        '☆'.repeat(Math.max(0, 5 - (rev.puntuacion || 0)))}
                    </span>
                  </div>
                  {rev.libro && (
                    <span className="review-book-title">
                      Libro: {rev.libro.title}{' '}
                      {rev.tipoOperacion ? `(${rev.tipoOperacion.toLowerCase()})` : ''}
                    </span>
                  )}
                  {rev.comentario && <p className="review-text">&quot;{rev.comentario}&quot;</p>}
                  <span className="review-date">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Account Deletion Modal */}
      {deleteModalOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-content text-center" onClick={(e) => e.stopPropagation()}>
            {deleteStep === 'menu' && (
              <>
                <h2>Eliminar Cuenta o Modo Vacaciones</h2>
                <p className="delete-warning-text">
                  ¿Qué deseas hacer? Puedes activar el Modo Vacaciones (desactivación temporal de la
                  cuenta) o eliminar tu cuenta de forma permanente.
                </p>
                <div className="delete-actions-column">
                  <button className="temp-delete-btn" onClick={() => setDeleteStep('confirm_soft')}>
                    🌴 Activar Modo Vacaciones
                  </button>
                  <button className="perm-delete-btn" onClick={() => setDeleteStep('confirm_perm')}>
                    🗑️ Eliminar Cuenta Permanente
                  </button>
                  <button
                    className="modal-cancel-btn full-width"
                    onClick={() => setDeleteModalOpen(false)}
                  >
                    Cancelar
                  </button>
                </div>
              </>
            )}

            {deleteStep === 'confirm_soft' && (
              <>
                <h2>Confirmar Modo Vacaciones</h2>
                <p className="delete-warning-text">
                  Al activar el Modo Vacaciones, tu perfil y tus libros subidos se ocultarán del
                  catálogo público de ViveBook. Podrás reactivarlos automáticamente en cualquier
                  momento volviendo a iniciar sesión.
                </p>
                <div className="delete-actions-column">
                  <button
                    className="temp-delete-confirm-btn"
                    onClick={executeSoftDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Activando...' : 'Sí, Activar Modo Vacaciones'}
                  </button>
                  <button
                    className="modal-cancel-btn full-width"
                    onClick={() => setDeleteStep('menu')}
                    disabled={deleting}
                  >
                    Volver atrás
                  </button>
                </div>
              </>
            )}

            {deleteStep === 'confirm_perm' && (
              <>
                <h2>⚠️ ALERTA: Confirmar Borrado Permanente</h2>
                <p className="delete-warning-text danger">
                  Esta acción eliminará de forma irreversible tus valoraciones, biblioteca, chats y
                  datos personales de nuestro sistema.
                </p>
                <div className="delete-actions-column">
                  <button
                    className="perm-delete-confirm-btn"
                    onClick={executePermanentDelete}
                    disabled={deleting}
                  >
                    {deleting ? 'Eliminando...' : 'Sí, borrar definitivamente'}
                  </button>
                  <button
                    className="modal-cancel-btn full-width"
                    onClick={() => setDeleteStep('menu')}
                    disabled={deleting}
                  >
                    Volver atrás
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
