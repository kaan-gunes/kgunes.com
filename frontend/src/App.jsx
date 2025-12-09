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
      y: 200, // Aşağı hareket = daha yavaş kayar = boşluk açılır
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
      const textReveals = aboutText.querySelectorAll(".about-line-reveal")

      if (textLines.length > 0) {
        // Timeline ile sıralı animasyon
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: aboutText,
            start: "top 90%",
            end: "top 10%",
            scrub: .5,
          },
        });

        // Her satırı sırayla animate et
        textLines.forEach((line, i) => {
          tl.fromTo(
            line,
            {
              opacity: 0,
              filter: "blur(20px)",
            },
            {
              opacity: 1,
              filter: "blur(0px)",
              duration: 1,
              ease: "power2.out",
            },
            i * 0.2 // Daha sık stagger
          );
        });
      }

      if (textReveals.length > 0) {
        // Timeline ile sıralı animasyon
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: aboutText,
            start: "top 90%",
            end: "top 50%",
            scrub: 0.5,
          },
        });

        // Her satırı sırayla animate et
        textReveals.forEach((line, i) => {
          tl.fromTo(
            line,
            {
              scaleX: 1
            },
            {
              scaleX: 0,
              ease: "power2.out",
            },
            
          );
        });

        
      }
    }

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div className="hero">
      {/* Background Image */}
      <div ref={heroImageRef} className="hero-bg"></div>

      {/* Top Text */}
      <p className="tagline">
        <em>{t("tagline.line1")}</em> {t("tagline.line2")}
      </p>

      {/* Main Name */}
      <h1 className="name">
        <span className="first">Kaan</span>
        <span className="last">Güneş</span>
      </h1>

      {/* About Section */}
      <section className="about-section">
        <div ref={selfieRef} className="selfie-container">
          <img src="/selfie.webp" alt="Kaan Güneş" className="selfie" />
        </div>

        <div ref={aboutTextRef} className="about-text-wrapper">
          {/* Üst satır - Tam genişlik */}
          <div className="about-top-lines">
            <span className="about-line">
              {t("about.line1")}
              <div className="about-line-reveal"></div>
            </span>
          </div>

          {/* Alt satırlar - Görselin yanında */}
          <div className="about-bottom-lines">
            <span className="about-line">{t("about.line2")}</span>
            <span className="about-line about-line-indent">
              {t("about.line3")}
            </span>
            <span className="about-line about-line-indent-2">
              {t("about.line4")}
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

export default App;
