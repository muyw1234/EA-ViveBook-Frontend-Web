import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function ThemeToggle() {
  const { t } = useTranslation();
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    return localStorage.getItem('high-contrast') === 'true';
  });

  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-theme', 'high-contrast');
      localStorage.setItem('high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('high-contrast', 'false');
    }
  }, [highContrast]);

  return (
    <button
      onClick={() => setHighContrast(!highContrast)}
      aria-pressed={highContrast}
      className="a11y-toggle-btn"
    >
      {highContrast
        ? `${t('close') || 'Desactivar'} ${t('toggle_high_contrast')}`
        : t('toggle_high_contrast')}
    </button>
  );
}
