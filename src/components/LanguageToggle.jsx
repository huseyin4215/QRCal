import React from 'react';

/**
 * Language toggle button for legal/policy pages.
 * Displays a small flag + language name toggle in the header area.
 */
const LanguageToggle = ({ lang, toggleLang }) => {
    return (
        <button
            onClick={toggleLang}
            className="language-toggle-btn"
            title={lang === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
        >
            <span className="language-toggle-flag">{lang === 'tr' ? '🇬🇧' : '🇹🇷'}</span>
            <span className="language-toggle-text">{lang === 'tr' ? 'English' : 'Türkçe'}</span>
        </button>
    );
};

export default LanguageToggle;
