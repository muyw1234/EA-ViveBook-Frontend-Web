import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import RetoService from '../Services/Reto';
import type IReto from '../../Models/Reto';
import { calculateUserLevel } from '../../utils/levelHelper';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Retos.css';

const TYPE_TRANSLATIONS: { [key: string]: string } = {
  COMPRAR_LIBROS: 'Comprar libros',
  ALQUILAR_LIBROS: 'Alquilar libros',
  SEGUIR_USUARIOS: 'Seguir usuarios',
  RECIBIR_VALORACIONES: 'Recibir valoraciones',
  ASISTIR_EVENTOS: 'Asistir a eventos',
  SUBIR_LIBROS: 'Subir libros',
};

export default function Retos() {
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
        toast.error('Sesión expirada o no iniciada. Redirigiendo...');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        setError('No se pudieron cargar tus retos en este momento.');
        toast.error('Error al cargar los retos');
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
        <p>Cargando tus retos y progreso...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="retos-error">
        <h3>Error al cargar</h3>
        <p>{error}</p>
        <button onClick={fetchRetos} className="retry-btn">
          Reintentar
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
            <span className="level-label">Nivel Actual</span>
            <h2 className="level-title">{userLevel.levelName}</h2>
            <p className="level-desc-text">
              {userLevel.levelName === 'Oro' &&
                '¡Felicidades! Has completado todos los retos de la comunidad. ¡Eres una leyenda! 🌟'}
              {userLevel.levelName === 'Plata' &&
                '¡Buen trabajo! Has completado la mayoría de los retos. ¡Sigue así! 🚀'}
              {userLevel.levelName === 'Bronce' &&
                '¡Vas por muy buen camino! Completa más retos para ascender de nivel. 🌱'}
              {userLevel.levelName === 'Sin nivel' &&
                'Completa retos para desbloquear tu primera medalla en la comunidad. 📖'}
            </p>
          </div>
        </div>

        {/* Right Card: Overall statistics & Progress Gauge */}
        <div className="progress-summary-card">
          <div className="progress-summary-info">
            <div className="progress-stat">
              <span className="stat-value">{completedCount}</span>
              <span className="stat-label">Completados</span>
            </div>
            <div className="progress-stat-divider"></div>
            <div className="progress-stat">
              <span className="stat-value">{totalCount}</span>
              <span className="stat-label">Retos Totales</span>
            </div>
          </div>
          <div className="progress-gauge-wrapper">
            <div className="progress-gauge-label">
              <span>Progreso de Logros</span>
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
            <h3>¡Todos los retos completados!</h3>
            <p>
              Has conquistado todos los objetivos disponibles. ¡Próximamente añadiremos más retos!
            </p>
          </div>
        </div>
      )}

      {/* Section Divider & Filters */}
      <div className="challenges-section-header">
        <h2 className="section-title-retos">Objetivos de la Comunidad</h2>
        <div className="filter-row">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos
          </button>
          <button
            className={`filter-tab ${filter === 'pending' ? 'active' : ''}`}
            onClick={() => setFilter('pending')}
          >
            Pendientes
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completados
          </button>
        </div>
      </div>

      {/* Grid of Challenges */}
      {filteredRetos.length === 0 ? (
        <div className="empty-container">
          <span className="empty-emoji">🔍</span>
          <p className="empty-text">
            {filter === 'completed'
              ? 'Todavía no has completado ningún reto.'
              : 'No se encontraron retos que coincidan con el filtro seleccionado.'}
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
                    <span className="reto-status-badge completed">Completado</span>
                  ) : (
                    <span className="reto-status-badge pending">En progreso</span>
                  )}
                </div>

                <div className="reto-card-body">
                  <span className="reto-card-category">
                    {TYPE_TRANSLATIONS[reto.type] || reto.type}
                  </span>
                  <h3 className="reto-card-title">{reto.title}</h3>
                  {reto.description && <p className="reto-card-desc">{reto.description}</p>}
                </div>

                <div className="reto-card-footer">
                  <div className="progress-info">
                    <span className="progress-label">Progreso</span>
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
                      Completado el {new Date(reto.fechaCompletado).toLocaleDateString()}
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
