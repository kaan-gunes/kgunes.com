import React, { useState, useEffect, memo, useRef, useCallback, lazy, Suspense } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence, useScroll } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './CardStack3D.css';

// Lazy load CardDetailView (heavy modal component)
const CardDetailView = lazy(() => import('./CardDetailView'));

const PROJECT_DATA = [
  { id: 3, titleKey: "cards.posters", image: "/images/CARDS/cd_card.webp" },
  { id: 4, titleKey: "cards.socialMedia", image: "/images/CARDS/sf_st_card.webp" },
  { id: 2, titleKey: "cards.clothing", image: "/images/CARDS/hoodie_card.webp" },
  { id: 1, titleKey: "cards.logos", image: "/images/CARDS/sf_card.webp" },
];

// Optimized spring configuration
const smoothSpring = {
  type: "spring",
  stiffness: 150,
  damping: 20,
  mass: 0.6,
};

// Reduced motion spring (faster, less animation)
const reducedSpring = {
  type: "spring",
  stiffness: 300,
  damping: 30,
  mass: 0.3,
};

// ============================================
// MOBİL KART - 2x2 Grid için basit, parallax destekli
// ============================================
const MobileCard = memo(({ card, index, onCardClick, t, scrollProgress, reducedMotion }) => {
  const title = t(card.titleKey);
  const isTopRow = index < 2;

  // Üst satır kartları scroll ile yamulur (disabled in reduced motion)
  const rotateX = useTransform(
    scrollProgress,
    [0, 0.3, 0.6],
    reducedMotion ? [0, 0, 0] : (isTopRow ? [0, -6, -12] : [0, 0, 0])
  );

  const y = useTransform(
    scrollProgress,
    [0, 0.6],
    reducedMotion ? [0, 0] : (isTopRow ? [0, -15] : [0, 0])
  );

  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label={`${title} detaylarını aç`}
      onClick={() => onCardClick?.(card.id)}
      data-cursor="project"
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onCardClick?.(card.id);
        }
      }}
      style={{
        width: '100%',
        aspectRatio: '3/4',
        cursor: 'pointer',
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'rgba(20,20,25,1)',
        border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        rotateX,
        y,
        transformPerspective: 1000,
        transformOrigin: 'center bottom',
      }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Title overlay */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 12px',
        background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
        zIndex: 2,
      }}>
        <h3 style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
          fontSize: 'clamp(14px, 4vw, 18px)',
          fontWeight: 600,
          color: 'white',
          margin: 0,
        }}>
          {title}
        </h3>
      </div>

      {!imageLoaded && <div className="card-loading-spinner" />}
      <img
        src={card.image}
        alt={title}
        className={`card-image ${imageLoaded ? 'loaded' : ''}`}
        loading="lazy"
        decoding="async"
        draggable="false"
        onLoad={() => setImageLoaded(true)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
});

