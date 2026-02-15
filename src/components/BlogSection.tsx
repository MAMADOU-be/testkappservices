import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Newspaper, Calendar, ArrowRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_image_url: string | null;
  published_at: string | null;
  created_at: string;
}

export function BlogSection() {
  const { t } = useLanguage();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ref, isVisible] = useScrollAnimation<HTMLElement>();

  useEffect(() => {
    const loadPosts = async () => {
      const { data } = await supabase
        .from('blog_posts')
        .select('id, title, excerpt, content, cover_image_url, published_at, created_at')
        .eq('is_published', true)
        .order('published_at', { ascending: false })
        .limit(6);
      setPosts((data || []) as BlogPost[]);
      setIsLoading(false);
    };
    loadPosts();
  }, []);

  if (isLoading || posts.length === 0) return null;

  return (
    <section id="blog" className="py-20 bg-muted/30" ref={ref as React.RefObject<HTMLElement>}>
      <div className={`container mx-auto px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 px-4 py-1.5 text-sm font-medium border-primary/30 text-primary">
            <Newspaper className="w-4 h-4 mr-2" />
            {t.blog.badge}
          </Badge>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t.blog.title}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            {t.blog.description}
          </p>
        </div>

        {/* Posts Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {posts.map((post, index) => (
            <Card
              key={post.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => setSelectedPost(post)}
            >
              {post.cover_image_url && (
                <div className="aspect-video overflow-hidden">
                  <img
                    src={post.cover_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
              )}
              <CardContent className={post.cover_image_url ? 'p-5' : 'p-6'}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                  <Calendar className="h-3 w-3" />
                  {format(new Date(post.published_at || post.created_at), 'dd MMMM yyyy', { locale: fr })}
                </div>
                <h3 className="font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                  {post.title}
                </h3>
                {post.excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                    {post.excerpt}
                  </p>
                )}
                <span className="text-sm text-primary font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                  {t.blog.readMore}
                  <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Full Article Dialog */}
      <Dialog open={!!selectedPost} onOpenChange={(open) => { if (!open) setSelectedPost(null); }}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl leading-tight pr-6">{selectedPost?.title}</DialogTitle>
            {selectedPost && (
              <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                {format(new Date(selectedPost.published_at || selectedPost.created_at), 'dd MMMM yyyy', { locale: fr })}
              </p>
            )}
          </DialogHeader>
          {selectedPost?.cover_image_url && (
            <img
              src={selectedPost.cover_image_url}
              alt={selectedPost.title}
              className="w-full rounded-lg object-cover max-h-72"
            />
          )}
          <div className="prose prose-sm max-w-none text-foreground">
            {selectedPost?.content.split('\n').map((paragraph, i) => (
              paragraph.trim() ? <p key={i} className="text-muted-foreground leading-relaxed">{paragraph}</p> : <br key={i} />
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}
