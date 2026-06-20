import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EventService from '../Services/Evento';
import './EventoDetail.css';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import { getSessionToken } from '../../utils/session';

export interface IGeoJSONPoint {
  type: 'Point';
  coordinates: [number, number];
}

type ParticipantUser = {
  _id: string;
  name: string;
  email?: string;
};

type CreatorUser = {
  _id: string;
  name: string;
  email?: string;
};

type Event = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  creator: CreatorUser;
  participant: ParticipantUser[];
  eventDate: Date | string;
  createdDate: Date | string;
  location: IGeoJSONPoint;
  direccionExacta: string;
};

const getUserIdFromToken = (): string => {
  const token = getSessionToken();
  if (!token) return '';

  try {
    const decoded: any = jwtDecode(token);
    return decoded._id || '';
  } catch (error) {
    console.error('Error al decodificar el token de autenticación:', error);
    return '';
  }
};

const UserIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const EventIcon = L.icon({
  iconUrl:
    'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const RecenterMap = ({ coords }: { coords: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (coords[0] && coords[1]) {
      map.setView(coords, 15);
    }
  }, [coords, map]);
  return null;
};

const formatDate = (dateInput: Date | string, lng: string) => {
  if (!dateInput) return '';
  const date = new Date(dateInput);
  return date.toLocaleDateString(lng === 'cat' ? 'ca-ES' : lng === 'en' ? 'en-US' : 'es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const EventDetail: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [joining, setJoining] = useState(false);
  const currentUserId = getUserIdFromToken();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
        },
        () => {
          console.log('Acceso a ubicación denegado por el usuario.');
        },
      );
    }

    const fetchEvent = async () => {
      if (!id) {
        setError(t('event_detail.error_id'));
        setLoading(false);
        return;
      }

      try {
        const data = await EventService.getEventoById(id);
        setEvent(data);
      } catch (fetchError) {
        console.error('Error fetching event detail:', fetchError);
        setError(t('event_detail.error_fetch'));
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, t]);

  const handleParticipate = async () => {
    if (!getSessionToken()) {
      toast.warn(t('event_detail.toast_login_required'));
      navigate('/login');
      return;
    }
    if (!event || !event._id) return;

    setJoining(true);
    try {
      await EventService.participateInEvento(event._id, currentUserId);

      const mockCurrentUser: ParticipantUser = {
        _id: currentUserId,
        name: localStorage.getItem('userName') || 'Tú',
      };

      setEvent((prevEvent) => {
        if (!prevEvent) return null;
        return {
          ...prevEvent,
          participant: [...(prevEvent.participant || []), mockCurrentUser],
        };
      });

      toast.success(t('event_detail.toast_join_success'));
    } catch (err) {
      console.error('Error al unirse al evento:', err);
      toast.error(t('event_detail.toast_join_error'));
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!getSessionToken()) {
      toast.warn(t('event_detail.toast_login_required'));
      navigate('/login');
      return;
    }
    if (!event || !event._id) return;

    setJoining(true);
    try {
      const response = await EventService.leaveEvento(event._id, currentUserId);

      const updatedEvent = response?.data ? response.data : response;

      if (updatedEvent && (updatedEvent._id || updatedEvent.id)) {
        setEvent(updatedEvent);
        toast.info(t('event_detail.toast_leave_success'));
      } else {
        setEvent((prevEvent) => {
          if (!prevEvent) return null;
          return {
            ...prevEvent,
            participant: prevEvent.participant.filter((p) => p && p._id !== currentUserId),
          };
        });
        toast.info(t('event_detail.toast_leave_success'));
      }
    } catch (err) {
      console.error('Error al salir del evento:', err);
      toast.error(t('event_detail.toast_leave_error'));
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <div className="event-detail-page">{t('event_detail.loading')}</div>;
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <button className="back-button" onClick={() => navigate('/')}>
          {t('event_detail.back')}
        </button>
        <p className="event-detail-error">{error || t('event_detail.error_not_found')}</p>
      </div>
    );
  }

  const isAlreadyParticipating =
    event.participant?.some((p) => p && p._id === currentUserId) || false;

  const eventCoordinates: [number, number] = event.location?.coordinates
    ? [event.location.coordinates[1], event.location.coordinates[0]]
    : [41.3851, 2.1734];

  return (
    <main className="event-detail-page">
      <button className="back-button" onClick={() => navigate('/')}>
        ← {t('event_detail.back')}
      </button>

      <section className="event-detail-layout">
        <div className="event-detail-cover" aria-label={t('event_detail.cover_alt')}>
          <span>📅</span>
        </div>

        <div className="event-detail-info">
          <span className="event-detail-status">{t('event_detail.status_upcoming')}</span>
          <h1>{event.title || t('event_detail.title_fallback')}</h1>
          <p className="event-detail-author">
            {event.creator?.name
              ? t('event_detail.organized_by', { name: event.creator.name })
              : t('event_detail.organized_by', { name: t('event_detail.organized_by_anon') })}
          </p>

          <dl className="event-detail-meta">
            <div>
              <dt>{t('event_detail.label_date')}</dt>
              <dd>
                {formatDate(event.eventDate, i18n.language) || t('event_detail.address_fallback')}
              </dd>
            </div>
            <div>
              <dt>{t('event_detail.label_address')}</dt>
              <dd>{event.direccionExacta || t('event_detail.address_fallback')}</dd>
            </div>
            <div>
              <dt>{t('event_detail.label_participants')}</dt>
              <dd>
                {t('event_detail.participants_count', { count: event.participant?.length || 0 })}
              </dd>
            </div>
            <div>
              <dt>{t('event_detail.label_published')}</dt>
              <dd>
                {formatDate(event.createdDate, i18n.language) || t('event_detail.address_fallback')}
              </dd>
            </div>
          </dl>

          {event.description && (
            <div className="event-detail-description">
              <h2>{t('event_detail.label_description')}</h2>
              <p>{event.description}</p>
            </div>
          )}

          {/* Botón de Acción */}
          <div className="event-detail-actions">
            {isAlreadyParticipating ? (
              <button
                onClick={handleLeave}
                disabled={joining}
                className="participate-button joined"
              >
                {joining ? t('event_detail.btn_processing') : t('event_detail.btn_joined')}
              </button>
            ) : (
              <button onClick={handleParticipate} disabled={joining} className="participate-button">
                {joining ? t('event_detail.btn_processing') : t('event_detail.btn_join')}
              </button>
            )}
          </div>

          {/* Sección de Participantes */}
          <div className="event-detail-participants">
            <h2>
              {t('event_detail.participants_title', { count: event.participant?.length || 0 })}
            </h2>

            {event.participant && event.participant.length > 0 ? (
              <ul className="participants-list">
                {event.participant.map((usuario) => (
                  <li key={usuario._id}>
                    <Link to={`/profile/${usuario._id}`} className="participant-tag-link">
                      <span className="participant-avatar">
                        {usuario.name?.charAt(0).toUpperCase() || 'U'}
                      </span>
                      <span className="participant-name">{usuario.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-participants">{t('event_detail.participants_empty')}</p>
            )}
          </div>
        </div>
      </section>

      {/* Sección del Mapa */}
      <section className="map-section">
        <h2>{t('event_detail.map_title')}</h2>
        <div className="map-wrapper">
          <MapContainer
            center={eventCoordinates}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

            {userLocation && (
              <Marker position={userLocation} icon={UserIcon}>
                <Popup>{t('event_detail.map_user_location')}</Popup>
              </Marker>
            )}

            <Marker position={eventCoordinates} icon={EventIcon}>
              <Popup>
                <strong>{event.title || t('event_detail.title_fallback')}</strong>
                <br />
                {event.direccionExacta || t('event_detail.address_fallback')}
              </Popup>
            </Marker>

            <RecenterMap coords={eventCoordinates} />
          </MapContainer>
        </div>
      </section>
    </main>
  );
};

export default EventDetail;
