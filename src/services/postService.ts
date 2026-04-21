import { Post } from '@/src/types';
import { fetchFromSheet, postToSheet } from './apiService';

export const mockPosts: Post[] = [
  {
    id: 'c001',
    title: 'Aksi Sosial PMII Lumajang',
    slug: 'aksi-social-pmii-lumajang',
    category: 'Berita',
    excerpt: 'Kader PMII mengadakan aksi sosial kemanusiaan untuk masyarakat terdampak...',
    content: 'Lorem ipsum dolor sit amet...',
    featuredImage: 'https://picsum.photos/seed/pmii1/600/400',
    createdAt: '2026-04-01T10:00:00Z',
    updatedAt: '2026-04-02T10:00:00Z',
    author: 'Ahmad Fadli',
    authorId: 'u001',
    status: 'Published',
    tags: 'sosial, kemanusiaan'
  },
  {
    id: 'c002',
    title: 'Eksistensi Mahasiswa di Era Digital',
    slug: 'eksistensi-mahasiswa-digital',
    category: 'Artikel',
    excerpt: 'Tantangan mahasiswa digital dalam menghadapi disrupsi teknologi...',
    content: 'Full content here...',
    featuredImage: 'https://picsum.photos/seed/pmii3/600/400',
    createdAt: '2026-04-03T08:00:00Z',
    updatedAt: '2026-04-04T08:00:00Z',
    author: 'Siti Rahma',
    authorId: 'u002',
    status: 'Published',
    tags: 'digital, mahasiswa'
  },
  {
    id: 'c004',
    title: 'Tips Efektif Belajar Online',
    slug: 'tips-efektif-belajar-online',
    category: 'Artikel',
    excerpt: 'Tips belajar online lebih efektif dengan manajemen waktu yang baik...',
    content: 'Full content here...',
    featuredImage: 'https://picsum.photos/seed/pmii4/600/400',
    createdAt: '2026-04-07T14:00:00Z',
    updatedAt: '2026-04-08T14:00:00Z',
    author: 'Rina Permata',
    authorId: 'u004',
    status: 'Published',
    tags: 'belajar, online'
  },
];

export async function createPost(postData: any): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await postToSheet<any>('create_post', postData);
    return response;
  } catch (error: any) {
    console.error('Create Post error:', error);
    throw error;
  }
}

export async function getPosts(search?: string): Promise<Post[]> {
  try {
    const posts = await fetchFromSheet<Post[]>('get_news');
    if (!Array.isArray(posts)) {
      console.error('getPosts: Expected array but got:', posts);
      throw new Error('Data berita bukan merupakan array.');
    }
    
    if (search) {
      return posts.filter(p => 
        (p.title?.toLowerCase() || '').includes(search.toLowerCase()) || 
        (p.content?.toLowerCase() || '').includes(search.toLowerCase())
      );
    }
    return posts;
  } catch (error) {
    console.warn('Using mock posts (Apps Script error or not connected)', error);
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (search) {
      return mockPosts.filter(p => 
        p.title.toLowerCase().includes(search.toLowerCase()) || 
        p.content.toLowerCase().includes(search.toLowerCase())
      );
    }
    return mockPosts;
  }
}

export async function getPostBySlug(slug: string): Promise<Post | undefined> {
  try {
    const posts = await fetchFromSheet<Post[]>('get_news');
    if (!Array.isArray(posts)) return mockPosts.find(p => p.slug === slug);
    return posts.find(p => p.slug === slug);
  } catch (error) {
    return mockPosts.find(p => p.slug === slug);
  }
}
