import { ShieldCheck } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface VerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function VerifiedBadge({ size = 'md', showLabel = false }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const badge = (
    <span className="inline-flex items-center gap-1 text-success">
      <ShieldCheck className={sizeClasses[size]} />
      {showLabel && <span className="text-xs font-semibold">Verified</span>}
    </span>
  );

  if (showLabel) return badge;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{badge}</TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">Verified Tutor — ID & Student Card verified by admin</p>
      </TooltipContent>
    </Tooltip>
  );
}

/** Check if a tutor profile qualifies as verified */
export function isTutorVerified(profile: {
  status: string;
  student_id_url?: string | null;
  government_id_url?: string | null;
}): boolean {
  return (
    profile.status === 'approved' &&
    !!profile.student_id_url &&
    !!profile.government_id_url
  );
}
