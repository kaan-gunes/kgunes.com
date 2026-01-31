import React, { useState, useEffect, memo, useCallback } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './CardDetailView.css';
import './CardStack3D.css';

// Optimized animation variants
const fadeVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

const scaleVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 20 }
};

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
        'itu sf.webp', 'eftos.webp', 'ituspor.webp', 'kage logo.webp', 'kovak.webp', 'notmatix.webp'
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
        '1.webp', '2.webp', '3.webp', '4.webp', '5.webp',
        'brosur_1.webp', 'brosur_2.webp',
        // Images with _pre (before) versions
        { main: 'afis_sf.webp', pre: 'afis_sf_pre.webp' },
        { main: 'cd.webp', pre: 'cd_pre.webp' },
        { main: 'cd_kapak.webp', pre: 'cd_kapak_pre.webp' },
        { main: 'erasmus.webp', pre: 'erasmus_pre.webp' },
        { main: 'gurur2024.webp', pre: 'gurur2024_pre.webp' },
        { main: 'gurur2025.webp', pre: 'gurur2025_pre.webp' },
        { main: 'hedef_itu.webp', pre: 'hedef_itu_pre.webp' }
    ],
    sosyalmedya: [
        '10_kasim.webp', 'zenith_eventco.webp', 'yusuf.webp', 'alp_2.webp', 'alp.webp',
        'bayram.webp', 'dudomi_sf.webp', 'erasmus_gidenler.webp', 'erasmus_hazirlik.webp',
        'hamza.webp', 'iel_sf.webp', 'kaan_dg.webp', 'kabatas_hazirlik.webp',
        'kasim_sf.webp', 'cemberlitas.webp', 'kerem.webp', 'komite_sf.webp', 'mvp_sf.webp',
        'son_1.webp', 'son_5.webp', 'ugur_dg.webp', 'yuzdelik.webp'
    ]
};

// Full Screen Image Viewer Component
const ImageViewer = ({ src, onClose }) => {
    // ESC tuşu CardDetailView tarafından yönetiliyor

    return ReactDOM.createPortal(
        <motion.div
            className="image-viewer-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <button className="viewer-close-btn" onClick={onClose}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6L6 18M6 6l12 12" />
                </svg>
            </button>
            <motion.div
                className="image-viewer-content"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                onClick={(e) => e.stopPropagation()}
            >
                <img src={src} alt="Full Screen" draggable="false" />
            </motion.div>
        </motion.div>,
        document.body
    );
};

