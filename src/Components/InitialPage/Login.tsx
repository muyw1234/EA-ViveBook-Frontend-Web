import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UsuarioService from '../Services/Usuario';
import { consumeSessionReason } from '../../utils/session';
import { environment } from '../../config/environment';
import './Auth.css';

const Login: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionMessage, setSessionMessage] = useState('');

  // Mock social login state
  const [showMockModal, setShowMockModal] = useState(false);
  const [mockProvider, setMockProvider] = useState<'google' | 'apple'>('google');
  const [mockName, setMockName] = useState('');
  const [mockEmail, setMockEmail] = useState('');
  const [mockLoading, setMockLoading] = useState(false);
  const [googleInitialized, setGoogleInitialized] = useState(false);

  const handleGoogleCredentialResponse = async (response: any) => {
    setLoading(true);
    setError('');
    try {
      const user = await UsuarioService.socialLogin({
        provider: 'google',
        idToken: response.credential,
      });
      console.log('Real Google login successful', user);
      navigate('/');
    } catch (err: any) {
      setError('Error al iniciar sesión con Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper para capitalizar la primera letra del proveedor (google -> Google)
  const getProviderName = (provider: string) =>
    provider.charAt(0).toUpperCase() + provider.slice(1);

  useEffect(() => {
    const reason = consumeSessionReason();
    if (reason === 'expired') {
      setSessionMessage(t('auth.session_expired'));
    } else if (reason === 'rejected') {
      setSessionMessage(t('auth.session_rejected'));
    }
  }, [t]);

  useEffect(() => {
    if (!environment.googleClientId) return;

    const initializeGoogleSignIn = () => {
      const google = (window as any).google;
      const targetElement = document.getElementById('google-signin-button');
      if (google?.accounts?.id && targetElement) {
        google.accounts.id.initialize({
          client_id: environment.googleClientId,
          callback: handleGoogleCredentialResponse,
        });
        google.accounts.id.renderButton(targetElement, {
          theme: 'outline',
          size: 'large',
          width: 280,
          text: 'continue_with',
          logo_alignment: 'left',
        });
        setGoogleInitialized(true);
      }
    };

    initializeGoogleSignIn();

    const interval = setInterval(() => {
      if ((window as any).google?.accounts?.id && document.getElementById('google-signin-button')) {
        initializeGoogleSignIn();
        clearInterval(interval);
      }
    }, 500);

    return () => clearInterval(interval);
  }, [googleInitialized]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSessionMessage('');
    setLoading(true);

    try {
      const data = await UsuarioService.getUserByEmail({ email, password });
      console.log('Login exitoso', data);
      navigate('/');
    } catch (err: any) {
      setError(t('auth.error_credentials'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (provider: 'google' | 'apple') => {
    setMockProvider(provider);
    setShowMockModal(true);
    setError('');
    setSessionMessage('');
  };

  const handleSocialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mockEmail) return;
    setMockLoading(true);
    setError('');

    try {
      const providerName = getProviderName(mockProvider);
      const name = mockName || t('auth.mock.default_user', { provider: providerName });

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
      setError(t('auth.error_social'));
      console.error(err);
    } finally {
      setMockLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{t('auth.title')}</h2>
        <p className="auth-subtitle">{t('auth.subtitle')}</p>

        {sessionMessage && <div className="auth-message error">{sessionMessage}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{t('auth.email')}</label>
            <input
              type="email"
              placeholder="laura@ejemplo.com"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>{t('auth.password')}</label>
            <input
              type="password"
              placeholder={t('auth.password_placeholder')}
              className="auth-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? t('auth.loading_btn') : t('auth.submit_btn')}
          </button>

          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
            {t('auth.no_account')}{' '}
            <Link
              to="/register"
              style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
            >
              {t('auth.register_here')}
            </Link>
          </div>
        </form>

        <div className="auth-divider">{t('auth.divider')}</div>

        <div
          className="social-buttons"
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}
        >
          {environment.googleClientId ? (
            <div
              id="google-signin-button"
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
              {t('auth.continue_with', { provider: 'Google' })} (Prueba)
            </button>
          )}
        </div>

        {error && <div className="auth-message error">{error}</div>}
      </div>

      {/* Mock Credentials Modal Overlay */}
      {showMockModal && (
        <div className="mock-modal-overlay">
          <div className="mock-modal">
            <h3>{t('auth.mock.title', { provider: getProviderName(mockProvider) })}</h3>
            <p>{t('auth.mock.subtitle')}</p>
            <form
              onSubmit={handleSocialSubmit}
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div className="input-group">
                <label>{t('auth.mock.full_name')}</label>
                <input
                  type="text"
                  placeholder={t('auth.mock.full_name_placeholder')}
                  value={mockName}
                  onChange={(e) => setMockName(e.target.value)}
                  className="auth-input"
                  required
                />
              </div>
              <div className="input-group">
                <label>{t('auth.mock.account_email')}</label>
                <input
                  type="email"
                  placeholder={t('auth.mock.account_email_placeholder')}
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
                  {t('auth.mock.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={mockLoading}
                  className="auth-button"
                  style={{ flex: 2, margin: 0 }}
                >
                  {mockLoading ? t('auth.mock.loading') : t('auth.mock.start')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
