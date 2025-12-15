import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './CardDetailView.css';

// Kart ID -> Klasör eşleşmesi
const CARD_FOLDERS = {
    1: { folder: 'logo', title: 'Logolar' },
    2: { folder: 'clothing', title: 'Giyim Tasarımları' },
    3: { folder: 'irl', title: 'Afişler' },
    4: { folder: 'sosyalmedya', title: 'Sosyal Medya' },
};

// Görseller - her klasör için hardcoded (performans için)
const GALLERY_IMAGES = {
    logo: [
        'astra.webp', 'bosphorus.webp', 'gorgez.webp', 'infinitech.webp',
        'itu sf.webp', 'ituspor.webp', 'kage logo.webp', 'kovak.webp', 'notmatix.webp'
    ],
    clothing: [
        // Manken görselleri (vektörelsiz olanlar + vektöreli olanlar)
        { mannequin: 'infinitech.webp', vector: 'infinitech vektorel.webp' },
        { mannequin: 'itu basket forma 1.webp', vector: 'itu basket forma 1 vektorel.webp' },
        { mannequin: 'itu basket forma 2.webp', vector: 'itu basket forma 2 vektorel.webp' },
        { mannequin: 'itu forma 1.webp', vector: 'itu forma 1 vektorel.webp' },
        { mannequin: 'itu hoodie 1.webp', vector: 'itu hoodie 1 vektrorel.webp' },
        { mannequin: 'itu hoodie 2.webp', vector: 'itu hoodie 2 vektorel.webp' },
        { mannequin: 'itu tshirt 1.webp', vector: 'itu tshirt 1 vektorel.webp' },
        { single: 'itu basket forma 2.1.webp' },
        { single: 'itu hoodie 3.webp' },
        { single: 'mezun hoodie 1 vektrorel.webp' },
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

// Clothing için özel görsel komponenti
const ClothingImage = ({ item, basePath }) => {
    const [showVector, setShowVector] = useState(false);

    if (item.single) {
        return (
            <GalleryImage
                src={`${basePath}/${item.single}`}
                alt={item.single}
                isClothing={false}
            />
        );
    }

    const currentImage = showVector ? item.vector : item.mannequin;

    return (
        <GalleryImage
            src={`${basePath}/${currentImage}`}
            alt={currentImage}
            onClick={() => setShowVector(!showVector)}
            isClothing={true}
            showVector={showVector}
        />
    );
};

const CardDetailView = ({ cardId, onClose }) => {
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
                    <h2>{cardInfo.title}</h2>
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
                            <ClothingImage key={index} item={item} basePath={basePath} />
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
