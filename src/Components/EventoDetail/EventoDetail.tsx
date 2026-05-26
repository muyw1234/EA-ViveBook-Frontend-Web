import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import EventService from "../Services/Evento";
import "./EventoDetail.css";
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
// Es importante asegurarse de importar los estilos CSS de Leaflet en tu index.js/main.tsx o aquí:

export interface IGeoJSONPoint {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

type Event = {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  creator: string;
  eventDate: Date | string; 
  createdDate: Date | string;
  location: IGeoJSONPoint;
  direccionExacta: string;
};

// Icono para el Usuario (Azul)
const UserIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Icono para los Eventos (Rojo)
const EventIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
});

// Corrección: El mapa se recentra automáticamente fijándose en el EVENTO
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

  useEffect(() => {
    // Intentar obtener la ubicación del usuario (Opcional, para pintar el marcador azul)
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

  if (loading) {
    return <div className="event-detail-page">Cargando detalle del evento...</div>;
  }

  if (error || !event) {
    return (
      <div className="event-detail-page">
        <button className="back-button" onClick={() => navigate("/home")}>
          Volver
        </button>
        <p className="event-detail-error">{error || "Evento no encontrado."}</p>
      </div>
    );
  }

  // Extraemos las coordenadas del evento en formato Leaflet [Lat, Lon]
  // Recordando que GeoJSON viene invertido: index 1 es Latitud, index 0 es Longitud
  const eventCoordinates: [number, number] = event.location?.coordinates 
    ? [event.location.coordinates[1], event.location.coordinates[0]]
    : [41.3851, 2.1734]; // Coordenadas de respaldo (Barcelona) si fallara el dato

  return (
    <main className="event-detail-page">
      <button className="back-button" onClick={() => navigate("/home")}>
        Volver
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
            {event.location?.coordinates && (
              <div>
                <dt>Coordenadas (Lon, Lat)</dt>
                <dd>
                  {`${event.location.coordinates[0]}, ${event.location.coordinates[1]}`}
                </dd>
              </div>
            )}
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
        </div>
      </section>

      {/* Sección del Mapa Corregida */}
      <section className="content-section" style={{ marginTop: "2rem" }}>
        <h2 className="section-title" style={{ marginBottom: "1rem" }}>Ubicación en el mapa</h2>
        <div style={{ height: "450px", width: "100%", borderRadius: "15px", overflow: "hidden", boxShadow: "var(--shadow)" }}>
          
          <MapContainer center={eventCoordinates} zoom={15} style={{ height: "100%", width: "100%" }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                      
            {/* MARCADOR DEL USUARIO (Sólo aparece si dio permisos de geolocalización) */}
            {userLocation && (
              <Marker position={userLocation} icon={UserIcon}>
                <Popup>Tu ubicación actual</Popup>
              </Marker>
            )}

            {/* MARCADOR DEL EVENTO (Rojo) */}
            <Marker position={eventCoordinates} icon={EventIcon}>
              <Popup>
                <strong>{event.title}</strong><br/>
                {event.direccionExacta}
              </Popup>
            </Marker>
            
            {/* Recentra la vista en el evento de forma dinámica */}
            <RecenterMap coords={eventCoordinates} />
          </MapContainer>

        </div>
      </section>
    </main>
  );
};

export default EventDetail;