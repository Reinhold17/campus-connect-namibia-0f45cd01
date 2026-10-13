import { useParams, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { RatingStars } from '@/components/RatingStars';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GraduationCap, BookOpen, Calendar, Clock, Users, Loader2,
  ShieldCheck, Star, MessageCircle, ChevronLeft, ChevronRight,
  Award, Zap, CreditCard, ArrowRight, Lock, ChevronDown, ChevronUp,
} from 'lucide-react';
import { isTutorVerified } from '@/components/VerifiedBadge';
import { mockTutors } from '@/lib/mock-data';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

/* ─── Circular Photo Slideshow ──────────────────────────── */
function CirclePhotoSlider({ photos, name, initials }: {
  photos: { id: string; photo_url: string }[];
  name: string;
  initials: string;
}) {
  const [idx, setIdx] = useState(0);
  const touchStart = useRef<number | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex h-40 w-40 items-center justify-center rounded-full bg-primary font-display text-4xl font-bold text-primary-foreground mx-auto">
        {initials}
      </div>
    );
  }

  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx(i => (i + 1) % photos.length);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative h-40 w-40 overflow-hidden rounded-full border-4 border-border shadow-[var(--shadow-elevated)]"
        onTouchStart={e => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={e => {
          if (touchStart.current === null) return;
          const diff = e.changedTouches[0].clientX - touchStart.current;
          if (Math.abs(diff) > 40) diff > 0 ? prev() : next();
          touchStart.current = null;
        }}
      >
        <img
          src={photos[idx].photo_url}
          alt={`${name} photo ${idx + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
      {photos.length > 1 && (
        <div className="flex items-center gap-2">
          <button onClick={prev} className="rounded-full p-1 text-muted-foreground transition hover:text-foreground hover:bg-muted">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                className={cn(
                  'h-2 w-2 rounded-full transition-all',
                  i === idx ? 'bg-foreground scale-125' : 'bg-muted-foreground/40 hover:bg-muted-foreground/60',
                )}
              />
            ))}
          </div>
          <button onClick={next} className="rounded-full p-1 text-muted-foreground transition hover:text-foreground hover:bg-muted">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ─── Expandable Text ───────────────────────────────────── */
function ExpandableText({ text, maxLength = 200 }: { text: string; maxLength?: number }) {
  const [expanded, setExpanded] = useState(false);
  if (text.length <= maxLength) return <p className="text-sm leading-relaxed text-foreground">{text}</p>;
  return (
    <div>
      <p className="text-sm leading-relaxed text-foreground">
        {expanded ? text : `${text.slice(0, maxLength)}...`}
      </p>
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-1 inline-flex items-center gap-0.5 text-sm font-medium text-primary hover:underline"
      >
        {expanded ? <>Show less <ChevronUp className="h-3 w-3" /></> : <>Read more <ChevronDown className="h-3 w-3" /></>}
      </button>
    </div>
  );
}

/* ─── About Row ─────────────────────────────────────────── */
function AboutRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-4 py-4 border-b border-border last:border-0">
      <span className="text-sm font-medium text-muted-foreground">{label}</span>
      <div className="text-sm text-foreground">{children}</div>
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function TutorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, role } = useAuth();

  const { data: tutor, isLoading } = useQuery({
    queryKey: ['tutor-profile', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('profiles').select('*').eq('user_id', id!).single();
      if (!error && data) return data;
      // Fall back to mock tutors while the platform has no real tutors yet.
      const mock = mockTutors.find(m => m.id === id);
      if (mock) {
        return {
          user_id: mock.id,
          name: mock.name,
          university: mock.university,
          year_of_study: mock.year_of_study,
          subjects: mock.subjects,
          bio: mock.bio,
          teaching_style: mock.teaching_style,
          rating: mock.rating,
          review_count: mock.reviewCount,
          hourly_rate: mock.hourly_rate,
          status: mock.status,
          student_id_url: mock.student_id_url,
          government_id_url: mock.government_id_url,
        };
      }
      throw error ?? new Error('Tutor not found');
    },
    enabled: !!id,
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ['tutor-sessions', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions')
        .select('*, module:modules!sessions_module_id_fkey ( name )')
        .eq('tutor_id', id!)
        .eq('status', 'active')
        .gte('date', new Date().toISOString().split('T')[0]);
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: tutorModules = [] } = useQuery({
    queryKey: ['tutor-profile-modules', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutor_modules')
        .select('modules!tutor_modules_module_id_fkey ( name )')
        .eq('user_id', id!);
      if (error) throw error;
      return (data || []).map((item: any) => item.modules?.name).filter(Boolean) as string[];
    },
    enabled: !!id,
  });

  const { data: bookingCounts = {} } = useQuery({
    queryKey: ['session-booking-counts', id],
    queryFn: async () => {
      if (sessions.length === 0) return {};
      const { data, error } = await supabase
        .from('bookings')
        .select('session_id')
        .in('session_id', sessions.map(s => s.id))
        .neq('status', 'cancelled');
      if (error) throw error;
      const counts: Record<string, number> = {};
      data.forEach(b => { counts[b.session_id] = (counts[b.session_id] || 0) + 1; });
      return counts;
    },
    enabled: sessions.length > 0,
  });

  const { data: tutorPhotos = [] } = useQuery({
    queryKey: ['tutor-photos-public', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutor_photos' as any)
        .select('*')
        .eq('user_id', id!)
        .order('display_order');
      if (error) throw error;
      return data as any[];
    },
    enabled: !!id,
  });

  const handleBook = (sessionId: string) => {
    if (!isAuthenticated) { toast.info('Please sign up or log in to book a session'); navigate('/signup'); return; }
    if (role !== 'student') { toast.error('Only students can book sessions'); return; }
    navigate(`/payment/${sessionId}`);
  };

  const scrollToSessions = () => {
    document.getElementById('sessions-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-muted-foreground">Tutor not found.</p>
          <Button variant="outline" onClick={() => navigate('/browse')}>Browse Tutors</Button>
        </div>
      </div>
    );
  }

  const initials = tutor.name.split(' ').map((n: string) => n[0]).join('');
  const verified = isTutorVerified(tutor);
  const firstName = tutor.name.split(' ')[0];
  const lastInitial = tutor.name.split(' ').length > 1 ? ` ${tutor.name.split(' ').slice(-1)[0][0]}.` : '';
  const subjectNames = Array.from(new Set([
    ...(tutor.subjects || []),
    ...tutorModules,
    ...sessions.map((session: any) => session.module?.name || session.subject).filter(Boolean),
  ])).sort();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[340px_1fr]">

          {/* ════════════ LEFT SIDEBAR ════════════ */}
          <div>
            <div className="sticky top-24 space-y-5">
              {/* Photo + Identity Card */}
              <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
                <CirclePhotoSlider photos={tutorPhotos} name={tutor.name} initials={initials} />

                {/* Subjects as tagline */}
                {subjectNames.length > 0 && (
                  <p className="mt-4 text-center text-sm font-medium text-muted-foreground leading-snug">
                    {subjectNames.join(', ')}
                  </p>
                )}

                {/* Name */}
                <h1 className="mt-3 text-center font-display text-xl font-bold text-foreground">
                  {firstName}{lastInitial}
                </h1>

                {/* Rating */}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <RatingStars rating={tutor.rating || 0} size="sm" showValue={false} />
                  <span className="text-sm font-semibold text-foreground">{(tutor.rating || 0).toFixed(1)}</span>
                  <span className="text-sm text-primary font-medium">({tutor.review_count || 0} ratings)</span>
                </div>

                {/* Quick stats */}
                <div className="mt-4 space-y-2">
                  {verified && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-success" />
                      <span>ID Verified Tutor</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Zap className="h-4 w-4 text-accent" />
                    <span>Responds within 4 hours</span>
                  </div>
                  {(tutor.review_count || 0) >= 10 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Award className="h-4 w-4 text-accent" />
                      <span>Top Rated Tutor</span>
                    </div>
                  )}
                </div>

                {/* Divider */}
                <div className="my-5 border-t border-border" />

                {/* Hourly Rate */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Hourly Rate</p>
                  <p className="mt-1 font-display text-2xl font-bold text-foreground">
                    {tutor.hourly_rate ? `R${tutor.hourly_rate}` : 'Contact for pricing'}
                  </p>
                </div>

                {/* CTA */}
                <Button
                  size="lg"
                  className="mt-5 w-full gap-2 rounded-xl font-semibold text-base"
                  onClick={scrollToSessions}
                >
                  <Calendar className="h-4 w-4" />
                  Book {firstName}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="mt-2 w-full gap-2 rounded-xl"
                >
                  <MessageCircle className="h-4 w-4" />
                  Message {firstName}
                </Button>
              </div>
            </div>
          </div>

          {/* ════════════ RIGHT CONTENT ════════════ */}
          <div className="space-y-6">

            {/* Featured Review */}
            <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-muted-foreground">Featured Review:</p>
                <button
                  onClick={() => document.getElementById('reviews-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-sm font-medium text-primary hover:underline"
                >
                  See all reviews
                </button>
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">
                {subjectNames.length > 0
                  ? `Excellent ${subjectNames[0]} Tutor`
                  : `Excellent Tutor on Campus HQ`
                }
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">— Student Review</p>
              <p className="mt-3 text-sm italic leading-relaxed text-muted-foreground">
                "Absolutely fantastic tutor! Explains concepts clearly and makes difficult topics feel approachable.
                Very patient and flexible with scheduling. My marks improved significantly after just a few sessions.
                I would highly recommend {firstName} to anyone looking for help..."
              </p>
              <button className="mt-2 text-sm font-medium text-primary hover:underline">
                Read more
              </button>
            </div>

            {/* About Section */}
            <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="mb-1 font-display text-xl font-bold text-foreground">
                About {firstName}
              </h2>
              <div className="divide-y divide-border">
                <AboutRow label="Bio">
                  {tutor.bio ? (
                    <ExpandableText text={tutor.bio} maxLength={180} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Bio not added yet.</p>
                  )}
                </AboutRow>

                {tutor.teaching_style && (
                  <AboutRow label="Teaching Style">
                    <p>{tutor.teaching_style}</p>
                  </AboutRow>
                )}

                <AboutRow label="Education">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                    <span>
                      {tutor.university || 'Not specified'}
                      {tutor.year_of_study && tutor.year_of_study !== 'N/A' && ` — ${tutor.year_of_study}`}
                    </span>
                  </div>
                </AboutRow>

                {subjectNames.length > 0 && (
                  <AboutRow label="Subjects">
                    <div className="flex flex-wrap gap-1.5">
                      {subjectNames.map((s: string) => (
                        <Badge key={s} variant="secondary" className="rounded-md px-2.5 py-0.5 text-xs font-medium">
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </AboutRow>
                )}
              </div>
            </div>

            {/* Pricing & Policies */}
            <div className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <CreditCard className="h-5 w-5 text-primary" /> Pricing & Policies
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                <div className="flex items-start gap-2.5">
                  <Lock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Payments are securely handled by Campus HQ</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span>Free cancellation up to 24 hours before session</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                  <span>Your first lesson is backed by our satisfaction guarantee</span>
                </div>
              </div>
            </div>

            {/* Available Sessions */}
            <div id="sessions-section" className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <Calendar className="h-5 w-5 text-primary" /> Available Sessions
              </h2>
              {sessions.length === 0 ? (
                <p className="text-sm text-muted-foreground">No upcoming sessions available right now.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {sessions.map(session => {
                    const enrolled = bookingCounts[session.id] || 0;
                    const isFull = session.type === 'group' && enrolled >= session.max_students;
                    return (
                      <div key={session.id} className="rounded-xl border bg-background p-4 transition hover:shadow-[var(--shadow-elevated)]">
                        <div className="flex items-center justify-between">
                          <Badge variant={session.type === 'one-on-one' ? 'default' : 'secondary'} className="rounded-md text-xs">
                            {session.type === 'one-on-one' ? '1-on-1' : 'Group'}
                          </Badge>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Users className="h-3 w-3" />{enrolled}/{session.max_students}
                          </span>
                        </div>
                        <h3 className="mt-2 font-display text-sm font-bold text-foreground">
                          {session.module?.name || session.subject}
                        </h3>
                        <div className="mt-1.5 space-y-0.5 text-xs text-muted-foreground">
                          <p className="flex items-center gap-1"><Calendar className="h-3 w-3" />{session.date}</p>
                          <p className="flex items-center gap-1"><Clock className="h-3 w-3" />{session.time}</p>
                        </div>
                        <Button
                          className="mt-3 w-full rounded-lg"
                          size="sm"
                          disabled={isFull}
                          onClick={() => handleBook(session.id)}
                        >
                          {isFull ? 'Session Full' : isAuthenticated ? 'Book Now' : 'Sign Up to Book'}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Reviews */}
            <div id="reviews-section" className="rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]">
              <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
                <Star className="h-5 w-5 text-accent" /> Student Reviews
              </h2>
              {(tutor.review_count || 0) === 0 ? (
                <p className="text-sm text-muted-foreground">No reviews yet. Be the first to book a session!</p>
              ) : (
                <div className="space-y-4">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="border-b border-border pb-4 last:border-0 last:pb-0">
                      <div className="flex items-center gap-2">
                        <RatingStars rating={5} size="sm" showValue={false} />
                        <span className="text-xs text-muted-foreground">Student</span>
                      </div>
                      <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                        Great tutor, really helped me understand the material better.
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Final CTA */}
            <div
              className="rounded-2xl p-8 text-center"
              style={{ background: 'var(--gradient-hero)' }}
            >
              <h2 className="font-display text-xl font-bold text-primary-foreground">
                Struggling with a module?
              </h2>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Book a session with {firstName} and start improving your grades today.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button size="lg" variant="secondary" onClick={scrollToSessions} className="gap-2 rounded-xl font-semibold">
                  Book Session <ArrowRight className="h-4 w-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/browse')}
                  className="gap-2 rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                >
                  Find a Tutor
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
