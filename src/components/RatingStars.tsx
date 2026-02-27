import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  size?: 'sm' | 'md';
  showValue?: boolean;
}

export function RatingStars({ rating, size = 'sm', showValue = true }: RatingStarsProps) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= Math.round(rating)
                ? 'fill-accent text-accent'
                : 'fill-muted text-muted'
            }`}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-sm font-medium text-muted-foreground">{rating.toFixed(1)}</span>
      )}
    </div>
  );
}
