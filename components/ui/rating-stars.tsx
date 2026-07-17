import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showValue?: boolean;
}

function RatingStars({ rating, maxRating = 5, size = "md", className, showValue = false }: RatingStarsProps) {
  const sizeClasses = { sm: "h-3 w-3", md: "h-4 w-4", lg: "h-5 w-5" };

  return (
    <div className={cn("inline-flex items-center gap-0.5", className)} aria-label={`Rating: ${rating} out of ${maxRating}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const filled = i < Math.floor(rating);
        const halfFilled = !filled && i < rating;

        return (
          <Star
            key={i}
            className={cn(
              sizeClasses[size],
              filled && "fill-accent text-accent",
              halfFilled && "fill-accent/50 text-accent",
              !filled && !halfFilled && "text-muted-foreground/30",
            )}
          />
        );
      })}
      {showValue && <span className="ml-1 text-sm text-muted-foreground">{rating.toFixed(1)}</span>}
    </div>
  );
}

export { RatingStars };
