'use client';

import { useRef, useCallback, type ReactNode, type MouseEvent } from 'react';

// ─── TiltCard ───────────────────────────────────────────────────────

interface TiltCardProps {
  children: ReactNode;
  /** Maximum tilt angle in degrees (default: 8) */
  maxTilt?: number;
  /** Show glare overlay following mouse (default: true) */
  glare?: boolean;
  /** Hover scale factor (default: 1.02) */
  scale?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * 3D interactive card with mouse-tracking perspective tilt and subtle glare.
 *
 * - Pure CSS transforms — no animation library
 * - Uses `requestAnimationFrame` for smooth 60fps
 * - Respects `prefers-reduced-motion: reduce` via media query check
 * - Falls back to flat card on touch devices (no hover)
 */
export function TiltCard({
  children,
  maxTilt = 8,
  glare = true,
  scale = 1.02,
  className = '',
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      // Respect prefers-reduced-motion
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const card = cardRef.current;
      if (!card) return;

      // Cancel previous frame to avoid stacking
      cancelAnimationFrame(rafRef.current);

      rafRef.current = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        // Normalized -1 to 1 from center
        const percentX = (e.clientX - centerX) / (rect.width / 2);
        const percentY = (e.clientY - centerY) / (rect.height / 2);

        // Tilt: Y-axis rotation from X movement, X-axis from Y movement (inverted)
        const rotateY = percentX * maxTilt;
        const rotateX = -percentY * maxTilt;

        card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale}, ${scale}, ${scale})`;

        // Glare effect
        if (glare && glareRef.current) {
          const glareX = ((e.clientX - rect.left) / rect.width) * 100;
          const glareY = ((e.clientY - rect.top) / rect.height) * 100;
          glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.08) 0%, transparent 60%)`;
          glareRef.current.style.opacity = '1';
        }
      });
    },
    [maxTilt, scale, glare]
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    cancelAnimationFrame(rafRef.current);
    card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';

    if (glare && glareRef.current) {
      glareRef.current.style.opacity = '0';
    }
  }, [glare]);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative will-change-transform transition-transform duration-200 ease-out ${className}`}
      style={{ transformStyle: 'preserve-3d' }}
    >
      {children}

      {/* Glare overlay */}
      {glare && (
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
