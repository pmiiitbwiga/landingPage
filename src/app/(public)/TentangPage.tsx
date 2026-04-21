import * as React from 'react';

export function TentangPage() {
  return (
    <div className="bg-surface min-h-screen">
      <div className="bg-primary py-16 text-white text-center">
        <div className="container mx-auto px-4 lg:px-8">
            <h1 className="text-3xl font-extrabold md:text-5xl tracking-tight mb-4">Tentang Kami</h1>
            <p className="text-white/70 max-w-2xl mx-auto text-[15px] font-medium">
              Profil PK PMII ITB Widya Gama Lumajang: Wadah Intelektualitas dan Militansi Kader Pergerakan.
            </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 lg:px-8 max-w-4xl">
        <div className="bg-white border border-line rounded-xl p-8 md:p-12 space-y-12 shadow-sm">
            <section className="space-y-4">
                <h2 className="text-xl font-extrabold text-primary border-b-2 border-accent pb-2 w-fit uppercase tracking-wider">Sejarah Kami</h2>
                <div className="prose prose-sm text-muted leading-relaxed">
                    <p>
                        PK PMII ITB Widya Gama Lumajang didirikan sebagai wadah bagi mahasiswa Muslim di lingkungan kampus ITB Widya Gama untuk berorganisasi, berdiskusi, dan mengembangkan potensi diri berlandaskan nilai-nilai Ahlussunnah wal Jama'ah. 
                    </p>
                    <p>
                        Sejak berdirinya, kami terus berkomitmen untuk mencetak kader-kader yang Ulul Albab, yang memiliki keseimbangan antara kecerdasan intelektual, kematangan emosional, dan kedalaman spiritual.
                    </p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-extrabold text-primary border-b-2 border-accent pb-2 w-fit uppercase tracking-wider">Visi & Misi</h2>
                <div className="space-y-6">
                    <div className="p-6 bg-surface rounded-lg border-l-4 border-primary italic font-medium text-ink">
                        "Terbentuknya pribadi muslim Indonesia yang bertaqwa kepada Allah SWT, berbudi luhur, berilmu, cakap dan bertanggung jawab dalam mengamalkan ilmunya dan komitmen memperjuangkan cita-cita kemerdekaan Indonesia."
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-3">
                            <h3 className="font-bold text-ink">Eksistensi Mahasiswa</h3>
                            <p className="text-[13px] text-muted">Menjadi pusat pergerakan mahasiswa yang aktif berpartisipasi dalam dinamika sosial dan intelektual di kampus maupun masyarakat.</p>
                        </div>
                        <div className="space-y-3">
                            <h3 className="font-bold text-ink">Kualitas Kader</h3>
                            <p className="text-[13px] text-muted">Menyelenggarakan sistem kaderisasi yang berkelanjutan dan berkualitas untuk membentuk kepemimpinan yang progresif.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-extrabold text-primary border-b-2 border-accent pb-2 w-fit uppercase tracking-wider">Struktur Organisasi</h2>
                <div className="p-8 border-2 border-dashed border-line rounded-xl flex flex-col items-center justify-center text-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-accent/20 flex items-center justify-center text-primary">
                        <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                    </div>
                    <p className="text-muted text-[13px] font-medium leading-relaxed">
                        Kami memiliki jajaran pengurus harian (Ketua, Sekretaris, Bendahara) dan Biro-biro departemen yang membidangi Kaderisasi, Jurnalistik, Keorganisasian, dan Minat Bakat.
                    </p>
                    <button className="text-[12px] font-extrabold text-primary uppercase tracking-widest hover:underline">
                        Lihat Struktur Lengkap ↓
                    </button>
                </div>
            </section>
        </div>
      </div>
    </div>
  );
}
