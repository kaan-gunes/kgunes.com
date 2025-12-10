import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import "./index.css";

gsap.registerPlugin(ScrollTrigger);

function App() {
  const { t } = useTranslation();
  const heroImageRef = useRef(null);
  const selfieRef = useRef(null);
  const aboutTextRef = useRef(null);
  const taglineRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    // Lenis smooth scroll
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      smoothWheel: true,
    });

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

    // Giriş animasyonları - sayfa yüklendiğinde
    // Hero background fade in + zoom out
    gsap.fromTo(
      heroImage,
      { opacity: 0, scale: 1.1 },
      { opacity: 1, scale: 1, duration: 1.5, ease: "power2.out" }
    );

    gsap.fromTo(
      tagline,
      { opacity: 0 },
      { opacity: 1, duration: 1, ease: "power2.out", delay: 0.5 }
    );

    // KAAN GÜNEŞ - soldan sağa gradient mask ile opacity artışı + blur
    gsap.fromTo(
      name,
      {
        opacity: 0,
        "--mask-pos": "-100%",
        filter: "blur(8px)"
      },
      {
        opacity: 1,
        "--mask-pos": "100%",
        filter: "blur(0px)",
        duration: 2.2,
        ease: "expo.out",
        delay: 0.6
      }
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

    // Selfie parallax efekti - daha yavaş scroll (sticky effect)
    gsap.to(selfie, {
      y: 200, // Daha fazla sticky efekt
      ease: "none",
      scrollTrigger: {
        trigger: ".about-section",
        start: "top bottom",
        end: "bottom top",
        scrub: 0.5,
      },
    });

    // Text için hafif sticky efekt (fotoğraftan daha az)
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
              filter: "blur(10px)",
            },
            {
              opacity: 1,
              filter: "blur(0px)",
              duration: 1,
              ease: "expo.out",
            },
            i * 0.2
          );
        });
      }
    }

    // 1920px baz alınarak resolution scaling sistemi
    // QHD ve daha büyük ekranlarda site 1920x1080'deki gibi görünsün
    const BASE_WIDTH = 1920;

    const applyResolutionScaling = () => {
      const viewportWidth = window.innerWidth;

      if (viewportWidth > BASE_WIDTH) {
        // 1920px'den büyük ekranlarda scale uygula
        const scale = viewportWidth / BASE_WIDTH;

        // Hero container'ı scale et
        const heroElement = document.querySelector('.hero');
        if (heroElement) {
          heroElement.style.transform = `scale(${scale})`;
          heroElement.style.transformOrigin = 'top left';
          heroElement.style.width = `${BASE_WIDTH}px`;
          // Scale sonrası yüksekliği düzelt
          document.body.style.height = `${heroElement.scrollHeight * scale}px`;
        }
      } else {
        // 1920px ve altında normal görüntüle
        const heroElement = document.querySelector('.hero');
        if (heroElement) {
          heroElement.style.transform = 'none';
          heroElement.style.width = '100%';
          document.body.style.height = 'auto';
        }
      }
    };

    // İlk yüklemede ve resize'da uygula
    applyResolutionScaling();
    window.addEventListener('resize', applyResolutionScaling);

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      window.removeEventListener('resize', applyResolutionScaling);
    };
  }, []);

  return (
    <div className="hero">
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
          {/* Üst satırlar - Tam genişlik (2 uzun satır) */}
          <div className="about-top-lines">
            <span className="about-line">{t("about.line1")}</span>
            <span className="about-line">{t("about.line2")}</span>
          </div>

          {/* Alt satırlar - Görselin yanında (3 kısa satır) */}
          <div className="about-bottom-lines">
            <span className="about-line">{t("about.line3")}</span>
            <span className="about-line about-line-indent">{t("about.line4")}</span>
            <span className="about-line about-line-indent-2">{t("about.line5")}</span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
