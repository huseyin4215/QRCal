import { useState, useEffect } from 'react';

/**
 * Detects browser language and returns 'tr' or 'en'.
 * Provides a toggle function to switch manually.
 * Persists user preference in localStorage.
 */
export const useLanguage = () => {
    const [lang, setLang] = useState(() => {
        // Check localStorage first (user preference)
        const saved = localStorage.getItem('qnnect_lang');
        if (saved === 'tr' || saved === 'en') return saved;

        // Auto-detect from browser
        const browserLang = navigator.language || navigator.userLanguage || 'en';
        return browserLang.startsWith('tr') ? 'tr' : 'en';
    });

    useEffect(() => {
        localStorage.setItem('qnnect_lang', lang);
    }, [lang]);

    const toggleLang = () => setLang(prev => prev === 'tr' ? 'en' : 'tr');

    return { lang, setLang, toggleLang, isTr: lang === 'tr', isEn: lang === 'en' };
};

export default useLanguage;
