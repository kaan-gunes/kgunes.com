import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import AboutCard from "./components/AboutCard";
import CardStack3D from "./components/CardStack3D";
import BeforeAfterSlider from "./components/BeforeAfterSlider";
import LoadingScreen from "./components/LoadingScreen";
import "./index.css";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);

  const heroImageRef = useRef(null);
  const selfieRef = useRef(null);
  const aboutTextRef = useRef(null);
  const taglineRef = useRef(null);
  const nameRef = useRef(null);
  const appRef = useRef(null);

  useEffect(() => {
    // Tarayıcının scoll hatırlama özelliğini kapat
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }

    // Scroll en başa ve kitle
    if (isLoading) {
      window.scrollTo(0, 0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      // ScrollTrigger refresh gerekebilir
      ScrollTrigger.refresh();
    }
  }, [isLoading]);

  useEffect(() => {
    // Loading bitmeden animasyonları başlatma
    if (isLoading) return;

    // Layout'un oturduğundan emin olmak için refresh yap
    ScrollTrigger.refresh();

    // Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
      autoResize: true,
    });

    // Lenis başlar başlamaz en tepeye git (Garanti)
    lenis.scrollTo(0, { immediate: true });

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

    // Giriş animasyonları - Timeline ile sinematik açılış
    const introTl = gsap.timeline();

    // 1. Hero Background: Scale down + Fade in + Blur removal
    introTl.fromTo(
      heroImage,
      { opacity: 0, scale: 1.2, filter: "blur(15px)" },
      { opacity: 1, scale: 1, filter: "blur(0px)", duration: 2, ease: "power3.out" }
    );

    // 2. Tagline: Slide up + Fade in (starts slightly before hero finishes)
    introTl.fromTo(
      tagline,
      { opacity: 0, y: 40, letterSpacing: "0.1em" },
      { opacity: 1, y: 0, letterSpacing: "0.01em", duration: 1.2, ease: "power3.out" },
      "-=1.2"
    );

    // 3. Name: Gradient Reveal + Slide Up + Blur removal + Scale
    introTl.fromTo(
      name,
      {
        opacity: 0,
        y: 60,
        scale: 0.95,
        "--mask-pos": "-100%",
        filter: "blur(20px)"
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        "--mask-pos": "100%",
        filter: "blur(0px)",
        duration: 2.5,
        ease: "expo.out"
      },
      "-=1.0"
    );

    // Aşağıdan yukarıya gradyan fade efekti
    const scrollDistance = window.innerHeight - 200;

    gsap.fromTo(
      heroImage,
      {
        "--mask-position": "100%",
        "--mask-spread": "0%",
        filter: "blur(0px) brightness(1)",
      },
      {
        "--mask-position": "20%",
        "--mask-spread": "20%",
        filter: "blur(20px) brightness(0.02)",
        ease: "none",
        scrollTrigger: {
          trigger: ".hero",
          start: "top top",
          end: `+=${scrollDistance}`,
          scrub: true,
        },
      }
    );

    // Selfie parallax efekti
    gsap.to(selfie, {
      y: 200,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      },
    });

    // Text için sticky efekt
    gsap.to(aboutText, {
      y: 80,
      ease: "none",
      scrollTrigger: {
        trigger: ".about-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      },
    });

    // Staggered Text Reveal Animation
    if (aboutText) {
      const textLines = aboutText.querySelectorAll(".about-line");

      if (textLines.length > 0) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: aboutText,
            start: "top 80%",
            end: "top -40%",
            scrub: .2,
          },
        });

        textLines.forEach((line, i) => {
          tl.fromTo(
            line,
            { opacity: 0, filter: "blur(10px)" },
            { opacity: 1, filter: "blur(0px)", duration: 1, ease: "expo.out" },
            i * 0.2
          );
        });

        const longDesc = aboutText.querySelector(".about-card-container");
        if (longDesc) {
          tl.fromTo(
            longDesc,
            { opacity: 0, y: 20, filter: "blur(5px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 1, ease: "power2.out" },
            ">-=0.5"
          );
        }
      }
    }

    // Resolution scaling
    const BASE_WIDTH = 1920;
    const applyResolutionScaling = () => {
      const viewportWidth = window.innerWidth;
      const heroElement = document.querySelector('.hero');

      if (!heroElement) return;

      if (viewportWidth > BASE_WIDTH) {
        const scale = viewportWidth / BASE_WIDTH;
        heroElement.style.transform = `scale(${scale})`;
        heroElement.style.transformOrigin = 'top left';
        heroElement.style.width = `${BASE_WIDTH}px`;
        document.body.style.height = `${heroElement.scrollHeight * scale}px`;
      } else {
        heroElement.style.transform = 'none';
        heroElement.style.width = '100%';
        document.body.style.height = 'auto';
      }
    };

    applyResolutionScaling();
    window.addEventListener('resize', applyResolutionScaling);

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      window.removeEventListener('resize', applyResolutionScaling);
      gsap.ticker.remove(lenis.raf);
    };
  }, [isLoading]);

  return (
    <>
      <LoadingScreen onLoadingComplete={() => setIsLoading(false)} />

      {/* 
        InteractiveGrid Removed
      */}

      <div
        ref={appRef}
        className="hero"
        style={{
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.5s ease-out'
        }}
      >
        {/* Background Image */}
        <div ref={heroImageRef} className="hero-bg"></div>

        {/* Top Text */}
        <p ref={taglineRef} className="tagline">
          <em>{t("tagline.line1")}</em> {t("tagline.line2")}
        </p>

        {/* Main Name */}
        <h1 ref={nameRef} className="name">
          <span className="first">Kaan</span>
          <span className="last">Güneş</span>
        </h1>

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

        {/* Portfolio Section */}
        <CardStack3D />

        {/* Before/After Slider Section */}
        <BeforeAfterSlider />

      </div>
    </>
  );
}

export default App;


