import * as React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { cn } from '@/src/lib/utils';

const faqs = [
  {
    question: 'Apa itu PMII?',
    answer: 'Pergerakan Mahasiswa Islam Indonesia (PMII) adalah organisasi kemahasiswaan yang berlandaskan Ahlussunnah wal Jamaah, yang lahir di Surabaya pada tanggal 17 April 1960.',
  },
  {
    question: 'Bagaimana cara bergabung dengan PK PMII ITB WIGA?',
    answer: 'Mahasiswa ITB Widya Gama dapat bergabung dengan mengikuti Masa Penerimaan Anggota Baru (MAPABA) yang diadakan secara rutin setiap semester. Pantau agenda terbaru kami untuk jadwal pendaftaran.',
  },
  {
    question: 'Apakah PMII hanya untuk mahasiswa beragama Islam?',
    answer: 'Sesuai namanya, PMII adalah wadah bagi Mahasiswa Islam. Namun, nilai-nilai kemanusiaan dan keadilan yang kami perjuangkan bersifat universal untuk kemaslahatan seluruh umat manusia.',
  },
  {
    question: 'Apa keuntungan menjadi kader PMII?',
    answer: 'Banyak keuntungan, mulai dari pengembangan soft skills (kepemimpinan, manajemen organisasi, bicara di depan umum), jaringan relasi nasional, hingga bimbingan intelektual dan spiritual yang mendalam.',
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <HelpCircle className="h-6 w-6" />
                </div>
            </div>
            <h2 className="text-3xl font-extrabold text-ink md:text-4xl">Pertanyaan Sering <span className="text-primary italic">Diajukan</span></h2>
            <p className="text-gray-600">Butuh bantuan? Berikut adalah beberapa jawaban atas pertanyaan yang sering diajukan mengenai PK PMII ITB Widya Gama.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className={cn(
                  'overflow-hidden rounded-2xl border transition-all duration-200',
                  openIndex === i ? 'border-primary ring-1 ring-primary/20 bg-primary/5' : 'border-gray-100 hover:border-gray-200'
                )}
              >
                <button
                  onClick={() => setOpenIndex(openIndex === i ? null : i)}
                  className="flex w-full items-center justify-between p-6 text-left"
                >
                  <span className="text-lg font-bold text-ink">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 text-gray-400 transition-transform duration-200',
                      openIndex === i && 'rotate-180 text-primary'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'grid transition-all duration-200 ease-in-out',
                    openIndex === i ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="p-6 pt-0 text-gray-600 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
