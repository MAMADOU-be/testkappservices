import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, Loader2, CheckCircle } from 'lucide-react';

interface ReviewFormProps {
  serviceRequestId: string;
  employeeId: string | null;
  onReviewSubmitted?: () => void;
}

export function ReviewForm({ serviceRequestId, employeeId, onReviewSubmitted }: ReviewFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState<{ rating: number; comment: string | null } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkExisting = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('reviews')
        .select('rating, comment')
        .eq('service_request_id', serviceRequestId)
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) setExistingReview(data);
      setIsLoading(false);
    };
    checkExisting();
  }, [serviceRequestId, user]);

  const handleSubmit = async () => {
    if (!user || rating === 0) return;
    setIsSubmitting(true);

    const { error } = await supabase.from('reviews').insert({
      service_request_id: serviceRequestId,
      user_id: user.id,
      employee_id: employeeId,
      rating,
      comment: comment.trim() || null,
    });

    if (error) {
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'envoyer l'avis." });
    } else {
      toast({ title: '⭐ Merci !', description: 'Votre avis a été enregistré.' });
      setExistingReview({ rating, comment: comment.trim() || null });
      onReviewSubmitted?.();
    }
    setIsSubmitting(false);
  };

  if (isLoading) return null;

  if (existingReview) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <CheckCircle className="h-3.5 w-3.5 text-green-600" />
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-3.5 w-3.5 ${star <= existingReview.rating ? 'fill-amber-400 text-amber-400' : 'text-muted'}`}
            />
          ))}
        </div>
        {existingReview.comment && (
          <span className="text-xs text-muted-foreground italic truncate max-w-[200px]">
            « {existingReview.comment} »
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 space-y-2">
      <p className="text-xs font-medium text-foreground">Notez cette prestation :</p>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            onClick={() => setRating(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-5 w-5 transition-colors ${
                star <= (hoveredRating || rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-muted-foreground/40'
              }`}
            />
          </button>
        ))}
        {rating > 0 && (
          <span className="text-xs text-muted-foreground ml-1">
            {rating === 1 ? 'Mauvais' : rating === 2 ? 'Moyen' : rating === 3 ? 'Bien' : rating === 4 ? 'Très bien' : 'Excellent'}
          </span>
        )}
      </div>
      <Textarea
        placeholder="Un commentaire ? (facultatif)"
        value={comment}
        onChange={(e) => setComment(e.target.value.slice(0, 500))}
        rows={2}
        className="text-sm resize-none"
      />
      <Button
        size="sm"
        onClick={handleSubmit}
        disabled={rating === 0 || isSubmitting}
        className="w-full"
      >
        {isSubmitting ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
        ) : (
          <Send className="h-3.5 w-3.5 mr-1.5" />
        )}
        Envoyer mon avis
      </Button>
    </div>
  );
}
