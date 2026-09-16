import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

/** Route-level enter/exit used by every page, keyed on pathname by the AnimatePresence in App.tsx. */
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.45, ease: [0.165, 0.84, 0.44, 1] }}
    >
      {children}
    </motion.div>
  );
}
