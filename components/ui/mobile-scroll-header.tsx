"use client";

import { useEffect, useRef, useState } from "react";

type MobileScrollHeaderProps = {
  children: React.ReactNode;
};

export function MobileScrollHeader({ children }: MobileScrollHeaderProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const stopTimerRef = useRef<number | null>(null);
  const lastScrollYRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);
  const [mobileHeight, setMobileHeight] = useState(0);

  useEffect(() => {
    const updateHeight = () => {
      const height = wrapperRef.current?.getBoundingClientRect().height ?? 0;
      setMobileHeight(height);
    };

    updateHeight();

    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(() => {
            updateHeight();
          })
        : null;

    if (observer && wrapperRef.current) {
      observer.observe(wrapperRef.current);
    }

    return () => {
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;

      if (currentScrollY <= 24 || delta < -4) {
        setIsVisible(true);
      } else if (delta > 6) {
        setIsVisible(false);
      }

      lastScrollYRef.current = currentScrollY;

      if (stopTimerRef.current) {
        window.clearTimeout(stopTimerRef.current);
      }

      stopTimerRef.current = window.setTimeout(() => {
        setIsVisible(true);
      }, 140);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (stopTimerRef.current) {
        window.clearTimeout(stopTimerRef.current);
      }
    };
  }, []);

  return (
    <>
      <div aria-hidden className="lg:hidden" style={{ height: mobileHeight }} />
      <div
        ref={wrapperRef}
        className={`fixed inset-x-0 top-0 z-50 transform transition-transform duration-300 ease-out will-change-transform lg:sticky lg:translate-y-0 ${
          isVisible ? "translate-y-0" : "-translate-y-[calc(100%+0.75rem)]"
        }`}
      >
        {children}
      </div>
    </>
  );
}
