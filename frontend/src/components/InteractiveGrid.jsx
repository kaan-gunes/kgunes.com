import React, { useRef, useEffect, useState } from 'react';

const InteractiveGrid = ({ isVisible = false }) => {
    const canvasRef = useRef(null);
    const [introComplete, setIntroComplete] = useState(false);
    const [scrollOpacity, setScrollOpacity] = useState(1);

    // Mouse tracking
    const mouse = useRef({ x: -1000, y: -1000 });
    const smoothMouse = useRef({ x: -1000, y: -1000 });
    const animationFrameId = useRef(null);

    // Grid configuration
    const spacing = 45; // Space between points
    const baseRadius = 1; // Normal dot size
    const hoverRadius = 3; // Dot size when hovered
    const influence = 180; // How far the mouse affects points
    const parallaxFactor = 0.4; // How fast the grid scrolls relative to page scroll

    const finalOpacity = introComplete ? scrollOpacity : 0;
    const opacityRef = useRef(0);

    useEffect(() => {
        if (isVisible) {
            const timer = setTimeout(() => {
                setIntroComplete(true);
            }, 2500);
            return () => clearTimeout(timer);
        } else {
            setIntroComplete(false);
        }
    }, [isVisible]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;

            const fadeInStart = viewportHeight * 0.3;
            const fadeInEnd = viewportHeight * 0.8;

            let newOpacity = 1;

            if (scrollY < fadeInStart) {
                newOpacity = 0;
            } else if (scrollY < fadeInEnd) {
                newOpacity = (scrollY - fadeInStart) / (fadeInEnd - fadeInStart);
            }

            setScrollOpacity(newOpacity);
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        opacityRef.current = finalOpacity;
    }, [finalOpacity]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for opaque background

        // Performance: lock DPR to 1
        const dpr = 1;

        let dots = [];
        let cols = 0;
        let rows = 0;

        const resize = () => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            canvas.style.width = `${w}px`;
            canvas.style.height = `${h}px`;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

            // Add extra rows/cols to handle scrolling wrap-around smoothly
            cols = Math.floor(w / spacing) + 3;
            rows = Math.floor(h / spacing) + 3;

            dots = [];
            for (let i = -1; i < cols; i++) {
                for (let j = -1; j < rows; j++) {
                    dots.push({
                        baseX: i * spacing,
                        baseY: j * spacing,
                    });
                }
            }
        };

        window.addEventListener('resize', resize);
        resize();

        const handleMouseMove = (e) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        const handleMouseLeave = () => {
            mouse.current.x = -1000;
            mouse.current.y = -1000;
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        document.addEventListener('mouseleave', handleMouseLeave);

        const draw = () => {
            if (opacityRef.current < 0.01) {
                animationFrameId.current = requestAnimationFrame(draw);
                return;
            }

            const time = performance.now() * 0.001; // Time in seconds for breathing

            // Interpolate mouse for smoothness
            smoothMouse.current.x += (mouse.current.x - smoothMouse.current.x) * 0.15;
            smoothMouse.current.y += (mouse.current.y - smoothMouse.current.y) * 0.15;

            // Deep dark premium background
            ctx.fillStyle = '#030303';
            ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);

            const mx = smoothMouse.current.x;
            const my = smoothMouse.current.y;

            // Calculate scroll offset wrapped by spacing
            const scrollY = window.scrollY;
            const scrollOffset = -(scrollY * parallaxFactor) % spacing;

            ctx.lineWidth = 1;

            for (let i = 0; i < dots.length; i++) {
                const dot = dots[i];

                // Actual position affected by scroll
                // Add spacing to handle negative wraps properly, then modulo
                let actualY = dot.baseY + scrollOffset;

                // If the point scrolled off the top, wrap it to the bottom
                if (actualY < -spacing) {
                    actualY += rows * spacing;
                } else if (actualY > window.innerHeight + spacing) {
                    actualY -= rows * spacing;
                }

                let actualX = dot.baseX;

                const dx = mx - actualX;
                const dy = my - actualY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                let alpha = 0.04; // Very faint default opacity
                let radius = baseRadius;

                // Organic breathing effect: Slow vertical movement
                // Use x and y coordinates to create a wave pattern across the grid
                const breathPhase = (dot.baseX * 0.003) + (dot.baseY * 0.003) + time * 1.2;
                // Oscillates between -1 and 1
                const breath = Math.sin(breathPhase);

                // Base vertical movement amount (e.g., max 15px up or down)
                const breathOffsetY = breath * 15;

                // Subtle repulsion
                let offsetX = 0;
                let offsetY = breathOffsetY;

                if (dist < influence) {
                    const force = (influence - dist) / influence;
                    // Much softer ease out curve for a gentle glow
                    const easeForce = Math.pow(Math.sin(force * Math.PI / 2), 2);

                    alpha = 0.04 + (0.6 * easeForce);
                    radius = baseRadius + ((hoverRadius - baseRadius) * easeForce);

                    offsetX = -(dx * easeForce * 0.02); // Reduced repulsion
                    // Add repulsion on top of the breathing offset
                    offsetY += -(dy * easeForce * 0.02);
                }

                const drawX = actualX + offsetX;
                const drawY = actualY + offsetY;

                ctx.beginPath();
                ctx.arc(drawX, drawY, radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fill();
            }

            animationFrameId.current = requestAnimationFrame(draw);
        };

        animationFrameId.current = requestAnimationFrame(draw);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
                opacity: finalOpacity,
                transition: 'opacity 1.5s ease-out',
                willChange: 'opacity',
            }}
        />
    );
};

export default InteractiveGrid;
