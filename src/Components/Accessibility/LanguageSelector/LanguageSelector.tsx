import React from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSelector() {
  const { i18n } = useTranslation();

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const locale = event.target.value;
    i18n.changeLanguage(locale);   // Crucial for screen readers! Updates the HTML document language attribute
    document.documentElement.setAttribute('lang', locale);
  };

  return (
    <div style={{ margin: '10px 0' }}>
      <label htmlFor="lang-select" style={{ marginRight: '8px' }}>Language: </label>
      <select 
        id="lang-select" 
        onChange={changeLanguage} 
        defaultValue={i18n.language}
      >
        <option value="en">English</option>
        <option value="es">Español</option>
        <option value="cat">Català</option>
      </select>
    </div>
  );
}