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
  const [expandedGroups, setExpandedGroups] = useState<{ [key: string]: boolean }>({});

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

  const toggleGroup = (type: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

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

  // Group filtered retos by type
  const groupedRetos: { [key: string]: IReto[] } = {};
  filteredRetos.forEach((reto) => {
    if (!groupedRetos[reto.type]) {
      groupedRetos[reto.type] = [];
    }
    groupedRetos[reto.type].push(reto);
  });

  const groupTypes = Object.keys(groupedRetos);
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
      {/* Header card with overall progress gradient */}
      <div className="retos-header-gradient">
        <div className="header-row">
          <div className="trophy-container">
            <span className="trophy-emoji">🏆</span>
          </div>
          <div className="header-text-container">
            <h1>Mis Retos</h1>
            <p>Completa objetivos y gana insignias en la comunidad</p>
          </div>
        </div>

        <div className="progress-container">
          <div className="progress-text-row">
            <span className="progress-text-label">Retos completados</span>
            <span className="progress-count-text">
              {completedCount} / {totalCount}
            </span>
          </div>
          <div className="header-progress-bg">
            <div className="header-progress-bar" style={{ width: `${overallPercentage}%` }}></div>
          </div>
        </div>
      </div>

      {/* Level Info Card */}
      <div className="level-summary-card">
        <div className="level-badge-container">
          <span className="level-medal">{userLevel.medal || '❔'}</span>
          <div className="level-info-text">
            <h2>Nivel: {userLevel.levelName}</h2>
            <p className="level-description">
              {userLevel.levelName === 'Oro' &&
                '¡Felicidades! Has completado todos los retos disponibles. ¡Eres un lector legendario! 🌟'}
              {userLevel.levelName === 'Plata' &&
                '¡Buen trabajo! Has completado al menos la mitad de los retos. ¡Sigue así! 🚀'}
              {userLevel.levelName === 'Bronce' &&
                '¡Vas por buen camino! Has completado al menos 3 retos. ¡Pronto subirás al siguiente nivel! 🌱'}
              {userLevel.levelName === 'Sin nivel' &&
                'Completa retos para desbloquear tu primera medalla. ¡Comienza hoy! 📖'}
            </p>
          </div>
        </div>
      </div>

      {/* Success card if all completed */}
      {completedCount === totalCount && totalCount > 0 && (
        <div className="all-completed-card">
          <span className="all-completed-emoji">🎉🏆🎉</span>
          <h3>¡Retos Completados!</h3>
          <p>Ya has completado todos los retos, próximamente habrá más!</p>
        </div>
      )}

      {/* Filter buttons */}
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

      {/* Accordion Grouped List */}
      {groupTypes.length === 0 ? (
        <div className="empty-container">
          <span className="empty-emoji">
            {completedCount === totalCount && totalCount > 0 ? '🎉' : '🔍'}
          </span>
          <p className="empty-text">
            {completedCount === totalCount && totalCount > 0
              ? 'Ya has completado todos los retos, próximamente habrá más!'
              : filter === 'completed' && completedCount === 0
                ? 'Todavía no has completado ningún reto.'
                : 'No hay retos disponibles en este momento.'}
          </p>
        </div>
      ) : (
        <div className="groups-list">
          {groupTypes.map((type) => {
            const items = groupedRetos[type];
            const isExpanded = expandedGroups[type] || false;
            const completedInGroup = items.filter((r) => r.completado).length;
            const totalInGroup = items.length;

            return (
              <div key={type} className="group-card">
                <button onClick={() => toggleGroup(type)} className="group-header">
                  <div
                    className="group-icon-badge"
                    style={{ backgroundColor: getBadgeColor(type) }}
                  >
                    <span className="group-icon-emoji">{getIcon(type)}</span>
                  </div>

                  <div className="group-title-container">
                    <span className="group-title">{TYPE_TRANSLATIONS[type] || type}</span>
                    <span className="group-subtitle">
                      {completedInGroup} / {totalInGroup} completados
                    </span>
                  </div>

                  <span className="expand-chevron">{isExpanded ? '▲' : '▼'}</span>
                </button>

                {isExpanded && (
                  <div className="group-content">
                    {items.map((reto, idx) => {
                      const progressPercent = reto.completado
                        ? 100
                        : Math.min(100, Math.max(0, (reto.progresoActual / reto.objetivo) * 100));

                      return (
                        <div
                          key={reto._id}
                          className={`reto-item ${reto.completado ? 'completed' : ''} ${
                            idx < items.length - 1 ? 'divider' : ''
                          }`}
                        >
                          <div className="reto-item-top-row">
                            <div className="reto-text-col">
                              <span className="reto-item-title">{reto.title}</span>
                              {reto.description && (
                                <span className="reto-item-description">{reto.description}</span>
                              )}
                            </div>

                            {reto.completado && (
                              <div className="completed-badge-small">Completado</div>
                            )}
                          </div>

                          <div className="progress-section">
                            <div className="progress-label-row">
                              <span className="progress-label">Progreso</span>
                              <span className="progress-count">
                                {reto.progresoActual} / {reto.objetivo}
                              </span>
                            </div>
                            <div className="progress-bar-container-small">
                              <div
                                className={`progress-bar-small ${
                                  reto.completado ? 'completed' : ''
                                }`}
                                style={{ width: `${progressPercent}%` }}
                              ></div>
                            </div>
                            {reto.completado && reto.fechaCompletado && (
                              <span className="completion-date-text">
                                🎉 {new Date(reto.fechaCompletado).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <ToastContainer />
    </div>
  );
}
