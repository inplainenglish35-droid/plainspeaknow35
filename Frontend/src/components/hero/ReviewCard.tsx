import { Quote, Star } from "lucide-react";

type ReviewCardProps = {
  quote: string;
  name: string;
  description?: string;
  ratingLabel?: string;
};

export function ReviewCard({
  quote,
  name,
  description,
  ratingLabel = "5 out of 5 stars",
}: ReviewCardProps) {
  return (
    <article className="relative flex h-full flex-col rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-[0_16px_45px_-28px_rgba(15,23,42,0.25)]">
      {/* Decorative quote icon */}
      <div
        className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF7F3] text-[#4F7C6B]"
        aria-hidden="true"
      >
        <Quote size={19} strokeWidth={2} />
      </div>

      {/* Rating */}
      <div
        className="mb-4 flex items-center gap-1 text-amber-500"
        aria-label={ratingLabel}
      >
        {Array.from({ length: 5 }).map((_, index) => (
          <Star
            key={index}
            size={16}
            fill="currentColor"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        ))}
      </div>

      {/* Review */}
      <blockquote className="flex-1 text-[15px] leading-7 text-slate-700">
        “{quote}”
      </blockquote>

      {/* Reviewer */}
      <footer className="mt-5 border-t border-slate-100 pt-4">
        <p className="text-sm font-semibold text-slate-900">
          {name}
        </p>

        {description && (
          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        )}
      </footer>
    </article>
  );
}

export default ReviewCard;