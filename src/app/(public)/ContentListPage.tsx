import * as React from 'react';
import { useSearch } from '@/src/lib/SearchContext';
import { getPosts } from '@/src/services/postService';
import { Post, Category } from '@/src/types';
import { PostCard } from '@/src/components/cards/PostCard';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { cn } from '@/src/lib/utils';
import { SEO } from '@/src/components/SEO';

interface ContentListPageProps {
  type: Category;
  title: string;
}

export function ContentListPage({ type, title }: ContentListPageProps) {
  const { searchQuery } = useSearch();
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    getPosts(searchQuery).then((data) => {
      // Filter by type AND ensuring only Published content is shown to public
      const filtered = data
        .filter(p => p.category === type && p.status === 'Published')
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
      setPosts(filtered);
      setLoading(false);
    });
  }, [searchQuery, type]);

  return (
    <div className="bg-surface min-h-screen py-10">
      <SEO 
        title={title} 
        description={`Kumpulan ${title.toLowerCase()} terbaru seputar kegiatan dan isu terkini dari PMII ITB WIGA Lumajang.`} 
      />
      <div className="container mx-auto px-4 lg:px-8">
        <header className="mb-8 border-b border-line pb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div className="flex items-center gap-3 border-l-4 border-accent pl-4">
            <h1 className="text-2xl font-extrabold text-ink md:text-3xl uppercase tracking-tight">{title}</h1>
          </div>
          <p className="text-[13px] text-muted font-medium">
            Menampilkan {posts.length} {type.toLowerCase()} terbaru
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[300px] w-full rounded-lg" />
            ))}
          </div>
        ) : posts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 bg-white border border-line rounded-lg border-dashed">
            <p className="text-muted text-sm italic mb-2">Tidak ditemukan konten yang sesuai dengan pencarian Anda.</p>
            <button 
              onClick={() => window.location.reload()}
              className="text-primary font-bold text-xs hover:underline uppercase tracking-widest"
            >
              Reset Pencarian
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
