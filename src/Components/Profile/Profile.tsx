import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { toast } from 'react-toastify'; //ToastContainer
import 'react-toastify/dist/ReactToastify.css';
import './Profile.css';
import RetoService from '../Services/Reto';
import { calculateUserLevel, type UserLevelInfo } from '../../utils/levelHelper';
import type IUsuario from '../../Models/Usuario';
import AvatarFrame from './AvatarFrame';
import Usuario from '../Services/Usuario';
import { unwrapApiData } from '../../utils/apiResponse';
import { clearSession } from '../../utils/session';
import socket from '../../Services/socket';

export default function Profile() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();

  const [currentUser, setCurrentUser] = useState<any>(null);
  const [profileUser, setProfileUser] = useState<Partial<IUsuario>>({});
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
        toast.error(t('profile.toasts.id_error'));
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
      toast.error(t('profile.toasts.load_error'));
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
      toast.warn(t('profile.toasts.required_fields'));
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

      const response = await Usuario.updateUsuario(profileUser, payload);
      if (response.status === 200) {
        setProfileUser(response.data);
        setIsEditing(false);
        toast.success(t('profile.toasts.update_success'));
        fetchProfile();
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(t('profile.toasts.update_error'));
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUser) {
      toast.warn(t('profile.toasts.login_required_follow'));
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
        toast.success(t('profile.toasts.unfollow_success', { name: profileUser.name }));
      } else {
        updatedFollowing.push(profileUser._id);
        setIsFollowing(true);
        setFollowers((prev) => [...prev, currentUser]);
        toast.success(t('profile.toasts.follow_success', { name: profileUser.name }));
      }

      await api.put(`/usuarios/${currentUser._id}`, {
        followingUsers: updatedFollowing,
      });

      const updatedUser = { ...currentUser, followingUsers: updatedFollowing };
      setCurrentUser(updatedUser);
    } catch (error) {
      console.error('Error toggling follow:', error);
      toast.error(t('profile.toasts.follow_error'));
    }
  };

  const logout = () => {
    clearSession();
    if (socket.connected) {
      socket.disconnect();
    }
    navigate('/');
  };

  const executeSoftDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/usuarios/${profileUser._id}`);
      toast.success(t('profile.toasts.vacation_success'));
      logout();
    } catch (error) {
      console.error('Error deleting profile (soft):', error);
      toast.error(t('profile.toasts.vacation_error'));
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
      toast.success(t('profile.toasts.delete_success'));
      logout();
    } catch (error) {
      console.error('Error deleting profile (permanent):', error);
      toast.error(t('profile.toasts.delete_error'));
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
        toast.warn(t('profile.toasts.author_limit'));
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
        <p>{t('profile.loading')}</p>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="profile-error">
        <h3>{t('profile.error_title')}</h3>
        <p>{t('profile.error_desc')}</p>
        <button onClick={fetchProfile} className="retry-btn">
          {t('profile.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-header-card">
        <AvatarFrame avatar={profileUser.avatar} name={name} />
        <div className="profile-main-info">
          <h1>{name}</h1>
          <p className="profile-email">✉ {email}</p>
          <div className="profile-stats-row">
            <div className="stat-box">
              <span className="stat-num">{followers.length}</span>
              <span className="stat-label">{t('profile.followers')}</span>
            </div>
            {stats.totalReviews > 0 && (
              <div className="stat-box">
                <span className="stat-num rating">
                  {'★'.repeat(Math.max(0, Math.round(stats.averageRating)))}
                  {'☆'.repeat(Math.max(0, 5 - Math.round(stats.averageRating)))}{' '}
                  {stats.averageRating}
                </span>
                <span className="stat-label">
                  ({stats.totalReviews} {t('profile.ratings')})
                </span>
              </div>
            )}
            {isMyProfile && userLevel && (
              <div className="stat-box level-badge-box">
                <span className="stat-num">
                  {userLevel.medal || '❔'} {userLevel.levelName}
                </span>
                <span className="stat-label">
                  {t('profile.level', {
                    completed: userLevel.completedCount,
                    total: userLevel.totalCount,
                  })}
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
                  ✏️ {t('profile.edit_profile')}
                </button>
              )}
              <button className="edit-profile-btn" onClick={logout}>
                🚪 {t('profile.logout')}
              </button>
            </div>
          ) : (
            <button
              className={`follow-profile-btn ${isFollowing ? 'following' : ''}`}
              onClick={handleToggleFollow}
            >
              {isFollowing ? `👥 ${t('profile.following')}` : `👤 ${t('profile.follow')}`}
            </button>
          )}
        </div>
      </div>

      <div className="profile-content-grid">
        <div className="profile-details-card">
          {isEditing ? (
            <form onSubmit={handleUpdate} className="profile-edit-form">
              <h3>{t('profile.edit_info')}</h3>

              <div className="form-group">
                <label>{t('profile.name')}</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group"></div>

              <div className="form-group">
                <label>{t('profile.email')}</label>
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
                  alt={t('profile.change_avatar')}
                  onChange={(e) => {
                    async function update(data: FormData) {
                      const user = await Usuario.changeAvatar(data, profileUser);
                      setProfileUser(user!);
                    }
                    const file = e.target.files![0];
                    const formData: FormData = new FormData();
                    formData.append('file', file);
                    update(formData);
                  }}
                />
              </div>

              <div className="form-group">
                <label>{t('profile.about_me_title')}</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t('profile.bio_placeholder')}
                  rows={4}
                />
              </div>

              <hr />

              <h4 className="favorites-heading">{t('profile.my_favorites')}</h4>

              <div className="form-group">
                <label>{t('profile.fav_authors_max')}</label>
                <div className="input-with-btn">
                  <input
                    type="text"
                    placeholder={t('profile.add_author_placeholder')}
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
                <label>{t('profile.fav_books_manage')}</label>
                <p
                  className="favorites-helper-text"
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text)',
                    opacity: 0.8,
                    margin: '0 0 0.5rem 0',
                  }}
                >
                  {t('profile.fav_books_desc')}
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
                <label>{t('profile.fav_categories_label')}</label>
                <button
                  type="button"
                  className="dropdown-toggle-btn"
                  onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                >
                  {t('profile.select_categories')} {categoryDropdownOpen ? '▲' : '▼'}
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
                          {t(`profile.categories.${cat}`)}
                        </label>
                      );
                    })}
                  </div>
                )}

                <div className="chips-row margin-top">
                  {favoriteCategories.map((cat) => (
                    <span key={cat} className="tag-chip category">
                      {t(`profile.categories.${cat}`)}
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
                  🗑️ {t('profile.delete_account_btn')}
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
                    {t('profile.cancel')}
                  </button>
                  <button type="submit" className="edit-save-btn" disabled={updating}>
                    {updating ? t('profile.saving') : t('profile.save_changes')}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="profile-details-view">
              <div className="details-section">
                <h3>{t('profile.about_me_title')}</h3>
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
                  <h3>{t('profile.my_favorites')}</h3>

                  {Array.isArray(profileUser.favoriteAuthors) &&
                    profileUser.favoriteAuthors.length > 0 && (
                      <div className="fav-subset">
                        <span className="fav-label">✍️ {t('profile.fav_authors')}</span>
                        <p className="fav-value">{profileUser.favoriteAuthors.join(', ')}</p>
                      </div>
                    )}

                  {Array.isArray(profileUser.favoriteBooks) &&
                    profileUser.favoriteBooks.length > 0 && (
                      <div className="fav-subset">
                        <span className="fav-label">📚 {t('profile.fav_books')}</span>
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
                        <span className="fav-label">🏷️ {t('profile.fav_genres')}</span>
                        <div className="chips-row">
                          {profileUser.favoriteCategories.map((cat: string) => (
                            <span key={cat} className="tag-chip static">
                              {t(`profile.categories.${cat}`)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <p className="no-favs-yet">{t('profile.no_favs_yet')}</p>
              )}

              <hr />
              <div className="details-section">
                <h3>{t('profile.wishlist')}</h3>
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
                  <p className="no-favs-yet">{t('profile.no_wishlist')}</p>
                )}
              </div>

              <hr />
              <div className="details-section">
                <h3>{t('profile.followed_events')}</h3>
                {followedEvents.length > 0 ? (
                  <div className="chips-row">
                    {followedEvents.map((evento: any) => {
                      const eventTitle = typeof evento === 'object' ? evento.title : 'Evento';
                      const eventId = typeof evento === 'object' ? evento._id : evento;
                      return (
                        <span
                          key={eventId}
                          className="tag-chip static followed-event-chip"
                          onClick={() => navigate(`/eventos/${eventId}`)}
                          style={{
                            cursor: 'pointer',
                            backgroundColor: '#e3f2fd',
                            color: '#0d47a1',
                          }}
                          title="Haga clic para ver el detalle del evento"
                        >
                          📅 {eventTitle}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="no-favs-yet">{t('profile.no_events')}</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="profile-reviews-card">
          <h2>{t('profile.seller_ratings')}</h2>
          {reviews.length === 0 ? (
            <p className="no-reviews-msg">{t('profile.no_seller_ratings')}</p>
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
                      {t('profile.book_label')}: {rev.libro.title}{' '}
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

      {deleteModalOpen && (
        <div className="modal-overlay" onClick={() => setDeleteModalOpen(false)}>
          <div className="modal-content text-center" onClick={(e) => e.stopPropagation()}>
            {deleteStep === 'menu' && (
              <>
                <h2>{t('profile.modal.title')}</h2>
                <p className="delete-warning-text">{t('profile.modal.desc')}</p>
                <div className="delete-actions-column">
                  <button className="temp-delete-btn" onClick={() => setDeleteStep('confirm_soft')}>
                    🌴 {t('profile.modal.vacation_btn')}
                  </button>
                  <button className="perm-delete-btn" onClick={() => setDeleteStep('confirm_perm')}>
                    🗑️ {t('profile.modal.perm_delete_btn')}
                  </button>
                  <button
                    className="modal-cancel-btn full-width"
                    onClick={() => setDeleteModalOpen(false)}
                  >
                    {t('profile.cancel')}
                  </button>
                </div>
              </>
            )}

            {deleteStep === 'confirm_soft' && (
              <>
                <h2>{t('profile.modal.confirm_vacation_title')}</h2>
                <p className="delete-warning-text">{t('profile.modal.confirm_vacation_desc')}</p>
                <div className="delete-actions-column">
                  <button
                    className="temp-delete-confirm-btn"
                    onClick={executeSoftDelete}
                    disabled={deleting}
                  >
                    {deleting
                      ? t('profile.modal.activating')
                      : t('profile.modal.confirm_vacation_action')}
                  </button>
                  <button
                    className="modal-cancel-btn full-width"
                    onClick={() => setDeleteStep('menu')}
                    disabled={deleting}
                  >
                    {t('profile.modal.go_back')}
                  </button>
                </div>
              </>
            )}

            {deleteStep === 'confirm_perm' && (
              <>
                <h2>{t('profile.modal.confirm_perm_title')}</h2>
                <p className="delete-warning-text danger">{t('profile.modal.confirm_perm_desc')}</p>
                <div className="delete-actions-column">
                  <button
                    className="perm-delete-confirm-btn"
                    onClick={executePermanentDelete}
                    disabled={deleting}
                  >
                    {deleting
                      ? t('profile.modal.deleting')
                      : t('profile.modal.confirm_perm_action')}
                  </button>
                  <button
                    className="modal-cancel-btn full-width"
                    onClick={() => setDeleteStep('menu')}
                    disabled={deleting}
                  >
                    {t('profile.modal.go_back')}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
