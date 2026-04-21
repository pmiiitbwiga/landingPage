import { ShieldCheck, Zap, Globe, Heart } from 'lucide-react';

const programs = [
  {
    title: 'Kaderisasi Formal',
    desc: 'Jenjang pelatihan wajib (MAPABA, PKD, PKL) untuk mengasah intelektual dan militansi kader.',
    icon: Zap,
  },
  {
    title: 'Kajian Strategis',
    desc: 'Diskusi rutin bedah isu kontemporer, politik, ekonomi, dan keagamaan berpaham Aswaja.',
    icon: ShieldCheck,
  },
  {
    title: 'Advokasi Sosial',
    desc: 'Pendampingan masyarakat dan pengawalan kebijakan publik yang tidak berpihak pada rakyat.',
    icon: Globe,
  },
  {
    title: 'Pemberdayaan Korpri',
    desc: 'Wadah aktualisasi diri sumber daya kader putri untuk kesetaraan dan keadilan gender.',
    icon: Heart,
  },
];

export function MainPrograms() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:items-center gap-16">
          <div>
            <div className="space-y-6">
                <h2 className="text-4xl font-extrabold text-ink leading-tight">
                  Berfokus pada <span className="text-primary italic">Pengembangan</span> dan Aksi Nyata.
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                  PK PMII ITB WIGA bukan sekadar organisasi, melainkan laboratorium perjuangan tempat transformasi diri dan sosial terjadi melalui program-program strategis berkelanjutan.
                </p>
                <div className="pt-4 grid grid-cols-2 gap-4">
                   <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                      <p className="text-3xl font-bold text-primary">80%</p>
                      <p className="text-sm font-medium text-gray-500">Lulusan Kompeten</p>
                   </div>
                   <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50">
                      <p className="text-3xl font-bold text-primary">24/7</p>
                      <p className="text-sm font-medium text-gray-500">Siap Bergerak</p>
                   </div>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {programs.map((p) => (
              <div key={p.title} className="group p-8 rounded-2xl border border-gray-100 bg-white hover:border-primary/20 hover:shadow-xl hover:shadow-primary/5 transition-all">
                 <div className="mb-6 h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <p.icon className="h-6 w-6" />
                 </div>
                 <h3 className="text-xl font-bold mb-3">{p.title}</h3>
                 <p className="text-gray-500 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
