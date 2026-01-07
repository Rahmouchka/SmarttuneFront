import { Star } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface RatingStarsProps {
  userId: number;
  chansonId: number;
  initialRating?: number; // La note actuelle de l'utilisateur (0 à 5)
  readonly?: boolean; // Si true, juste affichage (ex: stats globales)
  size?: 'sm' | 'md' | 'lg';
  onRatingChange?: (newRating: number) => void;
}

export function RatingStars({
  userId,
  chansonId,
  initialRating = 0,
  readonly = false,
  size = 'md',
  onRatingChange,
}: RatingStarsProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const starSize = size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';

  useEffect(() => {
    setRating(initialRating);
  }, [initialRating]);

  const handleClick = async (value: number) => {
    if (readonly || loading) return;

    setLoading(true);
    try {
      if (rating === value) {
        // Clique sur la même étoile → supprimer la note
        await api.deleteRating(userId, chansonId);
        setRating(0);
        onRatingChange?.(0);
        toast({ title: 'Note supprimée' });
      } else {
        await api.rateChanson(userId, chansonId, value);
        setRating(value);
        onRatingChange?.(value);
        toast({ title: `Noté ${value}/5 ⭐` });
      }
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const currentRating = hoverRating || rating;

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly || loading}
          onClick={() => handleClick(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer'} transition-all ${
            loading ? 'opacity-50' : ''
          }`}
        >
          <Star
            className={`${starSize} transition-colors ${
              star <= currentRating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-muted-foreground/30'
            }`}
          />
        </button>
      ))}
      {!readonly && rating > 0 && (
        <span className="text-sm text-muted-foreground ml-2">{rating}/5</span>
      )}
    </div>
  );
}