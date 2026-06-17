import React, { useState } from 'react';
import UsuarioService from '../Services/Usuario';
import { Link, useNavigate } from 'react-router-dom';
import { environment } from '../../config/environment';
import './Auth.css';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    setMessage('');
    try {
      const user = await UsuarioService.socialLogin({
        provider: 'google',
        idToken: response.credential,
      });
      console.log('Real Google login (register flow) successful', user);
      navigate('/');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error al iniciar sesión con Google';
      setMessage(`Error: ${errorMsg}`);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!environment.googleClientId) return;

    const initializeGoogleSignIn = () => {
      const google = (window as any).google;
      const targetElement = document.getElementById('google-signup-button');
      if (google?.accounts?.id && targetElement) {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: handleGoogleCredentialResponse,
        });
        google.accounts.id.renderButton(targetElement, {
          theme: 'outline',
          size: 'large',
          width: 280,
          text: 'signup_with',
          logo_alignment: 'left',
        });
        setGoogleInitialized(true);
      }
    };

    initializeGoogleSignIn();

    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id && document.getElementById('google-signup-button')) {
        initializeGoogleSignIn();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [googleInitialized]);

  // Mock social login state
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockProvider, setMockProvider] = useState<'google' | 'apple'>('google');
  const [mockName, setMockName] = useState('');
  const [mockEmail, setMockEmail] = useState('');
  const [mockLoading, setMockLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const newUser = await UsuarioService.createUser(formData);
      console.log('Usuario creado:', newUser);
      setMessage('¡Registro exitoso! Ya puedes iniciar sesión.');
      setFormData({ name: '', email: '', password: '' });
      setTimeout(() => navigate('/'), 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error al registrar usuario';
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (provider: 'google' | 'apple') => {
    setMockProvider(provider);
    setShowMockModal(true);
    setMessage('');
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockEmail) return;
    setMockLoading(true);
    setMessage('');

    try {
      const name =
        mockName || (mockProvider === 'google' ? 'Usuario de Google' : 'Usuario de Apple');
      // Format: mock_email_name_sub
      const token = `mock_${mockEmail}_${encodeURIComponent(name)}_${mockEmail.split('@')[0]}`;

      const user = await UsuarioService.socialLogin({
        provider: mockProvider,
        idToken: token,
        name,
      });
      console.log('Social login exitoso', user);
      setShowMockModal(false);
      navigate('/');
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Error en inicio de sesión social';
      setMessage(`Error: ${errorMsg}`);
      console.error(err);
    } finally {
      setMockLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Únete a ViveBook</h2>
        <p className="auth-subtitle">Crea tu cuenta y empieza a leer hoy.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nombre de Usuario</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="Ej: Laura Pérez"
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="laura@ejemplo.com"
            />
          </div>

          <div className="input-group">
            <label>Contraseña</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Registrando...' : 'Crear cuenta'}
          </button>

          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
            ¿Ya tienes cuenta?{' '}
            <Link
              to="/"
              style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
            >
              Inicia sesión aquí
            </Link>
          </div>
        </form>

        <div className="auth-divider">o registrarse con</div>

        <div
          className="social-buttons"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}
        >
          {environment.googleClientId ? (
            <div
              id="google-signup-button"
              style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
            ></div>
          ) : (
            <button
              type="button"
              onClick={() => handleSocialClick('google')}
              className="social-button google"
            >
              <svg className="social-icon" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.88-1.54 2.11v2.54h2.49c1.45-1.34 2.29-3.3 2.29-5.65z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-2.49-2.54c-.69.46-1.57.74-2.55.74-1.95 0-3.6-1.32-4.19-3.1H3.29v2.6C5.27 20.85 8.43 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M7.81 16.19c-.15-.46-.24-.95-.24-1.46s.09-1 .24-1.46v-2.6H3.29C2.47 12.3 2 14.1 2 16s.47 3.7 1.29 5.27l4.52-2.6z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 8.43 0 5.27 3.15 3.29 7.18l4.52 2.6c.59-1.78 2.24-3.1 4.19-3.1z"
                />
              </svg>
              Continuar con Google (Prueba)
            </button>
          )}
        </div>

        {message && (
          <div className={`auth-message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>

      {/* Mock Credentials Modal Overlay */}
      {showMockModal && (
        <div className="mock-modal-overlay">
          <div className="mock-modal">
            <h3>Registrarse con {mockProvider === 'google' ? 'Google' : 'Apple'} (Prueba)</h3>
            <p>Introduce los datos para simular el registro con red social.</p>
            <form
              onSubmit={handleSocialSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className="input-group">
                <label>Nombre Completo</label>
                <input
                  type="text"
                  placeholder="Ej: Marc Test"
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
              <div className="input-group">
                <label>Email de la cuenta</label>
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={mockEmail}
                  onChange={(e) => setMockEmail(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowMockModal(false)}
                  className="auth-button"
                  style={{ background: '#cbd5e1', color: '#334155', flex: 1, boxShadow: 'none' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={mockLoading}
                  className="auth-button"
                  style={{ flex: 2, margin: 0 }}
                >
                  {mockLoading ? 'Cargando...' : 'Registrar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
