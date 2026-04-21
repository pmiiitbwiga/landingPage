import * as React from 'react';
import { Navbar } from '@/src/components/navigation/Navbar';
import { Footer } from '@/src/components/layout/Footer';
import { motion, AnimatePresence } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/src/lib/AuthContext';

export function MainLayout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-surface">
        <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-xs font-black text-primary uppercase tracking-widest">Memuat Pergerakan...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
}
