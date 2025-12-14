import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './LoadingScreen.css';

const ASSETS_TO_PRELOAD = [
    '/hero.webp',
    '/selfie.webp',
    '/slider/kasım_sf.webp',
    '/slider/kasım_sf_pre.webp',
    '/slider/ps_logo.webp',
    '/images/CARDS/sf_logo_card.webp',
    '/images/CARDS/hoodie_card.webp',
    '/images/CARDS/cd_card.webp',
    '/images/CARDS/sf_st_card.webp'
];

const LoadingScreen = ({ onLoadingComplete }) => {
    const [progress, setProgress] = useState(0);
    const [isLoaded, setIsLoaded] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        let loadedCount = 0;
        const totalAssets = ASSETS_TO_PRELOAD.length;

        const updateProgress = () => {
            loadedCount++;
            const newProgress = Math.round((loadedCount / totalAssets) * 100);
            setProgress(newProgress);

            if (loadedCount === totalAssets) {
                // Her şey decode edildi, biraz bekle ve aç
                setTimeout(() => {
                    setIsLoaded(true);
                    setTimeout(() => {
                        onLoadingComplete();
                    }, 800);
                }, 500);
            }
        };

        const loadAndDecode = async (src) => {
            try {
                const img = new Image();
                img.src = src;

                // Önce indir, sonra decode et (GPU'ya aç)
                await img.decode();
                updateProgress();
            } catch (e) {
                console.warn(`Failed to decode image: ${src}`, e);
                // Decode başarısız olsa bile (örn. format desteği yoksa) ilerle
                updateProgress();
            }
        };

        ASSETS_TO_PRELOAD.forEach(src => {
            loadAndDecode(src);
        });

        // Fallback: Çok uzun sürerse zorla bitir (10 saniye - decode uzun sürebilir)
        const timeout = setTimeout(() => {
            if (loadedCount < totalAssets) {
                console.warn("Loading timed out, forcing start.");
                setProgress(100);
                setIsLoaded(true);
                setTimeout(() => {
                    onLoadingComplete();
                }, 800);
            }
        }, 10000);

        return () => clearTimeout(timeout);
    }, [onLoadingComplete]);

    return (
        <div className={`loading-screen ${isLoaded ? 'fade-out' : ''}`}>
            <div className="loading-content">
                <div className="loading-percentage">{progress}%</div>
                <div className="loading-bar-container">
                    <div
                        className="loading-bar-fill"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
                <div className="loading-text">
                    <span className="loading-char">L</span>
                    <span className="loading-char">O</span>
                    <span className="loading-char">A</span>
                    <span className="loading-char">D</span>
                    <span className="loading-char">I</span>
                    <span className="loading-char">N</span>
                    <span className="loading-char">G</span>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
