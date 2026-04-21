import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostBySlug } from '@/src/services/postService';
import { Post } from '@/src/types';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { Badge } from '@/src/components/ui/Badge';
import { formatDate } from '@/src/lib/utils';
import { Calendar, User, ArrowLeft, Share2, Facebook, Twitter, Instagram } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SEO } from '@/src/components/SEO';

export function ContentDetail({ type }: { type: 'berita' | 'artikel' | 'opini' }) {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = React.useState<Post | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (slug) {
      getPostBySlug(slug).then((data) => {
        setPost(data || null);
        setLoading(false);
      });
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-24 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <Skeleton className="h-10 w-2/3" />
          <div className="flex gap-4">
             <Skeleton className="h-4 w-24" />
             <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="aspect-video w-full rounded-2xl" />
          <div className="space-y-4 pt-8">
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-full" />
             <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!post || post.status !== 'Published') {
    return (
      <div className="container mx-auto px-4 py-32 text-center lg:px-8">
        <h2 className="text-3xl font-bold mb-4">Konten Tidak Ditemukan atau Belum Diterbitkan</h2>
        <p className="text-muted mb-8 italic">Konten ini mungkin sedang dalam proses peninjauan oleh Admin.</p>
        <Link to="/" className="text-primary font-bold hover:underline">Kembali ke Beranda</Link>
      </div>
    );
  }

  const cleanDescription = post.excerpt || post.content.replace(/<[^>]*>?/gm, '').substring(0, 150) + '...';

  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": post.title,
    "image": [
      post.featuredImage
    ],
    "datePublished": post.createdAt,
    "dateModified": post.createdAt,
    "author": [{
      "@type": "Person",
      "name": post.author,
    }],
    "publisher": {
      "@type": "Organization",
      "name": "PMII ITB WIGA Lumajang",
      "logo": {
        "@type": "ImageObject",
        "url": "https://pmii-wiga.vercel.app/logo.png"
      }
    }
  };

  return (
    <div className="bg-white">
      <SEO 
        title={post.title} 
        description={cleanDescription}
        image={post.featuredImage}
        schemaMarkup={schemaMarkup}
      />
      {/* Article Header */}
      <header className="container mx-auto px-4 pt-16 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link to={type === 'berita' ? '/berita' : type === 'artikel' ? '/artikel' : '/opini'} className="inline-flex items-center text-sm font-semibold text-gray-500 hover:text-primary mb-4 transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Kembali ke daftar {type}
          </Link>
          <div className="space-y-4">
            <Badge variant={type === 'berita' ? 'primary' : 'accent'} className="px-4 py-1.5 text-sm">
                {post.category}
            </Badge>
            <h1 className="text-4xl font-extrabold leading-tight text-ink md:text-5xl lg:text-6xl">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-500 pt-2 border-t border-gray-100 mt-6 pb-6">
                <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-ink">{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(post.createdAt)}</span>
                </div>
                <div className="flex items-center ml-auto gap-4">
                    <span className="text-sm font-medium">Bagikan:</span>
                    <div className="flex gap-2">
                        <button className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-primary transition-all shadow-sm"><Facebook className="h-4 w-4" /></button>
                        <button className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-primary transition-all shadow-sm"><Twitter className="h-4 w-4" /></button>
                        <button className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-primary transition-all shadow-sm"><Instagram className="h-4 w-4" /></button>
                        <button className="h-8 w-8 rounded-full border flex items-center justify-center hover:bg-gray-50 text-gray-400 hover:text-primary transition-all shadow-sm"><Share2 className="h-4 w-4" /></button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Image */}
      <div className="container mx-auto px-4 lg:px-8 mb-16">
        <div className="max-w-5xl mx-auto">
            <div className="aspect-[21/9] overflow-hidden rounded-3xl shadow-2xl shadow-primary/10">
                <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                />
            </div>
        </div>
      </div>

      {/* Content Body with Sidebar */}
      <div className="container mx-auto px-4 pb-24 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16">
            <article className="lg:col-span-8">
                <div className="prose prose-lg prose-primary max-w-none text-gray-700 leading-relaxed">
                    <p className="text-xl font-medium leading-relaxed italic text-gray-500 border-l-4 border-accent pl-6 mb-12">
                        {post.excerpt}
                    </p>
                    <div 
                      className="tiptap-content"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>

            {/* Sticky Sidebar */}
            <aside className="lg:col-span-4 space-y-12">
                <div className="sticky top-24 space-y-12">
                    <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-8 space-y-6">
                        <h4 className="text-xl font-bold flex items-center gap-2">
                           <span className="h-8 w-1 bg-primary rounded-full" />
                           Konten Terkait
                        </h4>
                        <div className="space-y-6">
                           {[1, 2, 3].map(i => (
                               <div key={i} className="group cursor-pointer">
                                   <p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Berita</p>
                                   <h5 className="font-bold text-ink group-hover:text-primary transition-colors line-clamp-2">Aksi Kolektif Mahasiswa Lumajang...</h5>
                               </div>
                           ))}
                        </div>
                    </div>

                    <div className="rounded-2xl bg-primary p-8 text-white space-y-4">
                        <h4 className="text-xl font-bold">Gabung Sekarang!</h4>
                        <p className="text-gray-300 text-sm">Jadilah bagian dari perubahan besar. Daftar sebagai kader PK PMII ITB WIGA.</p>
                        <Link to="/daftar">
                            <button className="w-full bg-accent text-primary font-bold py-3 rounded-xl hover:bg-accent/90 transition-all">
                                Daftar Kader
                            </button>
                        </Link>
                    </div>
                </div>
            </aside>
        </div>
      </div>
    </div>
  );
}
