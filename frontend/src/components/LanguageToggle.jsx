import { useTranslation } from 'react-i18next';
import './LanguageToggle.css';

function LanguageToggle() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'tr' ? 'en' : 'tr';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            className={`language-toggle ${i18n.language}`}
            onClick={toggleLanguage}
            aria-label="Toggle language"
        >
            {/* Sliding indicator */}
            <div className="lang-slider" />

            {/* Text */}
            <span className={`lang-option ${i18n.language === 'en' ? 'active' : ''}`}>EN</span>
            <span className={`lang-option ${i18n.language === 'tr' ? 'active' : ''}`}>TR</span>
        </button>
    );
}

export default LanguageToggle;
