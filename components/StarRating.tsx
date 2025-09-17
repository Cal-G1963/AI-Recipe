
import React, { useState } from 'react';
import { StarIcon } from './icons/StarIcon';

interface StarRatingProps {
  rating: number;
  onRate: (rating: number) => void;
  t: (key: string) => string;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, onRate, t }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const getAriaLabel = (star: number) => {
    const key = star > 1 ? 'rateStarsLabel' : 'rateStarLabel';
    return t(key).replace('{star}', String(star));
  }

  return (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHoverRating(star)}
          onMouseLeave={() => setHoverRating(0)}
          className="p-1 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-400"
          aria-label={getAriaLabel(star)}
        >
          <StarIcon
            className={`w-6 h-6 transition-colors duration-200 ${
              (hoverRating || rating) >= star
                ? 'text-amber-500'
                : 'text-gray-300'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

export default StarRating;
