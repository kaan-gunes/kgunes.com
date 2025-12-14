import React, { useState, useEffect, memo, useRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from 'framer-motion';

const PROJECT_DATA = [
  { id: 1, title: "Logolar", image: "/images/CARDS/sf_logo_card.webp" },
  { id: 2, title: "Giyim Tasarımaları", image: "/images/CARDS/hoodie_card.webp" },
  { id: 3, title: "Afişler", image: "/images/CARDS/cd_card.webp" },
  { id: 4, title: "Sosyal Medya", image: "/images/CARDS/sf_st_card.webp" },
];

// Ultra smooth spring konfigürasyonu
const smoothSpring = {
  type: "spring",
  stiffness: 180,
  damping: 22,
  mass: 0.8,
};

// Memoized Single Card Component with ForwardRef
const CardItem = memo(React.forwardRef(({ card, index, isHovered, isMobile, isTablet, totalCards }, ref) => {
  // Z-index calculation
  const zIndex = isHovered ? 100 : totalCards - index;

  return (
    <div
      ref={ref}
      style={{
        width: isMobile ? 200 : isTablet ? 300 : 380,
        height: isMobile ? 280 : isTablet ? 420 : 530,
        marginLeft: index === 0 ? 0 : isMobile ? -30 : -70,
        cursor: 'pointer',
        position: 'relative',
        zIndex,
        transformStyle: 'preserve-3d',
        transform: `translateZ(${-index * 80}px)`,
      }}
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
          y: isHovered ? -50 : 0,
          rotateY: isHovered ? 0 : -15,
          rotateX: isHovered ? 0 : 4,
          scale: isHovered ? 1.05 : 1,
        }}
        transition={smoothSpring}
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
            top: isMobile ? '-45px' : isTablet ? '-55px' : '-65px',
            left: 0,
            pointerEvents: 'none',
            textShadow: '0 2px 15px rgba(0,0,0,0.6)',
            willChange: 'opacity, transform',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, sans-serif',
            fontSize: isMobile ? '1.5rem' : isTablet ? '2rem' : '2.5rem',
            fontWeight: 600,
            color: 'white',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.02em',
          }}
        >
          {card.title}
        </motion.h3>

        {/* Dark Overlay (Brightness Replacement) */}
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
          <img
            src={card.image}
            alt={card.title}
            loading="eager"
            draggable="false"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}));

const CardStack3D = ({ setCursorVariant }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const containerRef = useRef(null);
  const cardRefs = useRef([]);

  // Global mouse takibi - 3D parallax efekti için
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 40, stiffness: 100, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.set((e.clientX / window.innerWidth) - 0.5);
      mouseY.set((e.clientY / window.innerHeight) - 0.5);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setCursorVariant?.(hoveredIndex !== null ? 'project' : 'default');
  }, [hoveredIndex, setCursorVariant]);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1024;

  // Performans: rAF throttle için ref
  const rafRef = useRef(null);
  // Anlık hover değerini ref ile tut (closure sorununu önlemek için)
  const hoveredIndexRef = useRef(null);

  // Rects cache
  const cardRectsRef = useRef([]);

  const updateCardRects = useCallback(() => {
    cardRectsRef.current = cardRefs.current.map(el => el ? el.getBoundingClientRect() : null);
  }, []);

  useEffect(() => {
    updateCardRects();
    window.addEventListener('resize', updateCardRects);
    window.addEventListener('scroll', updateCardRects, { passive: true });
    return () => {
      window.removeEventListener('resize', updateCardRects);
      window.removeEventListener('scroll', updateCardRects);
    };
  }, [updateCardRects]);

  // Gerçek DOM elementlerinin bounding rect'ine göre hover hesapla (Cache kullanarak)
  const handleContainerMouseMove = useCallback((e) => {
    // Rects boşsa güncelle (ilk giriş vs)
    if (cardRectsRef.current.length === 0) updateCardRects();

    // rAF varsa atla (throttle)
    if (rafRef.current) return;

    const mouseClientX = e.clientX;
    const mouseClientY = e.clientY;

    rafRef.current = requestAnimationFrame(() => {
      let foundIndex = null;

      // Sağdan sola kontrol et (görsel olarak üstte olan kartlar önce)
      for (let i = PROJECT_DATA.length - 1; i >= 0; i--) {
        const rect = cardRectsRef.current[i];
        if (!rect) continue;

        if (
          mouseClientX >= rect.left &&
          mouseClientX <= rect.right &&
          mouseClientY >= rect.top &&
          mouseClientY <= rect.bottom
        ) {
          foundIndex = i;
          break; // İlk bulunanı al ve çık
        }
      }

      // Sadece index değiştiyse state güncelle (Render optimization)
      if (hoveredIndexRef.current !== foundIndex) {
        setHoveredIndex(foundIndex);
        hoveredIndexRef.current = foundIndex;
      }

      rafRef.current = null;
    });
  }, [updateCardRects]);

  // Cleanup cleanup
  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section style={{
      position: 'absolute',
      top: 'calc(200vh + 35vw)', // Responsive: vw-based offset
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      minHeight: '500px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: 'clamp(10px, 2vw, 20px)'
    }}>
      {/* Kocaman Arka Plan Başlık */}
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 1 }}
        style={{
          position: 'absolute',
          top: '10%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: 'clamp(120px, 20vw, 280px)',
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
        Çalışmalarım
      </motion.h2>

      {/* Kart Destesi */}
      <motion.div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          perspective: '2000px',
          zIndex: 1,
          marginTop: '150px',
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
              isMobile={isMobile}
              isTablet={isTablet}
              totalCards={PROJECT_DATA.length}
            />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
};

export default memo(CardStack3D);