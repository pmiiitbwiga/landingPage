export type Category = 'Berita' | 'Artikel' | 'Opini';
export type ContentStatus = 'Draft' | 'Pending' | 'Published';
export type UserRole = 'PENGURUS' | 'CALON' | 'KADER' | 'KADER EKSTERNAL' | 'ADMIN';
export type AccountStatus = 'AKTIF' | 'NONAKTIF';

export interface ContentBase {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  createdAt: string;
  updatedAt?: string;
  author: string;
  authorId: string;
  status: ContentStatus;
  tags?: string;
}

export interface Post extends ContentBase {
  category: Category;
  excerpt: string;
}

export interface Member {
  uid: string;
  name: string;
  nim: string;
  email: string;
  password?: string;
  jenisKelamin: string;
  tempatLahir: string;
  tanggalLahir: string;
  alamat: string;
  whatsapp: string;
  komisariat: string;
  statusKaderisasi: string;
  role: UserRole;
  accountStatus: AccountStatus;
  photoUrl: string;
  createdAt: string;
  lastLogin: string;
}

export interface Participation {
  id: string;
  memberId: string;
  agendaId: string;
  status: 'Registered' | 'Attended';
  formData: string; // JSON string
  certificateUrl: string;
  registeredAt: string;
}

export interface Agenda {
  id: string;
  title: string;
  slug: string;
  date: string;
  endDate: string;
  time: string;
  location: string;
  linkLokasi?: string;
  content: string;
  quota: number;
  logoUrl: string;
  registrationUrl: string;
  facilities: string;
  requirements?: string;
  createdAt: string;
  authorId: string;
  customFields?: string; // JSON string
  contactPerson?: string; // Comma separated list
}

export interface FAQItem {
  question: string;
  answer: string;
}

export interface NavItem {
  label: string;
  href: string;
}
