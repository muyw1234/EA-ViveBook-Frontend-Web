import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import UsuarioService from '../Services/Usuario';
import './Auth.css';

const Register: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    confirmEmail: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { name, email, confirmEmail, password, confirmPassword } = formData;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Real-time password requirement checks
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  const metRequirementsCount = [hasMinLength, hasUppercase, hasNumber].filter(Boolean).length;
  const strengthPercentage = password ? (metRequirementsCount / 3) * 100 : 0;

  let strengthColor = '#cbd5e1';
  let strengthText = '';
  if (password) {
    if (metRequirementsCount === 1) {
      strengthColor = '#ef4444'; // red
      strengthText = t('weak', 'Débil');
    } else if (metRequirementsCount === 2) {
      strengthColor = '#f59e0b'; // yellow/orange
      strengthText = t('medium', 'Media');
    } else if (metRequirementsCount === 3) {
      strengthColor = '#10b981'; // green
      strengthText = t('strong', 'Fuerte');
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!name || !email || !confirmEmail || !password || !confirmPassword) {
      setMessage(`Error: ${t('err_missing_reg', 'Por favor, rellena todos los campos')}`);
      setLoading(false);
      return;
    }

    if (email !== confirmEmail) {
      setMessage(`Error: ${t('err_emails_dont_match', 'Los correos electrónicos no coinciden')}`);
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setMessage(`Error: ${t('err_passwords_dont_match', 'Las contraseñas no coinciden')}`);
      setLoading(false);
      return;
    }

    if (!hasMinLength || !hasUppercase || !hasNumber) {
      setMessage(`Error: ${t('err_pwd_requirements', 'La contraseña no cumple con todos los requisitos de seguridad')}`);
      setLoading(false);
      return;
    }

    try {
      const newUser = await UsuarioService.createUser({ name, email, password });
      console.log('Usuario creado:', newUser);
      setMessage(t('msg_reg_success', 'Usuario registrado correctamente'));
      setFormData({ name: '', email: '', confirmEmail: '', password: '', confirmPassword: '' });
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || t('err_reg_problem', 'Hubo un problema al registrarte');
      setMessage(`Error: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">{t('register_title', 'Registro')}</h2>
        <p className="auth-subtitle">{t('register_subtitle', 'Crea tu cuenta y empieza a leer hoy.')}</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label>{t('name_label', 'Nombre Completo')}</label>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="Ej: Laura Pérez"
            />
          </div>

          <div className="input-group">
            <label>{t('email_label', 'Email')}</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="laura@ejemplo.com"
            />
          </div>

          <div className="input-group">
            <label>{t('confirm_email_label', 'Confirmar Email')}</label>
            <input
              type="email"
              name="confirmEmail"
              value={confirmEmail}
              onChange={handleChange}
              required
              className="auth-input"
              placeholder="laura@ejemplo.com"
            />
          </div>

          <div className="input-group">
            <label>{t('password_label', 'Contraseña')}</label>
            <div className="password-input-wrapper">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={password}
                onChange={handleChange}
                required
                className="auth-input"
                placeholder="Mínimo 8 caracteres"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? '👁️' : '👀'}
              </button>
            </div>
          </div>

          {password.length > 0 && (
            <div className="pwd-strength-container">
              <div className="pwd-strength-header">
                <span>{t('pwd_strength', 'Fortaleza de la contraseña')}</span>
                <span style={{ color: strengthColor }}>{strengthText}</span>
              </div>
              <div className="pwd-strength-bar-track">
                <div
                  className="pwd-strength-bar-fill"
                  style={{
                    width: `${strengthPercentage}%`,
                    backgroundColor: strengthColor,
                  }}
                />
              </div>
              <div className="pwd-requirements-list">
                <div className="pwd-requirement-item">
                  <div
                    className="pwd-requirement-dot"
                    style={{ backgroundColor: hasMinLength ? '#10b981' : '#cbd5e1' }}
                  />
                  <span style={{ color: hasMinLength ? '#0f172a' : '#64748b' }}>
                    {t('pwd_req_min_chars', 'Mínimo 8 caracteres')}
                  </span>
                </div>
                <div className="pwd-requirement-item">
                  <div
                    className="pwd-requirement-dot"
                    style={{ backgroundColor: hasUppercase ? '#10b981' : '#cbd5e1' }}
                  />
                  <span style={{ color: hasUppercase ? '#0f172a' : '#64748b' }}>
                    {t('pwd_req_uppercase', 'Al menos una mayúscula')}
                  </span>
                </div>
                <div className="pwd-requirement-item">
                  <div
                    className="pwd-requirement-dot"
                    style={{ backgroundColor: hasNumber ? '#10b981' : '#cbd5e1' }}
                  />
                  <span style={{ color: hasNumber ? '#0f172a' : '#64748b' }}>
                    {t('pwd_req_number', 'Al menos un número')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="input-group">
            <label>{t('confirm_password_label', 'Confirmar Contraseña')}</label>
            <div className="password-input-wrapper">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={confirmPassword}
                onChange={handleChange}
                required
                className="auth-input"
                placeholder="Repite la contraseña"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showConfirmPassword ? '👁️' : '👀'}
              </button>
            </div>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? t('loading', 'Cargando...') : t('btn_create_account', 'Crear Cuenta')}
          </button>

          <div style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b' }}>
            {t('already_have_account_link', '¿Ya tienes cuenta?')}{' '}
            <Link
              to="/login"
              style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '600' }}
            >
              {t('login_btn', 'Inicia sesión aquí')}
            </Link>
          </div>
        </form>

        {message && (
          <div className={`auth-message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
