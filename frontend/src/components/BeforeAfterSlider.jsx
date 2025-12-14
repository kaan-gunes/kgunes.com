import React, { useRef, useEffect } from 'react';
import './BeforeAfterSlider.css';

const BeforeAfterSlider = () => {
    // State yerine Ref kullanıyoruz (Render loop'a girmemek için)
    const containerRef = useRef(null);
    const afterImageRef = useRef(null);
    const handleRef = useRef(null);
    const containerRectRef = useRef(null);
    const isDragging = useRef(false);
    const rafRef = useRef(null);

    const updateRect = () => {
        if (containerRef.current) {
            containerRectRef.current = containerRef.current.getBoundingClientRect();
        }
    };

    useEffect(() => {
        updateRect();
        window.addEventListener('resize', updateRect);
        window.addEventListener('scroll', updateRect);
        return () => {
            window.removeEventListener('resize', updateRect);
            window.removeEventListener('scroll', updateRect);
        };
    }, []);

    const updateSliderStyles = (percentage) => {
        if (afterImageRef.current) {
            afterImageRef.current.style.clipPath = `inset(0 ${100 - percentage}% 0 0)`;
            // will-change optimizasyonu CSS'den geliyor
        }
        if (handleRef.current) {
            handleRef.current.style.left = `${percentage}%`;
        }
    };

    const handleMove = (clientX) => {
        if (!isDragging.current) return;

        if (!containerRectRef.current || containerRectRef.current.width === 0) {
            updateRect();
        }

        const rect = containerRectRef.current;
        if (!rect) return;

        if (rafRef.current) return;

        rafRef.current = requestAnimationFrame(() => {
            const x = clientX - rect.left;
            const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));

            // Direct DOM update (No React Render)
            updateSliderStyles(percentage);

            rafRef.current = null;
        });
    };

    const handleMouseDown = () => {
        isDragging.current = true;
        updateRect();
        document.body.style.cursor = 'ew-resize';
        document.body.style.userSelect = 'none';
        if (afterImageRef.current) afterImageRef.current.style.willChange = 'clip-path';
        if (handleRef.current) handleRef.current.style.willChange = 'left';
    };

    const handleMouseUp = () => {
        isDragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        if (rafRef.current) {
            cancelAnimationFrame(rafRef.current);
            rafRef.current = null;
        }

        // Optimizations off
        if (afterImageRef.current) afterImageRef.current.style.willChange = 'auto';
        if (handleRef.current) handleRef.current.style.willChange = 'auto';
    };

    useEffect(() => {
        const handleGlobalMouseMove = (e) => {
            if (isDragging.current) handleMove(e.clientX);
        };

        const handleGlobalMouseUp = () => {
            if (isDragging.current) handleMouseUp();
        };

        window.addEventListener('mousemove', handleGlobalMouseMove, { passive: true });
        window.addEventListener('mouseup', handleGlobalMouseUp);

        return () => {
            window.removeEventListener('mousemove', handleGlobalMouseMove);
            window.removeEventListener('mouseup', handleGlobalMouseUp);
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, []);

    const handleTouchMove = (e) => handleMove(e.touches[0].clientX);
    const handleTouchStart = () => handleMouseDown();

    return (
        <section className="before-after-section">
            <div className="before-after-container">
                {/* Sol taraf - PS Logo ve Yazı */}
                <div className="slider-left-content">
                    <img
                        src="/slider/ps_logo.webp"
                        alt="Photoshop"
                        className="ps-logo"
                    />
                    <h2 className="slider-title">
                        Hayalini<br />
                        <span>Gerçeğe Çevir</span>
                    </h2>
                </div>

                {/* Sağ taraf - Before/After Slider */}
                <div
                    className="slider-wrapper"
                    ref={containerRef}
                    onMouseDown={handleMouseDown}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleMouseUp}
                >
                    {/* Before Image (Alt) */}
                    <img
                        src="/slider/kasım_sf_pre.webp"
                        alt="Before"
                        className="slider-image before-image"
                        draggable="false"
                    />

                    {/* After Image (Üst - Clip ile kesilmiş) */}
                    <img
                        ref={afterImageRef}
                        src="/slider/kasım_sf.webp"
                        alt="After"
                        className="slider-image after-image"
                        style={{ clipPath: 'inset(0 50% 0 0)' }}
                        draggable="false"
                    />

                    {/* Slider Handle */}
                    <div
                        ref={handleRef}
                        className="slider-handle"
                        style={{ left: '50%' }}
                    >
                        <div className="slider-line"></div>
                        <div className="slider-button">
                            <span className="arrow left">‹</span>
                            <span className="arrow right">›</span>
                        </div>
                    </div>

                    {/* Labels */}
                    <span className="label before-label">ÖNCE</span>
                    <span className="label after-label">SONRA</span>
                </div>
            </div>
        </section>
    );
};

export default BeforeAfterSlider;