// Tek görsel komponenti - doğal aspect ratio ile (memoized)
const GalleryImage = memo(({ src, alt, onClick, isClothing, showVector }) => {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [aspectRatio, setAspectRatio] = useState(1);

    const handleLoad = useCallback((e) => {
        const img = e.target;
        setAspectRatio(img.naturalWidth / img.naturalHeight);
        setLoaded(true);
    }, []);

    const handleClick = useCallback(() => onClick(src), [onClick, src]);

    return (
        <motion.div
            className={`gallery-item ${isClothing ? 'clothing-item' : ''}`}
            style={{ aspectRatio: aspectRatio, contain: 'layout style' }}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={handleClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {!loaded && !error && (
                <div className="card-loading-spinner" />
            )}
            <img
                src={src}
                alt={alt}
                loading="lazy"
                decoding="async"
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
});

// Clothing için özel görsel komponenti - blur crossfade animasyonu (memoized)
const ClothingImage = memo(({ item, basePath, t, onEnlarge }) => {
    const [showVector, setShowVector] = useState(false);
    const [mannequinLoaded, setMannequinLoaded] = useState(false);
    const [vectorLoaded, setVectorLoaded] = useState(false);

    const toggleView = useCallback((e) => {
        e.stopPropagation();
        setShowVector(prev => !prev);
    }, []);

    const handleEnlarge = useCallback(() => {
        const currentSrc = showVector
            ? `${basePath}/${item.vector}`
            : `${basePath}/${item.mannequin}`;
        onEnlarge(currentSrc);
    }, [showVector, basePath, item, onEnlarge]);

    return (
        <motion.div
            className={`clothing-crossfade-container ${showVector ? 'show-alternate' : ''}`}
            style={{ contain: 'layout style' }}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={handleEnlarge}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Mannequin Image - showVector false iken relative, true iken absolute */}
            <motion.div
                className={`clothing-image-layer ${showVector ? 'clothing-hidden-layer' : ''}`}
                animate={{
                    opacity: showVector ? 0 : 1,
                    scale: showVector ? 0.92 : 1,
                    rotateY: showVector ? -15 : 0,
                    x: showVector ? -20 : 0,
                    filter: showVector ? 'blur(12px) brightness(0.7)' : 'blur(0px) brightness(1)'
                }}
                transition={{
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <img
                    src={`${basePath}/${item.mannequin}`}
                    alt={item.mannequin}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setMannequinLoaded(true)}
                    style={{ opacity: mannequinLoaded ? 1 : 0 }}
                    draggable="false"
                />
                {!mannequinLoaded && (
                    <div className="card-loading-spinner" />
                )}
            </motion.div>

            {/* Vector Image - showVector true iken relative, false iken absolute */}
            <motion.div
                className={`clothing-image-layer ${!showVector ? 'clothing-hidden-layer' : ''}`}
                animate={{
                    opacity: showVector ? 1 : 0,
                    scale: showVector ? 1 : 0.92,
                    rotateY: showVector ? 0 : 15,
                    x: showVector ? 0 : 20,
                    filter: showVector ? 'blur(0px) brightness(1)' : 'blur(12px) brightness(0.7)'
                }}
                transition={{
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <img
                    src={`${basePath}/${item.vector}`}
                    alt={item.vector}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setVectorLoaded(true)}
                    style={{ opacity: vectorLoaded ? 1 : 0 }}
                    draggable="false"
                />
                {!vectorLoaded && showVector && (
                    <div className="card-loading-spinner" />
                )}
            </motion.div>

            {/* Label */}
            <div className={`clothing-mode-label ${showVector ? 'vector-mode' : 'mannequin-mode'}`}>
                <span>{showVector ? t('project.vectorDesign') : t('project.mannequinView')}</span>
            </div>

            {/* Tap hint */}
            <div
                className="tap-hint"
                onClick={toggleView}
            >
                <span>{t('project.tapToFlip')}</span>
            </div>
        </motion.div>
    );
});

// IRL için özel görsel komponenti - before/after blur crossfade animasyonu (memoized)
const IrlImage = memo(({ item, basePath, t, onEnlarge }) => {
    const [showPre, setShowPre] = useState(false);
    const [mainLoaded, setMainLoaded] = useState(false);
    const [preLoaded, setPreLoaded] = useState(false);

    const toggleView = useCallback((e) => {
        e.stopPropagation();
        setShowPre(prev => !prev);
    }, []);

    const handleEnlarge = useCallback(() => {
        const currentSrc = showPre
            ? `${basePath}/${item.pre}`
            : `${basePath}/${item.main}`;
        onEnlarge(currentSrc);
    }, [showPre, basePath, item, onEnlarge]);

    return (
        <motion.div
            className={`clothing-crossfade-container irl-crossfade-container ${showPre ? 'show-alternate' : ''}`}
            style={{ contain: 'layout style' }}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3, ease: 'easeOut' }}
            onClick={handleEnlarge}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Main Image (After) - showPre false iken relative, true iken absolute */}
            <motion.div
                className={`clothing-image-layer ${showPre ? 'clothing-hidden-layer' : ''}`}
                animate={{
                    opacity: showPre ? 0 : 1,
                    scale: showPre ? 0.92 : 1,
                    rotateY: showPre ? -15 : 0,
                    x: showPre ? -20 : 0,
                    filter: showPre ? 'blur(12px) brightness(0.7)' : 'blur(0px) brightness(1)'
                }}
                transition={{
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <img
                    src={`${basePath}/${item.main}`}
                    alt={item.main}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setMainLoaded(true)}
                    style={{ opacity: mainLoaded ? 1 : 0 }}
                    draggable="false"
                />
                {!mainLoaded && (
                    <div className="card-loading-spinner" />
                )}
            </motion.div>

            {/* Pre Image (Before) - showPre true iken relative, false iken absolute */}
            <motion.div
                className={`clothing-image-layer ${!showPre ? 'clothing-hidden-layer' : ''}`}
                animate={{
                    opacity: showPre ? 1 : 0,
                    scale: showPre ? 1 : 0.92,
                    rotateY: showPre ? 0 : 15,
                    x: showPre ? 0 : 20,
                    filter: showPre ? 'blur(0px) brightness(1)' : 'blur(12px) brightness(0.7)'
                }}
                transition={{
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94]
                }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                <img
                    src={`${basePath}/${item.pre}`}
                    alt={item.pre}
                    loading="lazy"
                    decoding="async"
                    onLoad={() => setPreLoaded(true)}
                    style={{ opacity: preLoaded ? 1 : 0 }}
                    draggable="false"
                />
                {!preLoaded && showPre && (
                    <div className="card-loading-spinner" />
                )}
            </motion.div>

            {/* Label */}
            <div className={`clothing-mode-label ${showPre ? 'pre-mode' : 'main-mode'}`}>
                <span>{showPre ? t('project.beforeDesign') : t('project.afterDesign')}</span>
            </div>

            {/* Tap hint */}
            <div
                className="tap-hint"
                onClick={toggleView}
            >
                <span>{t('project.tapToFlip')}</span>
            </div>
        </motion.div>
    );
});

const CardDetailView = memo(({ cardId, onClose }) => {
    const { t } = useTranslation();
    const cardInfo = CARD_FOLDERS[cardId];
    const basePath = `/images/${cardInfo?.folder}`;
    const images = GALLERY_IMAGES[cardInfo?.folder] || [];
    const [selectedImage, setSelectedImage] = useState(null); // Lightbox için state

    // ESC tuşu ile kapatma - önce büyütülmüş görsel, sonra modal
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (selectedImage) {
                    // Önce büyütülmüş görseli kapat
                    setSelectedImage(null);
                } else {
                    // Büyütülmüş görsel yoksa modalı kapat
                    onClose();
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose, selectedImage]);

    // Modal açıkken arka plan scroll'unu engelle
    useEffect(() => {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

        // HTML ve Body kilit - En garantili yöntem
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = `${scrollbarWidth}px`;

        // Lenis scroll'u durdur
        if (window.lenis) window.lenis.stop();

        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            // Lenis scroll'u başlat
            if (window.lenis) window.lenis.start();
        };
    }, []);

    const containerRef = React.useRef(null);

    if (!cardInfo) return null;

    const isClothing = cardInfo.folder === 'clothing';
    const isIrl = cardInfo.folder === 'irl';

    // Portal ile body'ye taşıyoruz - bu sayede parent transform'lardan etkilenmez/
    return ReactDOM.createPortal(
        <motion.div
            className="card-detail-overlay"
            variants={fadeVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.25 }}
            onClick={onClose}
            data-lenis-prevent
        >
            <motion.div
                ref={containerRef}
                className="card-detail-container"
                variants={scaleVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                transition={{ duration: 0.25, ease: 'easeOut' }}
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
                            <ClothingImage
                                key={index}
                                item={item}
                                basePath={basePath}
                                t={t}
                                onEnlarge={setSelectedImage}
                            />
                        ))
                    ) : isIrl ? (
                        // IRL galeri: bazı görseller before/after toggle ile
                        images.map((item, index) => {
                            // Eğer item bir obje ise (main/pre), IrlImage kullan
                            if (typeof item === 'object' && item.main && item.pre) {
                                return (
                                    <IrlImage
                                        key={item.main}
                                        item={item}
                                        basePath={basePath}
                                        t={t}
                                        onEnlarge={setSelectedImage}
                                    />
                                );
                            }
                            // Normal string ise GalleryImage kullan
                            return (
                                <GalleryImage
                                    key={item}
                                    src={`${basePath}/${item}`}
                                    alt={item}
                                    onClick={setSelectedImage}
                                />
                            );
                        })
                    ) : (
                        // Normal galeri
                        images.map((img, index) => (
                            <GalleryImage
                                key={img}
                                src={`${basePath}/${img}`}
                                alt={img}
                                onClick={setSelectedImage}
                            />
                        ))
                    )}
                </div>

                <AnimatePresence>
                    {selectedImage && (
                        <ImageViewer
                            src={selectedImage}
                            onClose={() => setSelectedImage(null)}
                        />
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>,
        document.body
    );
});

export default CardDetailView;
