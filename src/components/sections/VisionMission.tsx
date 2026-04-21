import { CheckCircle2, Target, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';

const values = [
  {
    title: 'Religiusitas',
    desc: 'Menanamkan nilai-nilai keIslaman Ahlussunnah wal Jamaah dalam setiap nafas pergerakan.',
    icon: Shield,
    color: 'bg-blue-500',
  },
  {
    title: 'Intelektualitas',
    desc: 'Budaya fikir yang kritis, dialektis, dan ilmiah sebagai landasan bertindak.',
    icon: Zap,
    color: 'bg-yellow-500',
  },
  {
    title: 'Kemanusiaan',
    desc: ' Keberpihakan pada nilai-nilai kemanusiaan dan keadilan sosial bagi seluruh masyarakat.',
    icon: CheckCircle2,
    color: 'bg-green-500',
  },
];

export function VisionMission() {
  return (
    <section className="py-24 bg-surface">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-block px-4 py-1.5 rounded-full bg-accent/20 text-primary font-bold text-sm tracking-wider uppercase">
               Visi & Misi
            </div>
            <h2 className="text-4xl font-extrabold text-ink leading-tight">
              Terbentuknya <span className="text-primary italic">Pribadi Muslim</span> Indonesia yang Bertakwa.
            </h2>
            <div className="space-y-6">
              <div className="flex gap-4">
                 <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-primary flex items-center justify-center text-white">
                    <Target className="h-6 w-6" />
                 </div>
                 <div>
                    <h3 className="text-xl font-bold mb-2">Visi Organisasi</h3>
                    <p className="text-gray-600 leading-relaxed italic">
                      "Terbentuknya pribadi muslim Indonesia yang bertaqwa kepada Allah SWT, berbudi luhur, berilmu, cakap dan bertanggung jawab dalam mengamalkan ilmunya serta komitmen memperjuangkan cita-cita kemerdekaan Indonesia."
                    </p>
                 </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <h3 className="text-xl font-bold">Misi Utama Kita</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    'Kaderisasi Berkelanjutan',
                    'Advokasi Kemahasiswaan',
                    'Aksi Sosial Kemasyarakatan',
                    'Pengembangan Literasi & Riset',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-gray-700">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
             {values.map((v, i) => (
               <motion.div
                 key={v.title}
                 initial={{ opacity: 0, y: 20 }}
                 whileInView={{ opacity: 1, y: 0 }}
                 viewport={{ once: true }}
                 transition={{ delay: i * 0.1 }}
                 className="flex gap-6 p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
               >
                 <div className={`h-14 w-14 flex-shrink-0 rounded-xl ${v.color} flex items-center justify-center text-white shadow-lg`}>
                    <v.icon className="h-8 w-8" />
                 </div>
                 <div className="space-y-2">
                    <h4 className="text-xl font-bold">{v.title}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{v.desc}</p>
                 </div>
               </motion.div>
             ))}
          </div>
        </div>
      </div>
    </section>
  );
}
