import { useEffect, useRef, useState, lazy, Suspense, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { throttle, prefersReducedMotion } from "./utils/performance";
import AboutCard from "./components/AboutCard";
import LoadingScreen from "./components/LoadingScreen";
import LanguageToggle from "./components/LanguageToggle";
import CustomCursor from "./components/CustomCursor";
import "./index.css";
import HeroParticles from "./components/HeroParticles";

// Lazy load heavy components
const CardStack3D = lazy(() => import("./components/CardStack3D"));
const BeforeAfterSlider = lazy(() => import("./components/BeforeAfterSlider"));
const ContactSection = lazy(() => import("./components/ContactSection"));
const InteractiveGrid = lazy(() => import("./components/InteractiveGrid"));

// Fallback component for lazy loading
const LazyFallback = () => null;

gsap.registerPlugin(ScrollTrigger);

function App() {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const heroImageRef = useRef(null);
  const selfieRef = useRef(null);
  const aboutTextRef = useRef(null);
  const taglineRef = useRef(null);
  const nameRef = useRef(null);
  const appRef = useRef(null);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 1200 : false);
  const [reducedMotion] = useState(() => prefersReducedMotion());

  // Dinamik Başlık Güncellemesi
  useEffect(() => {
    document.title = t('pageTitle', 'Kaan Güneş | Portfolio');
  }, [i18n.language, t]);

  useEffect(() => {
    // Sayfa yüklendiğinde en başa scroll
    window.scrollTo(0, 0);
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.5,
    });

    window.lenis = lenis;

    // Lenis'i GSAP ScrollTrigger ile senkronize et
    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    const heroImage = heroImageRef.current;
    const selfie = selfieRef.current;
    const aboutText = aboutTextRef.current;
    const tagline = taglineRef.current;
    const name = nameRef.current;

    // React 18 Strict Mode double-firing fix using gsap.context
    let ctx = gsap.context(() => {

      // Aşağıdan yukarıya gradyan fade efekti
      const scrollDistance = window.innerHeight - 200;

      if (heroImage && appRef.current) {
        gsap.fromTo(
          heroImage,
          {
            "--mask-position": "100%",
            "--mask-spread": "0%",
            opacity: 1, // Max FPS: replaced filter with pure opacity
          },
          {
            "--mask-spread": "20%",
            opacity: 0.1, // Reduce opacity instead of blur
            ease: "none",
            scrollTrigger: {
              trigger: appRef.current,
              start: "top top",
              end: `+=${scrollDistance}`,
              scrub: true,
            },
          }
        );
      }

      // Particles Bg Fade out on scroll
      if (appRef.current) {
        const particlesCanvas = appRef.current.querySelector('.hero-particles');
        if (particlesCanvas) {
          gsap.to(particlesCanvas, {
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: appRef.current,
              start: "top top",
              end: `+=${scrollDistance}`,
              scrub: true,
            },
          });
        }
      }

      if (appRef.current) {
        const aboutSection = appRef.current.querySelector('.about-section');

        if (aboutSection) {
          // Remove heavy GSAP scrub parallax from selfie and text.
          // The constant y-transform updates on scroll were causing micro-stutters (layout thrashing).
          // Replaced with simple CSS transitions or static placement for max FPS.

          if (selfie) {
            gsap.set(selfie, { y: 0 }); // reset any previous state
          }
          if (aboutText) {
            gsap.set(aboutText, { y: 0 }); // reset any previous state
          }
        }
      }

      // Staggered Text Reveal Animation - Blur to Sharp
      if (aboutText) {
        const textLines = aboutText.querySelectorAll(".about-line");

        if (textLines.length > 0) {
          // Timeline ile sıralı animasyon
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: aboutText,
              start: "top 80%",
              end: "top -40%",
              scrub: .2,
            },
          });

          // Her satırı sırayla animate et
          textLines.forEach((line, i) => {
            tl.fromTo(
              line,
              {
                opacity: 0,
                y: 10,
              },
              {
                opacity: 1,
                y: 0,
                duration: 1,
                ease: "expo.out",
              },
              i * 0.2
            );
          });

          // Uzun açıklama metni animasyonu
          const longDesc = aboutText.querySelector(".about-card-container");
          if (longDesc) {
            tl.fromTo(
              longDesc,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 1, ease: "power2.out" },
              ">-=0.5"
            );
          }
        }
      }

      // Re-initialize ScrollTrigger to check for updated DOM
      ScrollTrigger.refresh();

    }, appRef); // <-- Scope GSAP context to the app container

    // Responsive breakpoint handler
    const handleResize = throttle(() => {
      setIsMobile(window.innerWidth < 1200);
    }, 100);

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      ctx.revert(); // <-- Clean up GSAP context
      lenis.destroy();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Intro animations - triggered when loading screen completes
  useEffect(() => {
    if (isLoading) return;

    const heroImage = heroImageRef.current;
    const tagline = taglineRef.current;
    const name = nameRef.current;

    // Set initial states before animating
    if (heroImage) gsap.set(heroImage, { opacity: 0 });
    // Max FPS: No initial blur
    if (name) gsap.set(name, { opacity: 0, scale: 0.95 });

    const introCtx = gsap.context(() => {
      const introTl = gsap.timeline({ delay: 0.3 });

      // 1. Hero Background: fade-in
      if (heroImage) {
        introTl.fromTo(
          heroImage,
          { opacity: 0 },
          { opacity: 1, duration: 1.5, ease: "power2.out" }
        );
      }

      // 2. Tagline: Fade-in + Slide-up (eşzamanlı)
      if (tagline) {
        introTl.fromTo(
          tagline,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 1.2, ease: "power3.out" },
          "-=1.0"
        );
      }

      // 3. Name: Magical fade-in with blur dissolve
      if (name) {
        const nameWrapper = name.closest('.name-wrapper');
        // Max FPS: remove blur from intro anim
        introTl.fromTo(
          name,
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" },
          "-=0.8"
        );

        // Sparkle particles around the name
        if (nameWrapper) {
          const sparkleCount = 28;
          const sparkles = [];
          for (let i = 0; i < sparkleCount; i++) {
            const sparkle = document.createElement('span');
            sparkle.className = 'sparkle';
            nameWrapper.appendChild(sparkle);
            sparkles.push(sparkle);

            // Random position around the text
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const size = Math.random() * 5 + 2;
            const delay = Math.random() * 1.2;

            gsap.set(sparkle, {
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              opacity: 0,
              scale: 0,
            });

            // Sparkle appear, shimmer, and fade
            introTl.to(
              sparkle,
              {
                opacity: 1,
                scale: 1,
                duration: 0.4,
                ease: "back.out(3)",
              },
              `-=1.6`
            );

            // Shimmer with random offset
            introTl.to(
              sparkle,
              {
                opacity: 0,
                scale: 0,
                y: (Math.random() - 0.5) * 40,
                x: (Math.random() - 0.5) * 30,
                duration: 0.8 + Math.random() * 0.6,
                delay: delay * 0.3,
                ease: "power2.in",
              },
              ">-=0.1"
            );
          }

          // Cleanup sparkles after animation
          introTl.call(() => {
            sparkles.forEach(s => s.remove());
          });
        }
      }
    }, appRef);

    return () => {
      introCtx.revert();
    };
  }, [isLoading]);

  return (
    <>
      {/* Custom cursor only on desktop with pointer device - eager loaded for loading screen */}
      {!isMobile && <CustomCursor />}
      <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />

      <LanguageToggle />

      {/* Interactive Grid */}
      <Suspense fallback={<LazyFallback />}>
        <InteractiveGrid isVisible={!isLoading} />
      </Suspense>

      <div className="main-wrapper" style={{ width: '100%', overflowX: 'hidden' }}>
        <div
          ref={appRef}
          className="hero"
          style={{
            opacity: isLoading ? 0 : 1,
            transition: 'opacity 0.5s ease-out'
          }}
        >
          {/* Hero Viewport - First Fold */}
          <div className="hero-viewport">
            {/* Background Image */}
            <div ref={heroImageRef} className="hero-bg"></div>

            {/* Premium Particles Canvas Layer */}
            <HeroParticles />

            {/* Top Text */}
            <p ref={taglineRef} className="tagline" style={{ opacity: 0 }}>
              <em>{t("tagline.line1")}</em>{' '}{t("tagline.line2")}
            </p>

            {/* Main Name */}
            <div className="name-wrapper">
              <h1 ref={nameRef} className="name">
                <span className="first">Kaan</span>
                <span className="last">Güneş</span>
              </h1>
            </div>
          </div>

          {/* About Section */}
          <section className="about-section">
            <div ref={selfieRef} className="selfie-container">
              <img src="/selfie.webp" alt="Kaan Güneş" className="selfie" />
            </div>

            <div ref={aboutTextRef} className="about-text-wrapper">
              {/* Üst satırlar */}
              <div className="about-top-lines">
                <span className="about-line" dangerouslySetInnerHTML={{ __html: t("about.line1") }} />
                <span className="about-line" dangerouslySetInnerHTML={{ __html: t("about.line2") }} />
                <span className="about-line" dangerouslySetInnerHTML={{ __html: t("about.line2_sub") }} />
              </div>

              {/* Alt satırlar */}
              <div className="about-bottom-lines">
                <span className="about-line" dangerouslySetInnerHTML={{ __html: t("about.line3") }} />
                <span className="about-line about-line-indent" dangerouslySetInnerHTML={{ __html: t("about.line4") }} />
                <span className="about-line about-line-indent-2" dangerouslySetInnerHTML={{ __html: t("about.line5") }} />
              </div>

              {/* Uzun Açıklama Metni */}
              <AboutCard />
            </div>
          </section>

          {/* Section Divider */}
          <div className="section-divider" />

          {/* Portfolio Section - ABOUT'UN ALTINDA */}
          <Suspense fallback={<LazyFallback />}>
            <CardStack3D reducedMotion={reducedMotion} />
          </Suspense>

          {/* Section Divider */}
          <div className="section-divider" />

          {/* Before/After Slider Section */}
          <Suspense fallback={<LazyFallback />}>
            <BeforeAfterSlider />
          </Suspense>

          {/* Section Divider */}
          <div className="section-divider" />

          {/* Contact Section */}
          <Suspense fallback={<LazyFallback />}>
            <ContactSection />
          </Suspense>

        </div>
      </div>
    </>
  );
}

export default App;


