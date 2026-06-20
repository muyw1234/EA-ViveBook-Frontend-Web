import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../../api';
import { getApiCollection, unwrapApiData } from '../../utils/apiResponse';
import './Discover.css';

// Mantenemos las claves base idénticas para mapear con el JSON de i18n
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

const PREDEFINED_AUTHORS = [
  'Gabriel García Márquez',
  'Jane Austen',
  'J.R.R Tolkien',
  'George Orwell',
  'Alice Kellen',
  'Stephen King',
  'Colleen Hoover',
];

const Discover: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [authors, setAuthors] = useState<string[]>(PREDEFINED_AUTHORS);
  const [newAuthor, setNewAuthor] = useState('');

  const [favoriteAuthors, setFavoriteAuthors] = useState<string[]>([]);
  const [favoriteCategories, setFavoriteCategories] = useState<string[]>([]);
  const [followingUsers, setFollowingUsers] = useState<string[]>([]);

  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileRes = await api.get('/auth/profile');
      const profile = unwrapApiData<any>(profileRes.data);
      setCurrentUser(profile);
      setFavoriteAuthors(profile.favoriteAuthors || []);
      setFavoriteCategories(profile.favoriteCategories || []);
      setFollowingUsers((profile.followingUsers || []).map((u: any) => u._id || u));

      const [usersRes, authorsRes] = await Promise.all([
        api.get('/usuarios'),
        api.get('/autores/all?limit=20').catch(() => ({ data: [] })),
      ]);

      if (usersRes.data) {
        const usersList = getApiCollection<any>(usersRes.data);
        setUsers(usersList.filter((u: any) => u._id !== profile._id));
      }

      if (authorsRes.data) {
        const backendAuthors = getApiCollection<any>(authorsRes.data);
        const combined = [...PREDEFINED_AUTHORS];
        backendAuthors.forEach((ba: any) => {
          const name = ba.fullName || ba.name;
          if (name && !combined.includes(name)) {
            combined.push(name);
          }
        });
        setAuthors(combined);
      }
    } catch (error) {
      console.error('Error fetching discovery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndContinue = async () => {
    if (!currentUser) {
      navigate('/');
      return;
    }

    try {
      const payload = {
        favoriteAuthors,
        favoriteCategories,
        followingUsers,
      };
      await api.put(`/usuarios/${currentUser._id}`, payload);
      navigate('/');
    } catch (error) {
      console.error('Error saving discover preferences:', error);
      setMessage(t('discover.error_save'));
    }
  };

  const toggleCategory = (cat: string) => {
    if (favoriteCategories.includes(cat)) {
      setFavoriteCategories((prev) => prev.filter((c) => c !== cat));
    } else {
      setFavoriteCategories((prev) => [...prev, cat]);
    }
  };

  const toggleAuthor = (authorName: string) => {
    if (favoriteAuthors.includes(authorName)) {
      setFavoriteAuthors((prev) => prev.filter((a) => a !== authorName));
    } else {
      if (favoriteAuthors.length >= 5) {
        alert(t('discover.alert_limit'));
        return;
      }
      setFavoriteAuthors((prev) => [...prev, authorName]);
    }
  };

  const toggleUser = (userId: string) => {
    if (followingUsers.includes(userId)) {
      setFollowingUsers((prev) => prev.filter((id) => id !== userId));
    } else {
      setFollowingUsers((prev) => [...prev, userId]);
    }
  };

  if (loading) {
    return (
      <div className="discover-loading">
        <div className="spinner"></div>
        <p>{t('discover.loading')}</p>
      </div>
    );
  }

  return (
    <div className="discover-container">
      <div className="discover-card">
        <h1 className="discover-title">{t('discover.title')}</h1>
        <p className="discover-subtitle">{t('discover.subtitle')}</p>

        {message && <div className="discover-message error">{message}</div>}

        <div className="discover-sections-grid">
          {/* Categories Section */}
          <div className="discover-section">
            <h2 className="discover-section-title">{t('discover.categories_title')}</h2>
            <p className="discover-section-desc">{t('discover.categories_desc')}</p>
            <div className="categories-grid">
              {ALL_CATEGORIES.map((cat) => {
                const isSelected = favoriteCategories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`category-chip ${isSelected ? 'selected' : ''}`}
                  >
                    {/* Traduce la categoría dinámicamente dinámicamente usando su clave interna */}
                    {t(`discover.categories.${cat}`)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Authors Section */}
          <div className="discover-section">
            <h2 className="discover-section-title">{t('discover.authors_title')}</h2>
            <p className="discover-section-desc">{t('discover.authors_desc')}</p>

            <div className="author-input-wrapper">
              <input
                type="text"
                placeholder={t('discover.author_placeholder')}
                value={newAuthor}
                onChange={(e) => setNewAuthor(e.target.value)}
                className="discover-input"
              />
              <button
                onClick={() => {
                  if (newAuthor.trim()) {
                    toggleAuthor(newAuthor.trim());
                    setNewAuthor('');
                  }
                }}
                className="discover-add-btn"
              >
                {t('discover.btn_add')}
              </button>
            </div>

            <div className="items-list">
              {authors.map((authorName) => {
                const isFollowing = favoriteAuthors.includes(authorName);
                return (
                  <div key={authorName} className="discover-item-row">
                    <div className="item-info">
                      <div className="item-avatar author-avatar">
                        {authorName.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="item-name">{authorName}</span>
                    </div>
                    <button
                      onClick={() => toggleAuthor(authorName)}
                      className={`follow-btn ${isFollowing ? 'following' : ''}`}
                    >
                      {isFollowing ? t('discover.btn_following') : t('discover.btn_follow')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Users Section */}
          <div className="discover-section">
            <h2 className="discover-section-title">{t('discover.community_title')}</h2>
            <p className="discover-section-desc">{t('discover.community_desc')}</p>

            <div className="items-list">
              {users.length > 0 ? (
                users.map((u) => {
                  const isFollowing = followingUsers.includes(u._id);
                  return (
                    <div key={u._id} className="discover-item-row">
                      <div className="item-info">
                        {u.avatar ? (
                          <img src={u.avatar} alt={u.name} className="item-avatar-img" />
                        ) : (
                          <div className="item-avatar user-avatar">
                            {u.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span className="item-name">{u.name}</span>
                      </div>
                      <div className="item-actions">
                        <button
                          onClick={() => toggleUser(u._id)}
                          className={`follow-btn ${isFollowing ? 'following' : ''}`}
                        >
                          {isFollowing ? t('discover.btn_following') : t('discover.btn_follow')}
                        </button>
                        <button onClick={() => navigate(`/profile/${u._id}`)} className="view-btn">
                          {t('discover.btn_view_profile')}
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="empty-text">{t('discover.community_empty')}</p>
              )}
            </div>
          </div>
        </div>

        <div className="discover-footer">
          <button onClick={handleSaveAndContinue} className="finish-btn">
            {t('discover.btn_finish')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Discover;
