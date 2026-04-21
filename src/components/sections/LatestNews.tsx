import * as React from 'react';
import { PostCard } from '@/src/components/cards/PostCard';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Button } from '@/src/components/ui/Button';
import { getPosts } from '@/src/services/postService';
import { Post, Category } from '@/src/types';
import { cn } from '@/src/lib/utils';
import { useSearch } from '@/src/lib/SearchContext';

export function LatestNews() {
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState<Category | 'Semua'>('Semua');
  const { searchQuery } = useSearch();

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    
    getPosts(searchQuery).then((data) => {
      if (active) {
        // Filter and sort by date descending to get the truly latest
        const sorted = data
          .filter(p => p.status === 'Published')
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          
        setPosts(sorted);
        setLoading(false);
      }
    }).catch(err => {
      console.error('LatestNews fetch error:', err);
      if (active) setLoading(false);
    });

    return () => { active = false; };
  }, [searchQuery]);

  const filteredPosts = posts.filter((p) => 
    filter === 'Semua' || 
    p.category?.toLowerCase() === filter.toLowerCase()
  );

  return (
    <section>
      <div className="mb-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
        <div className="flex items-center gap-2 border-l-4 border-accent pl-3">
          <h2 className="text-[14px] font-bold text-muted uppercase tracking-wider">
            Berita & Artikel Terbaru
          </h2>
        </div>
        <div className="flex items-center gap-2">
           <div className="flex bg-white border border-line rounded-md p-1">
            {(['Semua', 'Berita', 'Artikel', 'Opini'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={cn(
                  'px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded transition-colors',
                  filter === cat ? 'bg-primary text-white' : 'text-muted hover:bg-gray-50'
                )}
              >
                {cat}
              </button>
            ))}
          </div>
          <button className="text-[12px] font-bold text-primary hover:underline ml-2">
            Lihat Semua →
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-[240px] w-full rounded-lg" />
          ))}
        </div>
      ) : filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.slice(0, 6).map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col h-48 items-center justify-center rounded-lg bg-white border border-line border-dashed p-6 text-center">
          <p className="text-ink font-bold text-sm mb-1">Sheet "posts" mungkin masih kosong.</p>
          <p className="text-muted text-[12px] max-w-xs">
            Silakan tambahkan data di Google Sheets pada sheet <b>posts</b> agar Berita & Artikel muncul di sini.
          </p>
        </div>
      )}
    </section>
  );
}
