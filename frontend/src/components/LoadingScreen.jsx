import React, { useEffect, useState, useRef } from 'react';
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
    const [isLoaded, setIsLoaded] = useState(false);
    const [animationComplete, setAnimationComplete] = useState(false);
    const [assetsReady, setAssetsReady] = useState(false);
    const svgRef = useRef(null);

    // Asset preloading
    useEffect(() => {
        let loadedCount = 0;
        const totalAssets = ASSETS_TO_PRELOAD.length;

        const updateProgress = () => {
            loadedCount++;
            if (loadedCount === totalAssets) {
                setAssetsReady(true);
            }
        };

        const loadAndDecode = async (src) => {
            try {
                const img = new Image();
                img.src = src;
                await img.decode();
                updateProgress();
            } catch (e) {
                console.warn(`Failed to decode image: ${src}`, e);
                updateProgress();
            }
        };

        ASSETS_TO_PRELOAD.forEach(src => {
            loadAndDecode(src);
        });

        // Fallback: 15 saniyeye çıkar
        const timeout = setTimeout(() => {
            if (loadedCount < totalAssets) {
                console.warn("Loading timed out, forcing start.");
                setAssetsReady(true);
            }
        }, 15000);

        return () => clearTimeout(timeout);
    }, []);

    // Animation timing - 4.5 saniye (0.5s gecikme ekli)
    useEffect(() => {
        const animationTimer = setTimeout(() => {
            setAnimationComplete(true);
        }, 4500);

        return () => clearTimeout(animationTimer);
    }, []);

    // Both conditions met = fade out
    useEffect(() => {
        if (animationComplete && assetsReady) {
            setIsLoaded(true);
            setTimeout(() => {
                onLoadingComplete();
            }, 600);
        }
    }, [animationComplete, assetsReady, onLoadingComplete]);

    return (
        <div className={`loading-screen ${isLoaded ? 'fade-out' : ''}`}>
            <div className="signature-container">
                <svg
                    ref={svgRef}
                    className="signature-svg"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 1438.58 452.88"
                >
                    {/* K başı */}
                    <path
                        className="signature-path path-1"
                        d="M31,280.17c13.79-4.85,32.67-12.39,53.83-23.92,117.53-63.99,172.05-177.95,172.83-177.42,4.17,2.81-71.97,109.42-71.97,109.42C111.03,292.79,49.33,377.29,7,434.83"
                    />
                    {/* G */}
                    <path
                        className="signature-path path-2"
                        d="M377.78,92.39c-52.81,54.81-230.23,237.51-256.14,235.22-.89-.08-2.79-.25-3.33-1.42-3.84-8.34,67.01-55.92,141.69-81.81,18.75-6.5,113.87-39.45,126.67-17.56,22.04,37.72-215.96,211.15-210.03,218.79,3.68,4.74,92.12-57.65,164.2-110.98,93.19-68.94,150.16-116.15,203.52-165.4,74.06-68.35,134.44-124.86,121-150-10.46-19.57-60.33-10.18-68-8.73-68.31,12.86-125.69,77.35-113.81,110.61,6.63,18.55,34.25,25.8,38.31,26.85,22.45,5.81,42.04-1.23,53.24-5.76,64.23-25.96,117.22-76.65,117.43-76.46,1.77,1.62-67.62,132.58-220.09,218.49,0,0-117.97,71.22-298.23,84.7-11.67.87-18.16,1.06-18.12,1.26.39,2.16,100.42-17.59,201.11-30.67,80.91-10.51,173.52-18.18,353.67-19,261.03-1.19,507.57,12.9,660.33,23.67"
                    />
                    {/* UNES */}
                    <path
                        className="signature-path path-3"
                        d="M655.69,173.25c-3.49,10.49-35.27,109.2,5.09,138.48,6.22,4.51,12.08,5.87,13.57,6.19,58.75,12.54,128.36-139.25,145.33-131.33,13.58,6.33-20.68,108.36-12.67,111.33,8.91,3.3,42.88-125.73,116.67-138.67,6.66-1.17,26.83-4.7,41.33,6.67,36.21,28.39-10.32,112.64,17.11,132.19,27.05,19.29,99.75-43.18,128.23-71.67,21.3-21.31,46.98-47.01,39.33-64.52-7.34-16.81-43.24-21.14-68.67-10-28.37,12.43-47.29,45.71-40.81,74.52,6.6,29.36,37.29,43.61,41.48,45.48,83.96,37.47,233.86-70.67,222.33-118-5.12-21.02-43.23-34.4-72-28-26.89,5.99-54.82,31.47-51,54.67,1.83,11.09,10.8,20.97,20.56,25.56,13.1,6.16,26.52,2.28,34.11.44,48.13-11.62,111.89-1.32,122,22.67.57,1.34,2.36,6.05.63,14.57-13.66,67.2-200.49,144.38-237.3,99.43-1.98-2.41-6.45-7.67-5.4-13.89,5.68-33.58,161.3-35.44,315.96-29.55"
                    />
                    {/* S cap */}
                    <path
                        className="signature-path path-4"
                        d="M1314.04,371.9c-50.17,18-99.89,38.98-97.39,50.83,2.83,13.45,71.97,10.2,123.08,6.07"
                    />
                    {/* U cap */}
                    <path
                        className="signature-path path-5"
                        d="M719.14,135.81c-2.23,1.55-9.17,6.8-11.19,16-2.56,11.61,4.19,22.84,11.94,28.03,12.72,8.51,35.68,3.17,51.25-16.69"
                    />
                </svg>
            </div>
        </div>
    );
};

export default LoadingScreen;
