"use client";

import { useEffect, useRef, useState } from "react";

type MobileScrollHeaderProps = {
  children: React.ReactNode;
};

export function MobileScrollHeader({ children }: MobileScrollHeaderProps) {
  const lastScrollYRef = useRef(0);
  const keepVisibleUntilRef = useRef(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    lastScrollYRef.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollYRef.current;
      const shouldKeepVisible = window.performance.now() < keepVisibleUntilRef.current;

      if (shouldKeepVisible) {
        setIsVisible(true);
        lastScrollYRef.current = currentScrollY;
        return;
      }

      if (currentScrollY <= 24 || delta < -4) {
        setIsVisible(true);
      } else if (delta > 6) {
        setIsVisible(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      onPointerDownCapture={() => {
        keepVisibleUntilRef.current = window.performance.now() + 700;
        setIsVisible(true);
      }}
      className={`sticky z-50 transform transition-transform duration-300 ease-out will-change-transform ${
        isVisible ? "translate-y-0" : "-translate-y-[calc(100%+0.75rem)]"
      }`}
      style={{ top: "env(safe-area-inset-top, 0px)" }}
    >
      {children}
    </div>
  );
}
