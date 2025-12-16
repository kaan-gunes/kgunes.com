import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './CardDetailView.css';

// Kart ID -> Klasör eşleşmesi
const CARD_FOLDERS = {
    1: { folder: 'logo', titleKey: 'cards.logos' },
    2: { folder: 'clothing', titleKey: 'cards.clothing' },
    3: { folder: 'irl', titleKey: 'cards.posters' },
    4: { folder: 'sosyalmedya', titleKey: 'cards.socialMedia' },
};

// Görseller - her klasör için hardcoded (performans için)
const GALLERY_IMAGES = {
    logo: [
        'astra.webp', 'bosphorus.webp', 'gorgez.webp', 'infinitech.webp',
        'itu sf.webp', 'ituspor.webp', 'kage logo.webp', 'kovak.webp', 'notmatix.webp'
    ],
    clothing: [
        // Manken görselleri + vektörel karşılıkları
        { mannequin: 'infinitech.webp', vector: 'infinitech vektorel.webp' },
        { mannequin: 'itu basket forma 1.webp', vector: 'itu basket forma 1 vektorel.webp' },
        { mannequin: 'itu basket forma 2.webp', vector: 'itu basket forma 2 vektorel.webp' },
        { mannequin: 'itu forma 1.webp', vector: 'itu forma 1 vektorel.webp' },
        { mannequin: 'itu hoodie 1.webp', vector: 'itu hoodie 1 vektrorel.webp' },
        { mannequin: 'itu hoodie 2.webp', vector: 'itu hoodie 2 vektorel.webp' },
        { mannequin: 'itu hoodie 3.webp', vector: 'itu hoodie 3 vektorel.webp' },
        { mannequin: 'itu tshirt 1.webp', vector: 'itu tshirt 1 vektorel.webp' },
    ],
    irl: [
        'afis_sf.webp', 'cd.webp', 'cd_kapak.webp', 'erasmus.webp',
        'gurur2024.webp', 'gurur2025.webp', 'hedef_itü.webp'
    ],
    sosyalmedya: [
        '10_kasım.webp', 'YUSUF.webp', 'alp 2.webp', 'alp.webp', 'bahadır_dg.webp',
        'bayram.webp', 'dudomi_sf.webp', 'erasmus_gidenler.webp', 'erasmus_hazirlik.webp',
        'hamza.webp', 'iel_sf.webp', 'itu_basket.webp', 'kaan_dg.webp', 'kabatas_hazirlik.webp',
        'kasım_sf.webp', 'kasım_sf_pre.webp', 'kerem.webp', 'komite_sf.webp', 'mvp_sf.webp',
        'son_1.webp', 'son_2.webp', 'son_5.webp', 'ugur_dg.webp', 'yusuf dg.webp',
        'yuzdelik.webp', 'zenith eventco.webp'
    ]
};

// Tek görsel komponenti - doğal aspect ratio ile
const GalleryImage = ({ src, alt, onClick, isClothing, showVector }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [aspectRatio, setAspectRatio] = useState(1);

    const handleLoad = (e) => {
        const img = e.target;
        setAspectRatio(img.naturalWidth / img.naturalHeight);
        setLoaded(true);
    };

    return (
        <motion.div
            className={`gallery-item ${isClothing ? 'clothing-item' : ''}`}
            style={{ aspectRatio: aspectRatio }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={onClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {!loaded && !error && (
                <div className="skeleton-loader">
                    <div className="skeleton-shimmer"></div>
                </div>
            )}
            <img
                src={src}
                alt={alt}
                onLoad={handleLoad}
                onError={() => setError(true)}
                style={{ opacity: loaded ? 1 : 0 }}
                draggable="false"
            />
            {isClothing && !showVector && (
                <div className="clothing-hint">
                    <span>Vektörel için tıkla</span>
                </div>
            )}
        </motion.div>
    );
};

// Clothing için özel görsel komponenti - blur crossfade animasyonu
const ClothingImage = ({ item, basePath, t }) => {
    const [showVector, setShowVector] = useState(false);
    const [mannequinLoaded, setMannequinLoaded] = useState(false);
    const [vectorLoaded, setVectorLoaded] = useState(false);

    return (
        <motion.div
            className="clothing-crossfade-container"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            onClick={() => setShowVector(!showVector)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Mannequin Image */}
            <motion.div
                className="clothing-image-layer"
                animate={{
                    opacity: showVector ? 0 : 1,
                    scale: showVector ? 0.95 : 1,
                    filter: showVector ? 'blur(8px)' : 'blur(0px)'
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
                <img
                    src={`${basePath}/${item.mannequin}`}
                    alt={item.mannequin}
                    onLoad={() => setMannequinLoaded(true)}
                    style={{ opacity: mannequinLoaded ? 1 : 0 }}
                    draggable="false"
                />
                {!mannequinLoaded && (
                    <div className="skeleton-loader">
                        <div className="skeleton-shimmer"></div>
                    </div>
                )}
            </motion.div>

            {/* Vector Image */}
            <motion.div
                className="clothing-image-layer clothing-vector-layer"
                animate={{
                    opacity: showVector ? 1 : 0,
                    scale: showVector ? 1 : 1.05,
                    filter: showVector ? 'blur(0px)' : 'blur(8px)'
                }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
                <img
                    src={`${basePath}/${item.vector}`}
                    alt={item.vector}
                    onLoad={() => setVectorLoaded(true)}
                    style={{ opacity: vectorLoaded ? 1 : 0 }}
                    draggable="false"
                />
                {!vectorLoaded && showVector && (
                    <div className="skeleton-loader">
                        <div className="skeleton-shimmer"></div>
                    </div>
                )}
            </motion.div>

            {/* Label */}
            <div className={`clothing-mode-label ${showVector ? 'vector-mode' : 'mannequin-mode'}`}>
                <span>{showVector ? t('project.vectorDesign') : t('project.mannequinView')}</span>
            </div>

            {/* Tap hint */}
            <motion.div
                className="tap-hint"
                animate={{ opacity: showVector ? 0 : 1 }}
                transition={{ duration: 0.2 }}
            >
                <span>{t('project.tapToFlip')}</span>
            </motion.div>
        </motion.div>
    );
};

const CardDetailView = ({ cardId, onClose }) => {
    const { t } = useTranslation();
    const cardInfo = CARD_FOLDERS[cardId];
    const basePath = `/images/${cardInfo?.folder}`;
    const images = GALLERY_IMAGES[cardInfo?.folder] || [];

    // ESC tuşu ile kapatma
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const containerRef = React.useRef(null);



    if (!cardInfo) return null;

    const isClothing = cardInfo.folder === 'clothing';

    return (
        <motion.div
            className="card-detail-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={onClose}
        >
            <motion.div
                ref={containerRef}
                className="card-detail-container"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                onClick={(e) => e.stopPropagation()}
                data-lenis-prevent
            >
                {/* Header */}
                <div className="card-detail-header">
                    <h2>{t(cardInfo.titleKey)}</h2>
                    <button className="close-button" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Gallery Grid - Masonry with natural aspect ratios */}
                <div className="gallery-grid">
                    {isClothing ? (
                        // Clothing özel: manken/vektörel toggle
                        images.map((item, index) => (
                            <ClothingImage key={index} item={item} basePath={basePath} t={t} />
                        ))
                    ) : (
                        // Normal galeri
                        images.map((img, index) => (
                            <GalleryImage
                                key={img}
                                src={`${basePath}/${img}`}
                                alt={img}
                            />
                        ))
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

export default CardDetailView;
