import React, { useRef, useEffect, useState } from 'react';

const InteractiveGrid = ({ isVisible = false }) => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -1000, y: -1000 });
    const smoothMouseRef = useRef({ x: -1000, y: -1000 });
    const animationRef = useRef(null);
    const [scrollOpacity, setScrollOpacity] = useState(1);
    const [introComplete, setIntroComplete] = useState(false);

    const gridSize = 150;
    const influenceRadius = 350;
    const maxDistortion = 25;
    const renderStep = 15;
    const parallaxFactor = 0.3;
    const mouseSmoothFactor = 0.15;

    // Kombine opacity hesapla
    const finalOpacity = introComplete ? scrollOpacity : 0;
    const opacityRef = useRef(0);

    // isVisible prop değiştiğinde intro animasyonu başlat
    useEffect(() => {
        if (isVisible) {
            // Hero intro animasyonu bittikten sonra fade in (2.5s gecikme)
            const timer = setTimeout(() => {
                setIntroComplete(true);
            }, 2500);
            return () => clearTimeout(timer);
        } else {
            setIntroComplete(false);
        }
    }, [isVisible]);

    useEffect(() => {
        opacityRef.current = finalOpacity;
    }, [finalOpacity]);

    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;

            // Hero bölümünde (üst kısımda) fade out - scroll edince fade in
            const fadeInStart = viewportHeight * 0.3; // 0.3vh'den sonra görünmeye başla
            const fadeInEnd = viewportHeight * 0.8;   // 0.8vh'de tam görünür

            let newOpacity = 1;

            if (scrollY < fadeInStart) {
                newOpacity = 0; // En üstte tamamen gizli
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
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const handleResize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        handleResize();
        window.addEventListener('resize', handleResize);

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        let lastTime = 0;
        const frameInterval = 1000 / 60;

        const render = (timestamp) => {
            // Görünmüyorsa çizme
            if (opacityRef.current < 0.01) {
                animationRef.current = requestAnimationFrame(render);
                return;
            }

            if (timestamp - lastTime < frameInterval) {
                animationRef.current = requestAnimationFrame(render);
                return;
            }
            lastTime = timestamp;

            smoothMouseRef.current.x += (mouseRef.current.x - smoothMouseRef.current.x) * mouseSmoothFactor;
            smoothMouseRef.current.y += (mouseRef.current.y - smoothMouseRef.current.y) * mouseSmoothFactor;

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const mouseX = smoothMouseRef.current.x;
            const mouseY = smoothMouseRef.current.y;
            const scrollY = window.scrollY;
            const parallaxOffset = -(scrollY * parallaxFactor) % gridSize;

            ctx.lineWidth = 1;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            // GLOW EFEKTİ
            const gradient = ctx.createRadialGradient(
                mouseX, mouseY, 0,
                mouseX, mouseY, influenceRadius
            );

            gradient.addColorStop(0, 'rgba(255, 150, 50, 1)');
            gradient.addColorStop(0.25, 'rgba(255, 120, 40, 0.7)');
            gradient.addColorStop(0.5, 'rgba(255, 80, 35, 0.4)');
            gradient.addColorStop(0.75, 'rgba(255, 50, 30, 0.2)');
            gradient.addColorStop(1, 'rgba(255, 30, 30, 0.12)');

            ctx.strokeStyle = gradient;
            ctx.beginPath();

            // Kenar çizgilerini tespit etmek için
            const isEdgeLine = (linePos, maxPos) => {
                return linePos <= 0 || linePos >= maxPos;
            };

            // Yatay çizgiler
            for (let y = -gridSize; y <= canvas.height + gridSize; y += gridSize) {
                const actualY = y + parallaxOffset;
                if (actualY < -gridSize || actualY > canvas.height + gridSize) continue;

                // Bu çizgi kenar mı? (canvas üst veya alt sınırına yakın)
                const isEdgeHorizontal = actualY <= 0 || actualY >= canvas.height;

                let isFirst = true;

                for (let x = 0; x <= canvas.width; x += renderStep) {
                    let finalX = x;
                    let finalY = actualY;

                    // SADECE kenar çizgisi değilse distortion uygula
                    if (!isEdgeHorizontal) {
                        const dx = x - mouseX;
                        const dy = actualY - mouseY;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < influenceRadius && distance > 0) {
                            const normalizedDist = distance / influenceRadius;
                            const strength = Math.cos(normalizedDist * Math.PI * 0.5);
                            const pushStrength = maxDistortion * strength * strength;

                            // Sadece Y yönünde bombe (yukarı doğru)
                            finalY = actualY - pushStrength;
                        }
                    }

                    if (isFirst) {
                        ctx.moveTo(finalX, finalY);
                        isFirst = false;
                    } else {
                        ctx.lineTo(finalX, finalY);
                    }
                }
            }

            // Dikey çizgiler
            for (let x = 0; x <= canvas.width; x += gridSize) {
                // Bu çizgi kenar mı? (canvas sol veya sağ sınırına yakın)
                const isEdgeVertical = x <= 0 || x >= canvas.width;

                let isFirst = true;

                for (let y = -gridSize; y <= canvas.height + gridSize; y += renderStep) {
                    const actualY = y + parallaxOffset;

                    let finalX = x;
                    let finalY = actualY;

                    // SADECE kenar çizgisi değilse distortion uygula
                    if (!isEdgeVertical) {
                        const dx = x - mouseX;
                        const dy = actualY - mouseY;
                        const distance = Math.sqrt(dx * dx + dy * dy);

                        if (distance < influenceRadius && distance > 0) {
                            const normalizedDist = distance / influenceRadius;
                            const strength = Math.cos(normalizedDist * Math.PI * 0.5);
                            const pushStrength = maxDistortion * strength * strength;

                            // Dikey çizgiler için SADECE Y yönünde bombe (X değişmez)
                            finalY = actualY - pushStrength;
                        }
                    }

                    if (isFirst) {
                        ctx.moveTo(finalX, finalY);
                        isFirst = false;
                    } else {
                        ctx.lineTo(finalX, finalY);
                    }
                }
            }

            ctx.stroke();

            animationRef.current = requestAnimationFrame(render);
        };

        animationRef.current = requestAnimationFrame(render);

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
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
