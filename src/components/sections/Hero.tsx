import { Button } from '@/src/components/ui/Button';
import { motion } from 'motion/react';
import { ChevronRight, Users, BookOpen, MessageSquare } from 'lucide-react';
import { useAuth } from '@/src/lib/AuthContext';
import { Link } from 'react-router-dom';

export function Hero() {
  const { user } = useAuth();

  return (
    <section className="bg-white border border-line border-l-4 border-l-primary rounded-lg p-6 lg:p-8 shrink-0">
      <div className="flex flex-col gap-3">
        <div className="inline-flex items-center space-x-2 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-primary uppercase w-fit">
          <span>Komisariat Widya Gama</span>
        </div>
        <h1 className="text-2xl font-extrabold text-primary leading-tight md:text-3xl lg:text-4xl">
          Dzikir, Fikir, Amal Sholeh
        </h1>
        <p className="max-w-xl text-[14px] text-muted leading-relaxed">
          Membangun intelektualitas dan militansi kader PMII di bumi Lumajang. Wadah transformatif bagi mahasiswa ITB Widya Gama untuk Indonesia.
        </p>
        <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-3 sm:space-y-0 pt-2">
          {user ? (
            <Link to={user.role === 'ADMIN' || user.role === 'PENGURUS' ? '/admin' : '/member'}>
              <Button size="sm" variant="secondary" className="px-6 h-9 font-extrabold uppercase tracking-wider">
                PANEL DASYBOARD SAYA
              </Button>
            </Link>
          ) : (
            <Link to="/login">
              <Button size="sm" variant="secondary" className="px-6 h-9 font-extrabold uppercase tracking-wider">
                Gabung Sekarang
              </Button>
            </Link>
          )}
          <Link to="/tentang">
            <Button size="sm" variant="outline" className="px-6 h-9 font-bold">
              Profil Kaderisasi
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
