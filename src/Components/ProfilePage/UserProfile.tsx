import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UsuarioService from '../Services/Usuario';
import { toast } from 'react-toastify';

interface ILibroSimple {
  _id: string;
  title: string;
  isbn?: string;
  precio?: number;
  type?: 'VENTA' | 'ALQUILER';
  owner?: { _id: string; name: string };
}

interface IUsuarioProfile {
  _id: string;
  name: string;
  email: string;
  libros: ILibroSimple[];
  boughtLibros: ILibroSimple[];
  rentedLibros: ILibroSimple[];
  followingUsers: Array<{ _id: string; name: string; email: string }>;
}

export const ProfilePage = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<IUsuarioProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<
    'mis-libros' | 'comprados' | 'alquilados' | 'siguiendo'
  >('mis-libros');

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await UsuarioService.getProfile();
        setProfile(data as any);
      } catch (error: any) {
        console.error('Error cargando el perfil:', error);
        toast.error('No se pudo cargar la información del perfil');
        if (error.response?.status === 401) {
          navigate('/');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, [navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
          color: 'var(--text)',
          fontWeight: 600,
        }}
      >
        Cargando tu perfil de ViveBook...
      </div>
    );
  }

  if (!profile) {
    return (
      <div style={{ textAlign: 'center', marginTop: '3rem' }}>
        <p style={{ color: 'var(--error)', fontWeight: 'bold' }}>Usuario no encontrado.</p>
      </div>
    );
  }

  const renderBookGrid = (books: ILibroSimple[], emptyMessage: string) => {
    if (!books || books.length === 0) {
      return (
        <p
          style={{
            color: 'var(--text)',
            fontStyle: 'italic',
            textAlign: 'center',
            margin: '3rem 0',
          }}
        >
          {emptyMessage}
        </p>
      );
    }

    return (
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {books.map((libro) => (
          <div
            key={libro._id}
            style={{
              backgroundColor: 'var(--bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'between',
              textAlign: 'left',
              boxShadow: 'var(--shadow)',
            }}
          >
            <div style={{ flexGrow: 1 }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: 'var(--text-h)' }}>
                {libro.title}
              </h4>
              {libro.isbn && (
                <p
                  style={{
                    fontFamily: 'var(--mono)',
                    fontSize: '0.75rem',
                    color: 'var(--text)',
                    marginTop: '0.25rem',
                  }}
                >
                  ISBN: {libro.isbn}
                </p>
              )}
              {libro.owner && (
                <p
                  style={{
                    fontSize: '0.8rem',
                    color: 'var(--secondary)',
                    marginTop: '0.5rem',
                    fontWeight: 600,
                  }}
                >
                  Propietario: {libro.owner.name}
                </p>
              )}
            </div>
            <div
              style={{
                marginTop: '1.25rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  padding: '0.25rem 0.6rem',
                  borderRadius: '99px',
                  backgroundColor: libro.type === 'ALQUILER' ? '#e0f2fe' : 'var(--accent-bg)',
                  color: libro.type === 'ALQUILER' ? '#0369a1' : 'var(--secondary)',
                  border:
                    libro.type === 'ALQUILER'
                      ? '1px solid rgba(3, 105, 161, 0.2)'
                      : '1px solid var(--accent-border)',
                }}
              >
                {libro.type || 'VENTA'}
              </span>
              <span style={{ fontWeight: 700, color: 'var(--text-h)', fontSize: '1.1rem' }}>
                {libro.precio !== undefined ? `${libro.precio}€` : '0€'}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div
      style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '2rem 1.5rem',
        boxSizing: 'border-box',
      }}
    >
      {/* Cabecera del Perfil */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
          borderRadius: '16px',
          padding: '2rem',
          color: '#ffffff',
          boxShadow: 'var(--shadow)',
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1.5rem',
          textAlign: 'left',
        }}
      >
        <div>
          <h1 style={{ color: '#ffffff', margin: 0, fontSize: '2.2rem' }}>{profile.name}</h1>
          <p
            style={{
              color: 'var(--bg)',
              opacity: 0.9,
              margin: '0.5rem 0 0 0',
              fontSize: '0.95rem',
            }}
          >
            {profile.email}
          </p>
        </div>
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            background: 'rgba(255, 255, 255, 0.15)',
            padding: '1rem',
            borderRadius: '12px',
            backdropFilter: 'blur(4px)',
            textAlign: 'center',
          }}
        >
          <div style={{ paddingRight: '1rem', borderRight: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <span
              style={{
                display: 'block',
                fontSize: '1.3rem',
                fontWeight: 700,
                fontFamily: 'var(--mono)',
              }}
            >
              {profile.libros?.length || 0}
            </span>
            <span style={{ fontSize: '0.7rem', opacity: 0.85, textTransform: 'uppercase' }}>
              Subidos
            </span>
          </div>
          <div style={{ paddingRight: '1rem', borderRight: '1px solid rgba(255, 255, 255, 0.2)' }}>
            <span
              style={{
                display: 'block',
                fontSize: '1.3rem',
                fontWeight: 700,
                fontFamily: 'var(--mono)',
              }}
            >
              {profile.boughtLibros?.length || 0}
            </span>
            <span style={{ fontSize: '0.7rem', opacity: 0.85, textTransform: 'uppercase' }}>
              Comprados
            </span>
          </div>
          <div>
            <span
              style={{
                display: 'block',
                fontSize: '1.3rem',
                fontWeight: 700,
                fontFamily: 'var(--mono)',
              }}
            >
              {profile.followingUsers?.length || 0}
            </span>
            <span style={{ fontSize: '0.7rem', opacity: 0.85, textTransform: 'uppercase' }}>
              Siguiendo
            </span>
          </div>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <div
        style={{
          display: 'flex',
          gap: '1.5rem',
          borderBottom: '2px solid var(--border)',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        {[
          { id: 'mis-libros', label: 'Mis Libros' },
          { id: 'comprados', label: 'Comprados' },
          { id: 'alquilados', label: 'Alquilados' },
          { id: 'siguiendo', label: 'Siguiendo' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--sans)',
              fontSize: '1rem',
              fontWeight: 600,
              padding: '0.75rem 0.25rem',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s',
              color: activeTab === tab.id ? 'var(--secondary)' : 'var(--text)',
              borderBottom:
                activeTab === tab.id ? '3px solid var(--secondary)' : '3px solid transparent',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenedor del contenido */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '1.5rem',
          minHeight: '250px',
          boxShadow: 'var(--shadow)',
        }}
      >
        {activeTab === 'mis-libros' &&
          renderBookGrid(profile.libros, 'No has publicado libros aún.')}
        {activeTab === 'comprados' &&
          renderBookGrid(profile.boughtLibros, 'No has comprado ningún libro todavía.')}
        {activeTab === 'alquilados' &&
          renderBookGrid(profile.rentedLibros, 'No tienes alquileres activos.')}
        {activeTab === 'siguiendo' && (
          <div style={{ textAlign: 'left' }}>
            {profile.followingUsers && profile.followingUsers.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {profile.followingUsers.map((user) => (
                  <li
                    key={user._id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '1rem',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 600, color: 'var(--text-h)', margin: 0 }}>
                        {user.name}
                      </p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text)', margin: 0 }}>
                        {user.email}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate(`/usuario/${user._id}`)}
                      style={{
                        backgroundColor: 'var(--accent-bg)',
                        color: 'var(--secondary)',
                        border: '1px solid var(--accent-border)',
                        padding: '0.4rem 0.8rem',
                        borderRadius: '99px',
                        fontWeight: 600,
                        fontSize: '0.8rem',
                        cursor: 'pointer',
                      }}
                    >
                      Ver Perfil
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p
                style={{
                  color: 'var(--text)',
                  fontStyle: 'italic',
                  textAlign: 'center',
                  margin: '3rem 0',
                }}
              >
                No estás siguiendo a ningún lector todavía.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
