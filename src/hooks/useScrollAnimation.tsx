import { useEffect, useRef, useState, RefObject } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number;
  rootMargin?: string;
  triggerOnce?: boolean;
}

export function useScrollAnimation<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollAnimationOptions = {}
): [RefObject<T>, boolean] {
  const { threshold = 0.1, rootMargin = '0px', triggerOnce = true } = options;
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce) {
            observer.unobserve(element);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [threshold, rootMargin, triggerOnce]);

  return [ref, isVisible];
}

// Utility component for wrapping sections with scroll animations
interface ScrollAnimationProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'fade-up' | 'fade-left' | 'fade-right' | 'scale' | 'fade';
  delay?: number;
  duration?: number;
  threshold?: number;
}

export function ScrollAnimation({
  children,
  className = '',
  animation = 'fade-up',
  delay = 0,
  duration = 600,
  threshold = 0.1,
}: ScrollAnimationProps) {
  const [ref, isVisible] = useScrollAnimation<HTMLDivElement>({ threshold });

  const baseStyles: React.CSSProperties = {
    transitionProperty: 'opacity, transform',
    transitionDuration: `${duration}ms`,
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: `${delay}ms`,
  };

  const getAnimationStyles = (): React.CSSProperties => {
    const hidden: Record<string, React.CSSProperties> = {
      'fade-up': { opacity: 0, transform: 'translateY(40px)' },
      'fade-left': { opacity: 0, transform: 'translateX(-40px)' },
      'fade-right': { opacity: 0, transform: 'translateX(40px)' },
      'scale': { opacity: 0, transform: 'scale(0.95)' },
      'fade': { opacity: 0, transform: 'none' },
    };

    const visible: React.CSSProperties = {
      opacity: 1,
      transform: 'translateY(0) translateX(0) scale(1)',
    };

    return isVisible ? visible : hidden[animation];
  };

  return (
    <div
      ref={ref}
      className={className}
      style={{ ...baseStyles, ...getAnimationStyles() }}
    >
      {children}
    </div>
  );
}

// Staggered children animation hook
export function useStaggeredAnimation<T extends HTMLElement = HTMLDivElement>(
  itemCount: number,
  baseDelay: number = 100
): [RefObject<T>, boolean, (index: number) => React.CSSProperties] {
  const [ref, isVisible] = useScrollAnimation<T>({ threshold: 0.1 });

  const getStaggeredStyle = (index: number): React.CSSProperties => ({
    transitionProperty: 'opacity, transform',
    transitionDuration: '500ms',
    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
    transitionDelay: `${index * baseDelay}ms`,
    opacity: isVisible ? 1 : 0,
    transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
  });

  return [ref, isVisible, getStaggeredStyle];
}