// ============================================
// DESKTOP KART - 3D efektli
// ============================================
const CardItem = memo(React.forwardRef(({ card, index, isHovered, isTablet, totalCards, onCardClick, t, reducedMotion }, ref) => {
  const zIndex = isHovered ? 100 : index;
  const title = t(card.titleKey);
  const [imageLoaded, setImageLoaded] = useState(false);
  const springConfig = reducedMotion ? reducedSpring : smoothSpring;

  const activate = () => onCardClick?.(card.id);

  return (
    <div
      ref={ref}
      role="button"
      tabIndex={0}
      aria-label={`${title} detaylarını aç`}
      onPointerUp={(e) => {
        e.stopPropagation();
        activate();
      }}
      onClick={(e) => {
        e.stopPropagation();
        activate();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          e.stopPropagation();
          activate();
        }
      }}
      style={{
        width: isTablet ? 300 : 380,
        height: isTablet ? 420 : 530,
        marginLeft: index === 0 ? 0 : -70,
        cursor: 'pointer',
        position: 'relative',
        zIndex,
        transformStyle: 'preserve-3d',
        transform: 'translateZ(0px)',
        outline: 'none',
        touchAction: 'manipulation',
      }}
      data-cursor="project"
    >
      <motion.div
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute',
          top: 0,
          left: 0,
          borderRadius: '16px',
          transformStyle: 'preserve-3d',
          pointerEvents: 'none',
        }}
        animate={{
          y: isHovered ? (reducedMotion ? -20 : -50) : 0,
          rotateY: reducedMotion ? 0 : (isHovered ? 0 : -15),
          rotateX: reducedMotion ? 0 : (isHovered ? 0 : 4),
          scale: isHovered ? 1.03 : 1,
        }}
        transition={springConfig}
      >
        {/* Title */}
        <motion.h3
          initial={{ opacity: 0, y: 10 }}
          animate={{
            opacity: isHovered ? 1 : 0,
            y: isHovered ? 0 : 10
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            top: isTablet ? '-55px' : '-65px',
            left: 0,
            pointerEvents: 'none',
            textShadow: '0 2px 15px rgba(0,0,0,0.6)',
            willChange: 'opacity, transform',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
            fontSize: isTablet ? '2rem' : '2.5rem',
            fontWeight: 600,
            color: 'white',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.02em',
          }}
        >
          {title}
        </motion.h3>

        {/* Dark Overlay */}
        <motion.div
          className="card-overlay"
          animate={{
            opacity: isHovered ? 0 : 0.4 + index * 0.1
          }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'black',
            zIndex: 2,
            pointerEvents: 'none',
            borderRadius: '16px',
            willChange: 'opacity'
          }}
        />

        {/* Card Content & Image */}
        <motion.div
          style={{
            width: '100%',
            height: '100%',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: '16px',
            background: 'rgba(20,20,25, 1)',
            border: '1px solid rgba(255,255,255,0.1)',
            willChange: 'transform',
          }}
          animate={{
            scale: isHovered ? 1.05 : 1,
            boxShadow: '0 10px 30px -5px rgba(0, 0, 0, 0.5)'
          }}
          transition={smoothSpring}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {!imageLoaded && <div className="card-loading-spinner" />}
            <img
              src={card.image}
              alt={card.title}
              className={`card-image ${imageLoaded ? 'loaded' : ''}`}
              loading="lazy"
              decoding="async"
              draggable="false"
              onLoad={() => setImageLoaded(true)}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}));

