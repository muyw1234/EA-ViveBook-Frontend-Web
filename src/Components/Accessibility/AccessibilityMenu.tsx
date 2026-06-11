import { useState, useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import LanguageSelector from './LanguageSelector/LanguageSelector';
import './AccessibilityMenu.css';

import { useTranslation } from 'react-i18next';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function AccessibilityMenu() {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { isFocusModeEnabled, toggleFocusMode } = useAccessibility();

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
      {/* Trigger Button */}
      <button
        className="a11y-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Accessibility Options"
      >
        ♿
      </button>

      {/* Accessible Dropdown Panel */}
      {isOpen && (
        <div className="a11y-panel" role="dialog" aria-label="Accessibility Menu">
          <h3>{t('accessibility_settings')}</h3>
          <hr />

          <div className="a11y-option">
            <label>{t('contrast')}:</label>
            <ThemeToggle />
          </div>

          <div className="a11y-option">
            <LanguageSelector />
          </div>

          <div className="a11y-option" style={{ marginTop: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={isFocusModeEnabled}
                onChange={(e) => toggleFocusMode(e.target.checked)}
                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
              />
              <span>{t('focus_reading_tdah', 'Modo TDAH (Lectura)')}</span>
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
