import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube, Mail, MapPin, Phone } from 'lucide-react';

const footerLinks = [
  {
    title: 'Navigasi',
    links: [
        { label: 'Beranda', href: '/' },
        { label: 'Tentang Kami', href: '/tentang' },
        { label: 'Struktur Organisasi', href: '/tentang#struktur' },
        { label: 'Visi & Misi', href: '/tentang#visi-misi' },
    ],
  },
  {
    title: 'Konten',
    links: [
        { label: 'Berita Terbaru', href: '/berita' },
        { label: 'Artikel & Opini', href: '/artikel' },
        { label: 'Agenda Kegiatan', href: '/agenda' },
        { label: 'Galeri Foto', href: '/galeri' },
    ],
  },
  {
    title: 'Keanggotaan',
    links: [
        { label: 'Pendaftaran Anggota', href: '/daftar' },
        { label: 'Konfirmasi Pembayaran', href: '/konfirmasi' },
        { label: 'Sertifikat Kader', href: '/sertifikat' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white border-t border-line px-6 h-[40px] flex items-center justify-between text-[11px] text-muted">
      <div>&copy; {new Date().getFullYear()} PK PMII ITB Widya Gama Lumajang. Tangan Terkepal dan Maju Kemuka!</div>
      <div className="flex gap-4">
        <a href="#" className="hover:text-primary transition-colors">Privasi</a>
        <a href="#" className="hover:text-primary transition-colors">Ketentuan</a>
        <span className="opacity-50">Powered by Next.js & AI Studio</span>
      </div>
    </footer>
  );
}
