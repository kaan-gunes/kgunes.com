import React from 'react';
import { useTranslation } from 'react-i18next';
import './AboutCard.css';

const AboutCard = () => {
  const { t } = useTranslation();

  return (
    <div className="about-card-container">
      <div className="about-card-inner liquid-glass">
        <div className="about-card-content">
          <p dangerouslySetInnerHTML={{ __html: t("about.long_description") }} />
        </div>
      </div>
    </div>
  );
};

export default AboutCard;
