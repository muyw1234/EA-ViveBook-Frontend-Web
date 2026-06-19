import { useState, useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import LanguageSelector from './LanguageSelector/LanguageSelector';
import './AccessibilityMenu.css';

import { useTranslation } from 'react-i18next';

export default function AccessibilityMenu() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="a11y-menu-container" ref={menuRef}>
      {/* Botón flotante estilizado */}
      <button
        className={`a11y-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label={t('accessibility_settings') || 'Accessibility Options'}
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="a11y-icon" aria-hidden="true">
          <path d="M12 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm9 7h-6v13h-2v-6h-2v6H9V9H3V7h18v2z" />
        </svg>
      </button>

      {/* Panel Desplegable Moderno */}
      {isOpen && (
        <div className="a11y-panel" role="dialog" aria-label="Accessibility Menu">
          <div className="a11y-panel-header">
            <h3>{t('accessibility_settings')}</h3>
          </div>

          <div className="a11y-panel-body">
            <div className="a11y-option">
              <label className="a11y-label">{t('contrast')}</label>
              <ThemeToggle />
            </div>

            <div className="a11y-option">
              <label className="a11y-label">{t('language') || 'Idioma'}</label>
              <LanguageSelector />
            </div>
          </div>

          <button className="a11y-close-btn" onClick={() => setIsOpen(false)}>
            {t('close') || 'Cerrar'}
          </button>
        </div>
      )}
    </div>
  );
}
