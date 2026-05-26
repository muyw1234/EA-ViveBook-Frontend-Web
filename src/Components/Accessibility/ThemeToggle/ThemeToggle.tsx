import { useState, useEffect } from 'react';

export default function ThemeToggle() {
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
      style={{ padding: '8px 12px', cursor: 'pointer' }}
    >
      {highContrast ? 'Disable High Contrast' : 'Enable High Contrast Mode'}
    </button>
  );
}