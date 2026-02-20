import React, { memo, useRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { gsap } from 'gsap';
import './SplitScreen.css';

const SplitScreen = memo(() => {
    const { t } = useTranslation();
    const sectionRef = useRef(null);
    const leftRef = useRef(null);
    const rightRef = useRef(null);
    const [hoveredCol, setHoveredCol] = useState(null);

    // Entrance animation
    useEffect(() => {
        const section = sectionRef.current;
        if (!section) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    gsap.fromTo(leftRef.current,
                        { y: '40px', opacity: 0, filter: 'blur(6px)' },
                        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', delay: 0.1 }
                    );
                    gsap.fromTo(rightRef.current,
                        { y: '40px', opacity: 0, filter: 'blur(6px)' },
                        { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.9, ease: 'power3.out', delay: 0.25 }
                    );
                    observer.disconnect();
                }
            },
            { threshold: 0.2 }
        );
        observer.observe(section);
        return () => observer.disconnect();
    }, []);

    // Mouse parallax for glass orb
    const handleMouseMove = (e, colRef) => {
        const rect = colRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = (e.clientY - rect.top) / rect.height;

        const glassEl = colRef.current.querySelector('.glass-orb');
        if (glassEl) {
            gsap.to(glassEl, {
                x: (x - 0.5) * 80,
                y: (y - 0.5) * 80,
                duration: 0.8,
                ease: 'power2.out',
            });
        }
    };

    const handleNavigate = (path) => {
        console.log('Navigate to:', path);
    };

    // Background color based on hover
    const sectionBg = hoveredCol === 'left'
        ? '#141c2a'  // deep navy for graphic design
        : hoveredCol === 'right'
            ? '#2a1418'  // deep burgundy for robotics
            : '#212922'; // default olive

    return (
        <section
            ref={sectionRef}
            className="split-screen-section"
            style={{ backgroundColor: sectionBg }}
        >
            {/* Left - Graphic Design */}
            <div
                ref={leftRef}
                className="split-screen-col col-left"
                onClick={() => handleNavigate('/graphic-design')}
                onMouseMove={(e) => handleMouseMove(e, leftRef)}
                onMouseEnter={() => setHoveredCol('left')}
                onMouseLeave={() => setHoveredCol(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate('/graphic-design')}
                style={{ opacity: 0 }}
            >
                <div className="glass-orb glass-orb-left" />

                <div className="particles">
                    <span className="particle particle-blue" style={{ '--delay': '0s', '--x': '20%', '--y': '30%' }} />
                    <span className="particle particle-blue" style={{ '--delay': '1.5s', '--x': '70%', '--y': '60%' }} />
                    <span className="particle particle-blue" style={{ '--delay': '3s', '--x': '40%', '--y': '80%' }} />
                </div>

                <div className="col-content">
                    <span className="col-label">01</span>
                    <h2 className="split-col-title">
                        Graphic<br />Design
                    </h2>
                    <p className="col-description">Marka kimliği, UI/UX ve görsel tasarım</p>
                </div>

                <div className="col-footer">
                    <span className="split-col-subtitle">Portfolyoyu Keşfet</span>
                    <div className="split-col-arrow">
                        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Right - Robotics */}
            <div
                ref={rightRef}
                className="split-screen-col col-right"
                onClick={() => handleNavigate('/robotics')}
                onMouseMove={(e) => handleMouseMove(e, rightRef)}
                onMouseEnter={() => setHoveredCol('right')}
                onMouseLeave={() => setHoveredCol(null)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigate('/robotics')}
                style={{ opacity: 0 }}
            >
                <div className="glass-orb glass-orb-right" />

                <div className="particles">
                    <span className="particle particle-red" style={{ '--delay': '0.5s', '--x': '60%', '--y': '25%' }} />
                    <span className="particle particle-red" style={{ '--delay': '2s', '--x': '30%', '--y': '55%' }} />
                    <span className="particle particle-red" style={{ '--delay': '3.5s', '--x': '75%', '--y': '75%' }} />
                </div>

                <div className="col-content">
                    <span className="col-label">02</span>
                    <h2 className="split-col-title">
                        Robotics
                    </h2>
                    <p className="col-description">Otonom sistemler ve mekatronik projeler</p>
                </div>

                <div className="col-footer">
                    <span className="split-col-subtitle">Projeleri İncele</span>
                    <div className="split-col-arrow">
                        <svg viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17L17 7M17 7H7M17 7v10" />
                        </svg>
                    </div>
                </div>
            </div>
        </section>
    );
});

export default SplitScreen;
