import { Post } from '@/src/types';
import { Badge } from '@/src/components/ui/Badge';
import { formatDate } from '@/src/lib/utils';
import { Link } from 'react-router-dom';
import { Clock, User } from 'lucide-react';

interface PostCardProps {
  post: Post;
}

export function PostCard({ post }: PostCardProps) {
  // Normalize category to prevent routing issues
  const rawCategory = post.category || '';
  const categoryPath = rawCategory.trim().toLowerCase();
  
  // Robust slug handling
  const slug = post.slug || 'no-slug';
  const detailHref = `/${categoryPath}/${slug}`;

  // Stronger excerpt cleaning for the frontend to handle old messy data
  const cleanExcerpt = (post.excerpt || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&[a-z0-9#]+;/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-line bg-white transition-all duration-300 hover:border-primary hover:shadow-xl hover:shadow-primary/5">
      <Link to={detailHref} className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <img
          src={post.featuredImage || 'https://picsum.photos/seed/pmii/800/450'}
          alt={post.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="text-white text-[10px] font-bold uppercase tracking-widest">Baca Selengkapnya</span>
        </div>
        <div className="absolute left-3 top-3">
          <Badge variant={post.category === 'Berita' ? 'primary' : 'accent'} className="text-[10px] font-black py-1 px-3 shadow-sm uppercase tracking-tighter">
            {post.category}
          </Badge>
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center space-x-3 text-[11px] text-muted">
          <div className="flex items-center space-x-1.5">
            <Clock className="h-3.5 w-3.5 text-accent" />
            <span>{formatDate(post.createdAt)}</span>
          </div>
          <span className="opacity-30">•</span>
          <div className="flex items-center space-x-1.5">
            <User className="h-3.5 w-3.5 text-primary" />
            <span className="font-bold text-ink uppercase tracking-tight">{post.author}</span>
          </div>
        </div>
        <Link to={detailHref}>
          <h3 className="mb-3 line-clamp-2 text-[16px] font-extrabold text-primary leading-tight group-hover:text-accent transition-colors decoration-accent/30 underline-offset-4 group-hover:underline">
            {post.title}
          </h3>
        </Link>
        <p className="line-clamp-3 text-[13px] text-muted/80 leading-relaxed mb-4 font-medium">
          {cleanExcerpt}
        </p>
        <div className="mt-auto pt-4 border-t border-line flex items-center justify-between">
          <Link
            to={detailHref}
            className="inline-flex items-center text-[12px] font-black text-primary hover:text-accent transition-colors uppercase tracking-widest"
          >
            SELENGKAPNYA →
          </Link>
        </div>
      </div>
    </article>
  );
}
