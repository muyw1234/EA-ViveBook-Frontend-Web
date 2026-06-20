import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RetoService from '../Services/Reto';
import type IReto from '../../Models/Reto';
import { calculateUserLevel } from '../../utils/levelHelper';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Retos.css';

export default function Retos() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [retos, setRetos] = useState<IReto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const fetchRetos = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await RetoService.getMisRetos();
      setRetos(data);
    } catch (err: any) {
      console.error('Error fetching user retos:', err);
      if (err.response?.status === 401) {
        toast.error(t('retos.messages.sessionExpired'));
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError(t('retos.messages.loadError'));
        toast.error(t('retos.messages.toastError'));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRetos();
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'COMPRAR_LIBROS':
        return '🛒';
      case 'ALQUILAR_LIBROS':
        return '📖';
      case 'SEGUIR_USUARIOS':
        return '👥';
      case 'RECIBIR_VALORACIONES':
        return '⭐';
      case 'ASISTIR_EVENTOS':
        return '🎫';
      case 'SUBIR_LIBROS':
        return '📤';
      default:
        return '🏆';
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case 'COMPRAR_LIBROS':
        return '#FFE2E2';
      case 'ALQUILAR_LIBROS':
        return '#E2F0FF';
      case 'SEGUIR_USUARIOS':
        return '#EAFEEA';
      case 'RECIBIR_VALORACIONES':
        return '#FFF7E2';
      case 'ASISTIR_EVENTOS':
        return '#F0E2FF';
      case 'SUBIR_LIBROS':
        return '#E2FFE2';
      default:
        return '#F3F4F6';
    }
  };

  const completedCount = retos.filter((r) => r.completado).length;
  const totalCount = retos.length;
  const overallPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const filteredRetos = retos.filter((r) => {
    if (filter === 'completed') return r.completado;
    if (filter === 'pending') return !r.completado;
    return true;
  });

  const userLevel = calculateUserLevel(retos);

  if (loading && retos.length === 0) {
    return (
      <div className="retos-loading">
        <div className="spinner"></div>
        <p>{t('retos.loading')}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="retos-error">
        <h3>{t('retos.errorTitle')}</h3>
        <p>{error}</p>
        <button onClick={fetchRetos} className="retry-btn">
          {t('retos.retryBtn')}
        </button>
      </div>
    );
  }

  return (
    <div className="retos-container">
      {/* Dashboard Top Header Grid */}
      <div className="retos-dashboard-header">
        {/* Left Card: Level info & badge */}
        <div className="level-summary-card">
          <div className="level-medal-wrapper">
            <span className="level-medal-emoji">{userLevel.medal || '❔'}</span>
          </div>
          <div className="level-info-details">
            <span className="level-label">{t('retos.levelLabel')}</span>
            <h2 className="level-title">{userLevel.levelName}</h2>
            <p className="level-desc-text">
              {userLevel.levelName === 'Oro' && t('retos.levels.oro')}
              {userLevel.levelName === 'Plata' && t('retos.levels.plata')}
              {userLevel.levelName === 'Bronce' && t('retos.levels.bronce')}
              {userLevel.levelName === 'Sin nivel' && t('retos.levels.sinNivel')}
            </p>
          </div>
        </div>

        {/* Right Card: Overall statistics & Progress Gauge */}
        <div className="progress-summary-card">
          <div className="progress-summary-info">
            <div className="progress-stat">
              <span className="stat-value">{completedCount}</span>
              <span className="stat-label">{t('retos.stats.completed')}</span>
            </div>
            <div className="progress-stat-divider"></div>
            <div className="progress-stat">
              <span className="stat-value">{totalCount}</span>
              <span className="stat-label">{t('retos.stats.total')}</span>
            </div>
          </div>
          <div className="progress-gauge-wrapper">
            <div className="progress-gauge-label">
              <span>{t('retos.stats.gaugeLabel')}</span>
              <span>{Math.round(overallPercentage)}%</span>
            </div>
            <div className="progress-gauge-bar-bg">
              <div
                className="progress-gauge-bar-fill"
                style={{ width: `${overallPercentage}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Banner if all completed */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="all-completed-banner">
          <span className="celebrate-icon">🎉</span>
          <div className="banner-text">
            <h3>{t('retos.banner.title')}</h3>
            <p>{t('retos.banner.desc')}</p>
          </div>
        </div>
      )}

      {/* Section Divider & Filters */}
      <div className="challenges-section-header">
        <h2 className="section-title-retos">{t('retos.sectionTitle')}</h2>
        <div className="filter-row">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            {t('retos.filters.all')}
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            {t('retos.filters.pending')}
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            {t('retos.filters.completed')}
          </button>
        </div>
      </div>

      {/* Grid of Challenges */}
      {filteredRetos.length === 0 ? (
        <div className="empty-container">
          <span className="empty-emoji">🔍</span>
          <p className="empty-text">
            {filter === 'completed' ? t('retos.empty.completed') : t('retos.empty.filtered')}
          </p>
        </div>
      ) : (
        <div className="retos-grid">
          {filteredRetos.map((reto) => {
            const progressPercent = reto.completado
              ? 100
              : Math.min(100, Math.max(0, (reto.progresoActual / reto.objetivo) * 100));

            return (
              <div key={reto._id} className={`reto-card ${reto.completado ? 'completed' : ''}`}>
                <div className="reto-card-header">
                  <div
                    className="reto-card-icon"
                    style={{ backgroundColor: getBadgeColor(reto.type) }}
                  >
                    {getIcon(reto.type)}
                  </div>
                  {reto.completado ? (
                    <span className="reto-status-badge completed">{t('retos.card.completed')}</span>
                  ) : (
                    <span className="reto-status-badge pending">{t('retos.card.pending')}</span>
                  )}
                </div>

                <div className="reto-card-body">
                  <span className="reto-card-category">
                    {t(`retos.types.${reto.type}`, { defaultValue: reto.type })}
                  </span>
                  <h3 className="reto-card-title">{reto.title}</h3>
                  {reto.description && <p className="reto-card-desc">{reto.description}</p>}
                </div>

                <div className="reto-card-footer">
                  <div className="progress-info">
                    <span className="progress-label">{t('retos.card.progress')}</span>
                    <span className="progress-value">
                      {reto.progresoActual} / {reto.objetivo}
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div
                      className={`progress-bar-fill ${reto.completado ? 'completed' : ''}`}
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                  {reto.completado && reto.fechaCompletado && (
                    <span className="completion-date">
                      {t('retos.card.completedOn', {
                        date: new Date(reto.fechaCompletado).toLocaleDateString(),
                      })}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
