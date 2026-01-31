/**
 * Performance utility functions
 */

// Throttle function - limits execution rate
export function throttle(func, limit) {
  let inThrottle = false;
  let lastResult;
  return function (...args) {
    if (!inThrottle) {
      lastResult = func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
    return lastResult;
  };
}

// Debounce function - delays execution until after wait period
export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// RAF throttle - limits to animation frames
export function rafThrottle(callback) {
  let requestId = null;
  let lastArgs = null;

  const later = () => {
    requestId = null;
    callback(...lastArgs);
  };

  return function (...args) {
    lastArgs = args;
    if (requestId === null) {
      requestId = requestAnimationFrame(later);
    }
  };
}

// Check if device is low-end
export function isLowEndDevice() {
  // Check for low memory
  if (navigator.deviceMemory && navigator.deviceMemory < 4) {
    return true;
  }
  // Check for low CPU cores
  if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) {
    return true;
  }
  // Check for mobile
  if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    return true;
  }
  return false;
}

// Check for reduced motion preference
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Intersection Observer for lazy loading
export function createLazyObserver(callback, options = {}) {
  const defaultOptions = {
    root: null,
    rootMargin: '100px',
    threshold: 0.1,
    ...options,
  };

  return new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        callback(entry.target);
      }
    });
  }, defaultOptions);
}
