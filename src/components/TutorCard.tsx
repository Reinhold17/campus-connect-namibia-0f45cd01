import { Link } from 'react-router-dom';
import { User } from '@/lib/types';
import { RatingStars } from '@/components/RatingStars';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, BookOpen, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { VerifiedBadge, isTutorVerified } from '@/components/VerifiedBadge';

interface TutorCardProps {
  tutor: User & { user_id?: string; student_id_url?: string | null; government_id_url?: string | null };
}

export function TutorCard({ tutor }: TutorCardProps) {
  const initials = tutor.name.split(' ').map(n => n[0]).join('');

  return (
    <div className="group rounded-xl border bg-card p-4 sm:p-5 shadow-card transition-all duration-300 hover:shadow-elevated overflow-hidden">
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-bold text-card-foreground">
            {tutor.name}
            {isTutorVerified({ status: tutor.status, student_id_url: (tutor as any).student_id_url, government_id_url: (tutor as any).government_id_url }) && (
              <span className="ml-1.5 inline-block align-middle"><VerifiedBadge size="sm" /></span>
            )}
          </h3>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
            <GraduationCap className="h-3.5 w-3.5" />
            <span className="truncate">{tutor.university}</span>
          </div>
          <div className="mt-2">
            <RatingStars rating={tutor.rating || 0} />
          </div>
        </div>
      </div>

      {tutor.bio && <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{tutor.bio}</p>}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {tutor.subjects?.map((subject) => (
          <Badge key={subject} variant="secondary" className="text-xs">
            <BookOpen className="mr-1 h-3 w-3" />
            {subject}
          </Badge>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <Badge variant="outline" className="text-xs gap-1">
          <Users className="h-3 w-3" />
          Currently Enrolled
        </Badge>
        <Button size="sm" asChild>
          <Link to={`/tutors/${(tutor as any).user_id || tutor.id}`}>View Profile</Link>
        </Button>
      </div>
    </div>
  );
}
