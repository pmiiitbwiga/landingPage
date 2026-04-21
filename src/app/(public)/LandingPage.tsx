import * as React from 'react';
import { Hero } from '@/src/components/sections/Hero';
import { LatestNews } from '@/src/components/sections/LatestNews';
import { LatestAgendas } from '@/src/components/sections/LatestAgendas';
import { Button } from '@/src/components/ui/Button';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { SEO } from '@/src/components/SEO';

export function LandingPage() {
  return (
    <div className="bg-surface">
      <SEO 
        title="Beranda" 
        description="Selamat datang di Portal Resmi PMII ITB WIGA Lumajang. Temukan berita terbaru, agenda kegiatan, dan pendaftaran anggota." 
      />
      <div className="container mx-auto px-4 py-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Main Content Area */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <Hero />
            <LatestNews />
            
            {/* Mission Section - Compact */}
            <section className="bg-white border border-line rounded-lg p-6">
                <div className="flex items-center gap-2 border-l-4 border-accent pl-3 mb-4">
                    <h2 className="text-[14px] font-bold text-muted uppercase tracking-wider">Visi & Misi Kami</h2>
                </div>
                <div className="space-y-4">
                    <p className="text-[14px] text-ink font-medium italic border-l-2 border-primary/20 pl-4 py-1">
                      "Terbentuknya pribadi muslim Indonesia yang bertaqwa kepada Allah SWT, berbudi luhur, berilmu, cakap dan bertanggung jawab."
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <h4 className="font-bold text-primary text-[13px]">Intelektualitas</h4>
                            <p className="text-[12px] text-muted leading-tight">Budaya fikir yang kritis, dialektis, dan ilmiah sebagai landasan bertindak.</p>
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-bold text-primary text-[13px]">Religiusitas</h4>
                            <p className="text-[12px] text-muted leading-tight">Menanamkan nilai-nilai keIslaman Aswaja dalam setiap nafas pergerakan.</p>
                        </div>
                    </div>
                </div>
            </section>
          </div>

          {/* Sidebar Area */}
          <aside className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-20 lg:h-fit">
            <LatestAgendas />
            
            {/* Compact CTA Box */}
            <div className="bg-primary rounded-lg p-6 text-white text-center shadow-lg shadow-primary/10">
              <h3 className="text-lg font-bold mb-2">Siap Bergabung?</h3>
              <p className="text-[12px] opacity-80 mb-5 leading-relaxed">
                Mari berproses bersama di PK PMII ITB Widya Gama Lumajang. Tangan Terkepal dan Maju Kemuka!
              </p>
              <Link to="/login">
                <Button size="md" variant="secondary" className="w-full text-[12px] font-extrabold shadow-sm active:scale-[0.98]">
                  DAFTAR ANGGOTA SEKARANG
                </Button>
              </Link>
            </div>

            {/* FAQ Sidebar Widget */}
            <div className="bg-white border border-line rounded-lg p-5">
                <h4 className="text-[13px] font-bold text-muted uppercase tracking-wider mb-4 border-b border-line pb-2">Tanya & Jawab</h4>
                <div className="space-y-2">
                    <FAQItem 
                      question="Apa itu PMII?" 
                      answer="PMII adalah organisasi kemahasiswaan berbasis Islam Ahlussunnah wal Jama'ah di Indonesia." 
                    />
                    <FAQItem 
                      question="Siapa yang bisa bergabung?" 
                      answer="Seluruh mahasiswa aktif di kampus ITB Widya Gama Lumajang tanpa terkecuali." 
                    />
                    <FAQItem 
                      question="Dimana sekretariatnya?" 
                      answer="Sekretariat kami berada di sekitar area kampus ITB WIGA, hubungi admin untuk lokasi persis." 
                    />
                </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div 
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onClick={() => setIsOpen(!isOpen)}
      className="space-y-1.5 p-2 rounded-md hover:bg-surface cursor-pointer transition-colors"
    >
      <p className="text-[12px] font-bold text-ink flex items-center justify-between">
        {question}
        <ChevronRight className={cn("h-3 w-3 transition-transform", isOpen && "rotate-90")} />
      </p>
      {isOpen && (
        <p className="text-[11px] text-muted leading-tight animate-in fade-in slide-in-from-top-1 duration-200">
          {answer}
        </p>
      )}
    </div>
  );
}
