import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import EventService from "../Services/Evento";
import "./EventoDetail.css";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { toast } from "react-toastify"; 
import { jwtDecode } from "jwt-decode";

export interface IGeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; 
}

type ParticipantUser = {
  _id: string;
  name: string;
  email?: string;
};

type Event = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  creator: string;
  participant: ParticipantUser[];
  eventDate: Date | string; 
  createdDate: Date | string;
  location: IGeoJSONPoint;
  direccionExacta: string;
};

const getUserIdFromToken = (): string => {
  const token = localStorage.getItem("token"); 
  if (!token) return "";

  try {
    const decoded: any = jwtDecode(token);
    return decoded._id || ""; 
  } catch (error) {
    console.error("Error al decodificar el token de autenticación:", error);
    return "";
  }
};

const UserIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

const EventIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
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

const formatDate = (dateInput: Date | string) => {
  if (!dateInput) return "No indicada";
  const date = new Date(dateInput);
  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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
                console.log("Acceso a ubicación denegado por el usuario.");
            }
        );
    }

    const fetchEvent = async () => {
      if (!id) {
        setError("No se encontró el identificador del evento.");
        setLoading(false);
        return;
      }

      try {
        const data = await EventService.getEventoById(id);
        setEvent(data);
      } catch (fetchError) {
        console.error("Error fetching event detail:", fetchError);
        setError("No se pudo cargar el detalle del evento.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  const handleParticipate = async () => {
    if (!localStorage.getItem("token")) {
      toast.warn("Inicia sesión para usar esta función");
      navigate("/login");
      return;
    }
    if (!event || !event._id) return;
    
    setJoining(true);
    try {
      const updatedEvent = await EventService.participateInEvento(event._id, currentUserId);
      setEvent(updatedEvent);
      toast.success("¡Te has apuntado al evento con éxito!");
    } catch (err) {
      console.error("Error al unirse al evento:", err);
      toast.error("No se pudo registrar tu participación.");
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!localStorage.getItem("token")) {
      toast.warn("Inicia sesión para usar esta función");
      navigate("/login");
      return;
    }
    if (!event || !event._id) return;
    
    setJoining(true);
    try {
      const response = await EventService.leaveEvento(event._id, currentUserId);
      
      const updatedEvent = response?.data ? response.data : response;

      if (updatedEvent && (updatedEvent._id || updatedEvent.id)) {
        setEvent(updatedEvent);
        toast.info("Has cancelado tu participación en el evento.");
      } else {
        setEvent(prevEvent => {
          if (!prevEvent) return null;
          return {
            ...prevEvent,
            participant: prevEvent.participant.filter(p => p && p._id !== currentUserId)
          };
        });
        toast.info("Has cancelado tu participación.");
      }
    } catch (err) {
      console.error("Error al salir del evento:", err);
      toast.error("No se pudo cancelar tu participación.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return <div className="event-detail-page">Cargando detalle del evento...</div>;
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <button className="back-button" onClick={() => navigate("/")}>
          Volver
        </button>
        <p className="event-detail-error">{error || "Evento no encontrado."}</p>
      </div>
    );
  }

  const isAlreadyParticipating = event.participant?.some(
    (p) => p && p._id === currentUserId
  ) || false;

  const eventCoordinates: [number, number] = event.location?.coordinates 
    ? [event.location.coordinates[1], event.location.coordinates[0]]
    : [41.3851, 2.1734];

  return (
    <main className="event-detail-page">
      <button className="back-button" onClick={() => navigate("/")}>
        ← Volver
      </button>

      <section className="event-detail-layout">
        <div className="event-detail-cover" aria-label="Portada del evento">
          <span>📅</span>
        </div>

        <div className="event-detail-info">
          <span className="event-detail-status">Próximamente</span>
          <h1>{event.title || "Evento sin título"}</h1>
          <p className="event-detail-author">Organizado por: {event.creator}</p>

          <dl className="event-detail-meta">
            <div>
              <dt>Fecha del Evento</dt>
              <dd>{formatDate(event.eventDate)}</dd>
            </div>
            <div>
              <dt>Dirección</dt>
              <dd>{event.direccionExacta || "No especificada"}</dd>
            </div>
            <div>
              <dt>Participantes</dt>
              <dd>{event.participant?.length || 0} inscritos</dd>
            </div>
            <div>
              <dt>Publicado el</dt>
              <dd>{formatDate(event.createdDate)}</dd>
            </div>
          </dl>

          {event.description && (
            <div className="event-detail-description">
              <h2>Descripción</h2>
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
                {joining ? "Procesando..." : "✓ Ya participas (Click para salir)"}
              </button>
            ) : (
              <button
                onClick={handleParticipate}
                disabled={joining}
                className="participate-button"
              >
                {joining ? "Procesando..." : "Quiero participar"}
              </button>
            )}
          </div>

          {/* Sección de Participantes */}
          <div className="event-detail-participants">
            <h2>Personas inscritas ({event.participant?.length || 0})</h2>
            
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
              <p className="no-participants">
                Sé el primero en apuntarte a este evento.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Sección del Mapa */}
      <section className="map-section">
        <h2>Ubicación en el mapa</h2>
        <div className="map-wrapper">
          <MapContainer center={eventCoordinates} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      
            {userLocation && (
              <Marker position={userLocation} icon={UserIcon}>
                <Popup>Tu ubicación actual</Popup>
              </Marker>
            )}

            <Marker position={eventCoordinates} icon={EventIcon}>
              <Popup>
                <strong>{event.title}</strong><br/>
                {event.direccionExacta}
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