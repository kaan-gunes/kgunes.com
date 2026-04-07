import React, { useRef, useEffect } from "react";

const HeroParticles = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");

        let animationFrameId;
        let particles = [];
        let mouse = { x: -1000, y: -1000 };
        let isVisible = true;

        // Absolute max FPS: Lock DPR to 1
        const dpr = 1;

        // Resize the canvas to fit the window exactly
        const resizeCanvas = () => {
            const maxW = Math.min(window.innerWidth, 1920);
            const maxH = Math.min(window.innerHeight, 1080);
            canvas.width = maxW * dpr;
            canvas.height = maxH * dpr;
            canvas.style.width = window.innerWidth + "px";
            canvas.style.height = window.innerHeight + "px";
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            initParticles();
        };

        // Initialize particles array based on screen width (reduced count)
        const initParticles = () => {
            particles = [];
            // Absolute max FPS: drastically reduce count
            const particleCount = Math.floor(window.innerWidth / 35);

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    size: Math.random() * 1.5 + 0.5,
                    speedX: (Math.random() - 0.5) * 0.4,
                    speedY: (Math.random() - 0.5) * 0.4,
                    baseOpacity: Math.random() * 0.4 + 0.1,
                    currentOpacity: 0
                });
            }
        };

        // Throttle mousemove via rAF
        let mouseMoveQueued = false;
        const handleMouseMove = (e) => {
            if (mouseMoveQueued) return;
            mouseMoveQueued = true;
            requestAnimationFrame(() => {
                mouse.x = e.clientX;
                mouse.y = e.clientY;
                mouseMoveQueued = false;
            });
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        // Pause when offscreen
        const observer = new IntersectionObserver(
            ([entry]) => {
                isVisible = entry.isIntersecting;
                if (isVisible && !animationFrameId) {
                    drawParticles();
                }
            },
            { threshold: 0 }
        );
        observer.observe(canvas);

        window.addEventListener("resize", resizeCanvas);
        window.addEventListener("mousemove", handleMouseMove, { passive: true });
        document.addEventListener("mouseleave", handleMouseLeave);

        resizeCanvas();

        const w = () => window.innerWidth;
        const h = () => window.innerHeight;

        // Main drawing loop
        const drawParticles = () => {
            if (!isVisible) {
                animationFrameId = null;
                return;
            }

            const cw = w();
            const ch = h();

            ctx.clearRect(0, 0, cw, ch);

            particles.forEach((p) => {
                // Move particle
                p.x += p.speedX;
                p.y += p.speedY;

                // Wrap around edges
                if (p.x < 0) p.x = cw;
                if (p.x > cw) p.x = 0;
                if (p.y < 0) p.y = ch;
                if (p.y > ch) p.y = 0;

                // Mouse interaction logic
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Push particles away slightly and make them glow
                if (dist < 200) {
                    const force = (200 - dist) / 200;
                    p.x -= dx * force * 0.03;
                    p.y -= dy * force * 0.03;
                    p.currentOpacity = Math.min(p.baseOpacity * (1 + force * 2), 1);
                } else {
                    p.currentOpacity = p.baseOpacity;
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.currentOpacity})`;

                // Optional subtle glow effect when glowing
                // Removed shadowBlur for performance

                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(drawParticles);
        };

        drawParticles();

        return () => {
            observer.disconnect();
            window.removeEventListener("resize", resizeCanvas);
            window.removeEventListener("mousemove", handleMouseMove);
            document.removeEventListener("mouseleave", handleMouseLeave);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return <canvas ref={canvasRef} className="hero-particles" />;
};

export default HeroParticles;
