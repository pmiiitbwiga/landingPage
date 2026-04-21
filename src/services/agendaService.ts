import { Agenda } from '@/src/types';
import { fetchFromSheet, postToSheet } from './apiService';

export const mockAgendas: Agenda[] = [
  {
    id: 'a001',
    title: 'Masa Penerimaan Anggota Baru (MAPABA) 2026',
    slug: 'mapaba-2026',
    date: '2026-05-20',
    endDate: '2026-05-22',
    time: '08:00',
    location: 'Aula Handayani, Kampus ITB WIGA',
    content: 'MAPABA merupakan gerbang awal bagi mahasiswa untuk bergabung dengan PMII. Dalam kegiatan ini Sahabat akan mendapatkan materi tentang keorganisasian, keislaman, dan keindonesiaan.',
    quota: 200,
    logoUrl: 'https://picsum.photos/seed/mapaba/1200/600',
    registrationUrl: '',
    facilities: 'Sertifikat, Konsumsi, Atribut PMII, Modul Materi',
    requirements: 'Mahasiswa Aktif, Melunasi administrasi, Mengikuti seluruh sesi',
    createdAt: '2026-04-01',
    authorId: 'u004',
    customFields: JSON.stringify([
      { id: 'f1', label: 'Alasan Bergabung', type: 'text' },
      { id: 'f2', label: 'Ukuran Kaos', type: 'select', options: 'S, M, L, XL, XXL' },
      { id: 'f3', label: 'Upload KTM', type: 'file' }
    ])
  },
  {
    id: 'a002',
    title: 'Pelatihan Kader Dasar (PKD)',
    slug: 'pkd-2026',
    date: '2026-06-15',
    endDate: '2026-06-18',
    time: '09:00',
    location: 'Gedung Soedjatmoko, Lumajang',
    content: 'PKD adalah tahap kaderisasi kedua di PMII. Fokus pada peningkatan kapasitas intelektual dan kepemimpinan kader.',
    quota: 100,
    logoUrl: 'https://picsum.photos/seed/pkd/1200/600',
    registrationUrl: '',
    facilities: 'Sertifikat, Penginapan, Konsumsi',
    requirements: 'Lulus MAPABA minimal 6 bulan, Mengumpulkan resume buku',
    createdAt: '2026-04-02',
    authorId: 'u004',
    customFields: JSON.stringify([
      { id: 'f1', label: 'Pengalaman Organisasi', type: 'text' },
      { id: 'f2', label: 'Fokus Minat', type: 'select', options: 'Politik, Ekonomi, Budaya, Teknologi' }
    ])
  },
];

export async function createAgenda(data: any): Promise<{ success: boolean; message?: string }> {
  try {
    return await postToSheet<any>('create_agenda', data);
  } catch (error: any) {
    console.error('Create Agenda error:', error);
    throw error;
  }
}

export async function registerAgenda(data: { memberId: string; agendaId: string; formData: any }): Promise<{ success: boolean; message?: string }> {
  try {
    return await postToSheet<any>('register_agenda', data);
  } catch (error: any) {
    console.error('Register Agenda error:', error);
    throw error;
  }
}

export async function getParticipations(): Promise<any[]> {
  try {
    return await fetchFromSheet<any[]>('get_participations');
  } catch (error) {
    console.error('Get Participations error:', error);
    return [];
  }
}

export async function getFormFields(): Promise<any[]> {
  try {
    return await fetchFromSheet<any[]>('get_form_fields');
  } catch (error) {
    console.error('Get Form Fields error:', error);
    return [];
  }
}

export async function addFormField(data: { label: string; type: string; options?: string; isRequired?: boolean }): Promise<any> {
  try {
    return await postToSheet<any>('add_form_field', data);
  } catch (error) {
    console.error('Add Form Field error:', error);
    throw error;
  }
}

export async function uploadFile(data: { base64: string; fileName: string; folderId?: string }): Promise<{ success: boolean; url: string }> {
  try {
    return await postToSheet<any>('upload_file', data);
  } catch (error) {
    console.error('Upload File error:', error);
    throw error;
  }
}

export async function updateAgenda(id: string, data: any): Promise<{ success: boolean; message?: string }> {
  try {
    return await postToSheet<any>('update_agenda', { id, ...data });
  } catch (error: any) {
    console.error('Update Agenda error:', error);
    throw error;
  }
}

export async function deleteAgenda(id: string): Promise<{ success: boolean; message?: string }> {
  try {
    return await postToSheet<any>('delete_agenda', { id });
  } catch (error: any) {
    console.error('Delete Agenda error:', error);
    throw error;
  }
}

export async function getAgendas(search?: string): Promise<Agenda[]> {
  try {
    const agendas = await fetchFromSheet<Agenda[]>('get_agendas');
    if (!Array.isArray(agendas)) {
      console.error('getAgendas: Expected array but got:', agendas);
      throw new Error('Data agenda bukan merupakan array.');
    }
    
    if (search) {
      return agendas.filter(a => 
        (a.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
        (a.content?.toLowerCase() || '').includes(search.toLowerCase())
      );
    }
    return agendas;
  } catch (error) {
    console.warn('Using mock agendas (Apps Script error or not connected)', error);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (search) {
      return mockAgendas.filter(a => 
        a.title.toLowerCase().includes(search.toLowerCase()) || 
        a.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    return mockAgendas;
  }
}

export async function getAgendaBySlug(slug: string): Promise<Agenda | undefined> {
  try {
    const agendas = await fetchFromSheet<Agenda[]>('get_agendas');
    if (!Array.isArray(agendas)) return mockAgendas.find(a => a.slug === slug);
    return agendas.find(a => a.slug === slug);
  } catch (error) {
    return mockAgendas.find(a => a.slug === slug);
  }
}
