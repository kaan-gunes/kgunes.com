import React, { useEffect, useState, useRef, memo } from 'react';
import { motion, useMotionValue } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import './CustomCursor.css';

const CustomCursor = memo(() => {
    const { t } = useTranslation();
    const [isVisible, setIsVisible] = useState(false);

    // UI Render için state'ler
    const [hoverState, setHoverState] = useState({
        isHovered: false,
        isProjectHover: false,
        cursorText: ''
    });

    // Logic için Ref'ler (Event listener içinde güncel değeri okumak için)
    const stateRef = useRef({
        isHovered: false,
        isProjectHover: false
    });

    const timeoutRef = useRef(null);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    // Tek bir useEffect ile tüm event'leri yönetiyoruz
    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
            if (!isVisible) setIsVisible(true);
        };

        const handleMouseDown = () => {
            updateState({ isHovered: true });
        };

        const handleMouseUp = () => {
            // Sadece proje üzerinde değilsek hover'ı kapat, proje üzerindeyken kalabilir
            if (!stateRef.current.isProjectHover) {
                updateState({ isHovered: false });
            }
        };

        const updateState = (newState) => {
            // Ref'i güncelle
            stateRef.current = { ...stateRef.current, ...newState };

            // State'i güncelle (Render tetikle)
            setHoverState(prev => ({ ...prev, ...newState }));
        };

        const handleMouseOver = (e) => {
            const target = e.target;

            // 1. Proje Kartı Kontrolü
            const projectCard = target.closest('[data-cursor="project"]');

            if (projectCard) {
                // Eğer bir kapanma sayacı varsa iptal et
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                    timeoutRef.current = null;
                }

                // Eğer zaten proje modunda değilsek güncelle
                if (!stateRef.current.isProjectHover) {
                    updateState({
                        isProjectHover: true,
                        cursorText: t('cursor.inspect', 'INSPECT'),
                        isHovered: true
                    });
                }
            } else {
                // Proje kartından çıkıldıysa
                if (stateRef.current.isProjectHover && !timeoutRef.current) {
                    timeoutRef.current = setTimeout(() => {
                        updateState({
                            isProjectHover: false,
                            cursorText: ''
                        });
                        timeoutRef.current = null;
                    }, 50); // 50ms tolerans (Daha kısa tutarak bug ihtimalini azaltalım)
                }
            }

            // 2. Normal Tıklanabilir Element Kontrolü
            // Sadece proje modu aktif değilse veya proje modundan çıkıyorsak kontrol et
            if (!projectCard && !stateRef.current.isProjectHover) {
                const isClickable =
                    target.tagName === 'A' ||
                    target.tagName === 'BUTTON' ||
                    target.closest('a') ||
                    target.closest('button') ||
                    target.classList.contains('clickable') ||
                    window.getComputedStyle(target).cursor === 'pointer';

                if (stateRef.current.isHovered !== isClickable) {
                    updateState({ isHovered: isClickable });
                }
            }
        };

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);
        // mouseover yerine mousemove içinde de kontrol yapılabilir ama performans için mouseover + ref daha iyi
        // Ancak tutarlılık için mouseover'da kalalım, ref kullanımı sorunu çözecektir.
        window.addEventListener('mouseover', handleMouseOver);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            window.removeEventListener('mouseover', handleMouseOver);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [cursorX, cursorY, isVisible, t]); // isProjectHover artık dependency değil!

    // Mobilde veya touch cihazlarda gösterme
    const [isTouch, setIsTouch] = useState(false);
    
    useEffect(() => {
        // Check for touch device
        const isTouchDevice = 'ontouchstart' in window || 
            navigator.maxTouchPoints > 0 || 
            window.matchMedia('(pointer: coarse)').matches;
        setIsTouch(isTouchDevice);
    }, []);
    
    if (isTouch) {
        return null;
    }

    const { isProjectHover, isHovered, cursorText } = hoverState;

    return (
        <motion.div
            className={`cursor-dot ${isProjectHover ? 'project-hover' : ''}`}
            style={{
                top: 0,
                left: 0,
                x: cursorX,
                y: cursorY,
                opacity: isVisible ? 1 : 0,
                contain: 'layout style',
            }}
            animate={{
                width: isProjectHover ? 80 : (isHovered ? 40 : 14),
                height: isProjectHover ? 80 : (isHovered ? 40 : 14),
                backgroundColor: isProjectHover ? "rgba(255, 255, 255, 0.1)" : "white",
                border: isProjectHover ? "1px solid rgba(255, 255, 255, 0.3)" : "none",
            }}
            transition={{
                type: "spring",
                stiffness: 250,
                damping: 25,
                mass: 0.4
            }}
        >
            {isProjectHover && (
                <span className="cursor-text">{cursorText}</span>
            )}
        </motion.div>
    );
});

export default CustomCursor;
