import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ScrollAnimation, useStaggeredAnimation } from '@/hooks/useScrollAnimation';
import { Star, Quote, MessageSquareHeart } from 'lucide-react';

interface Review {
  rating: number;
  comment: string;
  created_at: string;
  first_name: string;
  city: string;
}

export function Testimonials() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Fetch top reviews
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating, comment, created_at, service_request_id')
        .gte('rating', 4)
        .not('comment', 'is', null)
        .order('rating', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      if (!reviewsData || reviewsData.length === 0) {
        setIsLoading(false);
        return;
      }

      // Fetch corresponding service requests for names/cities
      const ids = reviewsData.map(r => r.service_request_id);
      const { data: srData } = await supabase
        .from('service_requests')
        .select('id, first_name, city')
        .in('id', ids);

      const srMap = new Map((srData || []).map(sr => [sr.id, sr]));

      const mapped: Review[] = reviewsData.map((r) => {
        const sr = srMap.get(r.service_request_id);
        return {
          rating: r.rating,
          comment: r.comment!,
          created_at: r.created_at,
          first_name: sr?.first_name || 'Client',
          city: sr?.city || '',
        };
      });
      setReviews(mapped);
      setIsLoading(false);
    };
    load();
  }, []);

  const [ref, visible, getStyle] = useStaggeredAnimation<HTMLDivElement>(reviews.length, 120);

  // Fallback: if animation hasn't triggered after 1s, force visibility
  const [forceVisible, setForceVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    if (reviews.length > 0 && !visible) {
      timerRef.current = setTimeout(() => setForceVisible(true), 1000);
    }
    if (visible) {
      setForceVisible(false);
      if (timerRef.current) clearTimeout(timerRef.current);
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [reviews.length, visible]);

  // Don't render section if no reviews and done loading
  if (!isLoading && reviews.length === 0) return null;
  if (isLoading) return null;

  return (
    <section id="avis" className="section-padding bg-secondary/30">
      <div className="container-narrow mx-auto">
        <ScrollAnimation animation="fade-up" className="text-center mb-12">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <MessageSquareHeart className="inline h-4 w-4 mr-1.5 -mt-0.5" />
            Avis clients
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ce que nos clients disent de nous
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Découvrez les témoignages de nos clients satisfaits
          </p>
        </ScrollAnimation>

        <div ref={ref} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review, i) => (
            <div
              key={i}
              style={forceVisible ? { opacity: 1, transform: 'translateY(0)', transition: 'opacity 500ms, transform 500ms' } : getStyle(i)}
              className="bg-card rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group"
            >
              {/* Decorative quote */}
              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/10 group-hover:text-primary/20 transition-colors" />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4.5 w-4.5 ${
                      star <= review.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/20'
                    }`}
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-4">
                « {review.comment} »
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-3 border-t border-border/50">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                  {review.first_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{review.first_name}</p>
                  {review.city && (
                    <p className="text-xs text-muted-foreground">{review.city}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
