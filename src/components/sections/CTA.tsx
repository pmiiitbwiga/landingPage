import { Button } from '@/src/components/ui/Button';
import { Send } from 'lucide-react';

export function CTA() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-primary px-8 py-16 text-center text-white lg:py-24">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 h-full w-1/2 bg-[radial-gradient(circle_at_70%_50%,rgba(255,204,0,0.15),transparent_50%)]"></div>
          <div className="absolute -left-12 -top-12 h-64 w-64 rounded-full bg-white/5 blur-3xl"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
             <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
               Siap Menjadi Bagian dari <span className="text-accent underline decoration-accent/30 underline-offset-8">Perubahan?</span>
             </h2>
             <p className="text-xl text-gray-300">
               Jangan lewatkan kesempatan untuk berkembang, belajar, dan berjuang bersama ribuan kader PMII di seluruh Indonesia. Mulai langkahmu di Kaderisasi ITB WIGA.
             </p>
             <div className="flex flex-col sm:flex-row justify-center gap-4">
               <Button size="lg" variant="secondary" className="px-10 py-6 text-xl">
                 Daftar Sekarang
               </Button>
               <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white hover:text-primary px-10 py-6 text-xl">
                 Hubungi Kami
               </Button>
             </div>
             
             <div className="pt-8 flex flex-wrap justify-center items-center gap-8 text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-accent" />
                    <span>itbwiga.pmii@gmail.com</span>
                </div>
                <span>•</span>
                <span>Lumajang, Jawa Timur</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
