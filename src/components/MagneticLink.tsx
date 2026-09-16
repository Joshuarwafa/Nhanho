import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface Props {
  to: string;
  children: ReactNode;
  className?: string;
  strength?: number;
  state?: unknown;
}

/** Wraps a route Link so it gently follows the cursor within its own bounds — a premium micro-interaction on desktop pointers. */
export default function MagneticLink({ to, children, className, strength = 0.35, state }: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 200, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 200, damping: 18, mass: 0.4 });

  const handleMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el || window.matchMedia?.('(pointer: coarse)').matches) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  };

  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.span style={{ x: sx, y: sy, display: 'inline-block' }} onMouseMove={handleMove} onMouseLeave={reset}>
      <Link ref={ref} to={to} state={state} className={className}>
        {children}
      </Link>
    </motion.span>
  );
}