// ============================================
// ANA BİLEŞEN
// ============================================
const CardStack3D = ({ setCursorVariant, reducedMotion = false }) => {
  const { t } = useTranslation();
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [selectedCardId, setSelectedCardId] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const containerRef = useRef(null);
  const sectionRef = useRef(null);
  const cardRefs = useRef([]);

  const isMobile = windowWidth < 1200;
  const isTablet = windowWidth >= 1200 && windowWidth < 1440; // Desktop tablet mode if needed

  // Mobil scroll parallax
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  // Desktop mouse tracking (optimized)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springConfig = reducedMotion 
    ? { damping: 60, stiffness: 200, mass: 0.3 }
    : { damping: 40, stiffness: 100, mass: 0.5 };
  const rotateXRange = reducedMotion ? [2, -2] : [8, -8];
  const rotateYRange = reducedMotion ? [-4, 4] : [-12, 12];
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], rotateXRange), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], rotateYRange), springConfig);

  // Mobilde mouse tracking bypass
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, isMobile]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile) {
      setCursorVariant?.(hoveredIndex !== null ? 'project' : 'default');
    }
  }, [hoveredIndex, setCursorVariant, isMobile]);

  // Desktop hover logic
  const rafRef = useRef(null);
  const hoveredIndexRef = useRef(null);
  const cardRectsRef = useRef([]);

  const updateCardRects = useCallback(() => {
    cardRectsRef.current = cardRefs.current.map(el => el ? el.getBoundingClientRect() : null);
  }, []);

  useEffect(() => {
    if (isMobile) return;
    updateCardRects();
    window.addEventListener('resize', updateCardRects);
    window.addEventListener('scroll', updateCardRects, { passive: true });
    return () => {
      window.removeEventListener('resize', updateCardRects);
      window.removeEventListener('scroll', updateCardRects);
    };
  }, [updateCardRects, isMobile]);

  const handleContainerMouseMove = useCallback((e) => {
    if (isMobile) return;
    if (cardRectsRef.current.length === 0) updateCardRects();
    if (rafRef.current) return;

    const mouseClientX = e.clientX;
    const mouseClientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      let foundIndex = null;
      for (let i = PROJECT_DATA.length - 1; i >= 0; i--) {
        const rect = cardRectsRef.current[i];
        if (!rect) continue;
        if (mouseClientX >= rect.left && mouseClientX <= rect.right &&
          mouseClientY >= rect.top && mouseClientY <= rect.bottom) {
          foundIndex = i;
          break;
        }
      }
      if (hoveredIndexRef.current !== foundIndex) {
        setHoveredIndex(foundIndex);
        hoveredIndexRef.current = foundIndex;
      }
      rafRef.current = null;
    });
  }, [updateCardRects, isMobile]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        style={{
          position: isMobile ? 'relative' : 'absolute',
          top: isMobile ? 'auto' : 'calc(2160px + 35vw)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          minHeight: isMobile ? 'auto' : '500px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: isMobile ? '40px 16px' : 'clamp(10px, 2vw, 20px)',
          marginTop: isMobile ? '60px' : '0'
        }}
      >
        {/* Arka Plan Başlık */}
        <motion.h2
          initial={{ opacity: 0 }}
          animate={{ opacity: isMobile ? 0.05 : 0.08 }}
          transition={{ duration: 1 }}
          style={{
            position: 'absolute',
            top: isMobile ? '0%' : '10%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: isMobile ? 'clamp(50px, 16vw, 100px)' : 'clamp(120px, 20vw, 280px)',
            fontWeight: 900,
            letterSpacing: '0.02em',
            color: 'white',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            zIndex: 0,
            userSelect: 'none',
          }}
        >
          {t('cards.title')}
        </motion.h2>

        {/* MOBİL: 2x2 Grid */}
        {isMobile ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            width: '100%',
            maxWidth: '380px',
            marginTop: 'clamp(60px, 12vw, 100px)',
            padding: '0 8px',
            zIndex: 1,
          }}>
            {PROJECT_DATA.map((card, index) => (
              <MobileCard
                key={card.id}
                card={card}
                index={index}
                onCardClick={setSelectedCardId}
                t={t}
                scrollProgress={scrollYProgress}
                reducedMotion={reducedMotion}
              />
            ))}
          </div>
        ) : (
          /* DESKTOP/TABLET: 3D Kart Destesi */
          <motion.div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              perspective: '2000px',
              zIndex: 1,
              marginTop: isTablet ? '120px' : '150px',
              willChange: 'transform',
              transform: 'translateZ(0)',
            }}
          >
            <motion.div
              ref={containerRef}
              onMouseMove={handleContainerMouseMove}
              onMouseLeave={() => setHoveredIndex(null)}
              style={{
                display: 'flex',
                transformStyle: 'preserve-3d',
                rotateX,
                rotateY,
                transformOrigin: 'center center',
              }}
            >
              {PROJECT_DATA.map((card, index) => (
                <CardItem
                  key={card.id}
                  ref={el => cardRefs.current[index] = el}
                  card={card}
                  index={index}
                  isHovered={hoveredIndex === index}
                  isTablet={isTablet}
                  totalCards={PROJECT_DATA.length}
                  onCardClick={setSelectedCardId}
                  t={t}
                  reducedMotion={reducedMotion}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </section>

      <AnimatePresence>
        {selectedCardId && (
          <Suspense fallback={null}>
            <CardDetailView
              cardId={selectedCardId}
              onClose={() => setSelectedCardId(null)}
            />
          </Suspense>
        )}
      </AnimatePresence>
    </>
  );
};

export default memo(CardStack3D);