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
  Award, Zap, CreditCard, ArrowRight, Quote, Lock,
} from 'lucide-react';
import { VerifiedBadge, isTutorVerified } from '@/components/VerifiedBadge';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

/* ─── Photo Slideshow ───────────────────────────────────── */
function ProfilePhotoSlider({ photos, name }: { photos: { id: string; photo_url: string }[]; name: string }) {
  const [idx, setIdx] = useState(0);
  const touchStart = useRef<number | null>(null);

  if (photos.length === 0) return null;

  const prev = () => setIdx(i => (i - 1 + photos.length) % photos.length);
  const next = () => setIdx(i => (i + 1) % photos.length);

  return (
    <div
      className="relative aspect-square w-full overflow-hidden rounded-2xl bg-muted"
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
        className="h-full w-full object-cover transition-opacity duration-300"
      />

      {photos.length > 1 && (
        <>
          <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 backdrop-blur-sm transition hover:bg-background">
            <ChevronLeft className="h-4 w-4 text-foreground" />
          </button>
          <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/80 p-1.5 backdrop-blur-sm transition hover:bg-background">
            <ChevronRight className="h-4 w-4 text-foreground" />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {photos.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)} className={cn(
                'h-1.5 rounded-full transition-all',
                i === idx ? 'w-5 bg-primary' : 'w-1.5 bg-background/60',
              )} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Availability Grid ─────────────────────────────────── */
function AvailabilityGrid({ availability }: { availability: any }) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const slots = ['Morning', 'Afternoon', 'Evening'];

  // Parse availability JSON into a lookup
  const avail = Array.isArray(availability) ? availability : [];
  const lookup = new Set<string>();
  avail.forEach((entry: any) => {
    if (entry?.day && entry?.slots) {
      (entry.slots as string[]).forEach(s => lookup.add(`${entry.day}-${s}`));
    }
  });

  if (lookup.size === 0) return <p className="text-sm text-muted-foreground">Availability not yet set.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            <th className="pb-2 pr-3 text-left text-xs font-medium text-muted-foreground" />
            {days.map(d => <th key={d} className="pb-2 px-2 text-center text-xs font-medium text-muted-foreground">{d}</th>)}
          </tr>
        </thead>
        <tbody>
          {slots.map(slot => (
            <tr key={slot}>
              <td className="py-1.5 pr-3 text-xs text-muted-foreground">{slot}</td>
              {days.map(day => (
                <td key={day} className="px-2 py-1.5 text-center">
                  <div className={cn(
                    'mx-auto h-6 w-6 rounded-md transition',
                    lookup.has(`${day}-${slot}`) ? 'bg-primary/20 border border-primary/40' : 'bg-muted',
                  )} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ─── Section Wrapper ───────────────────────────────────── */
function Section({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: 'easeOut' }}
      className={cn('rounded-2xl border bg-card p-6 shadow-[var(--shadow-card)]', className)}
    >
      {children}
    </motion.div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: React.ElementType; children: React.ReactNode }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-bold text-foreground">
      <Icon className="h-5 w-5 text-primary" />
      {children}
    </h2>
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
      if (error) throw error;
      return data;
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
        <div className="flex items-center justify-center py-32"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">

          {/* ── LEFT COLUMN ── */}
          <div className="space-y-6">
            {/* Photo */}
            <Section delay={0}>
              {tutorPhotos.length > 0 ? (
                <ProfilePhotoSlider photos={tutorPhotos} name={tutor.name} />
              ) : (
                <div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-primary font-display text-5xl font-bold text-primary-foreground">
                  {initials}
                </div>
              )}
            </Section>

            {/* Quick Stats */}
            <Section delay={0.1} className="space-y-4">
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Responds fast</p>
                  <p className="text-xs text-muted-foreground">Usually within 4 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{tutor.review_count || 0} sessions completed</p>
                  <p className="text-xs text-muted-foreground">Active on Campus Connect</p>
                </div>
              </div>
              {verified && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
                    <ShieldCheck className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">ID Verified</p>
                    <p className="text-xs text-muted-foreground">Identity confirmed by admin</p>
                  </div>
                </div>
              )}
            </Section>

            {/* Pricing & Policies */}
            <Section delay={0.15}>
              <SectionTitle icon={CreditCard}>Pricing & Policies</SectionTitle>
              {tutor.hourly_rate ? (
                <div className="mb-4 flex items-baseline gap-1">
                  <span className="font-display text-3xl font-bold text-foreground">R{tutor.hourly_rate}</span>
                  <span className="text-sm text-muted-foreground">/ hour</span>
                </div>
              ) : (
                <p className="mb-4 text-sm text-muted-foreground">Contact tutor for pricing</p>
              )}
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2"><Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Payments are securely handled by Campus Connect</p>
                <p className="flex items-start gap-2"><Clock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />Free cancellation up to 24 hours before session</p>
              </div>
            </Section>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="space-y-6">

            {/* Hero Card */}
            <Section delay={0.05} className="relative overflow-hidden">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-bl-[80px] bg-primary/5" />
              <div className="relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h1 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                      {tutor.name}
                      {verified && <span className="ml-2 inline-block align-middle"><VerifiedBadge size="lg" showLabel /></span>}
                    </h1>
                    {tutor.university && (
                      <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                        <GraduationCap className="h-4 w-4" />{tutor.university}
                        {tutor.year_of_study && tutor.year_of_study !== 'N/A' && ` · ${tutor.year_of_study}`}
                      </p>
                    )}
                    <div className="mt-3 flex items-center gap-3">
                      <RatingStars rating={tutor.rating || 0} size="md" />
                      <span className="text-sm text-muted-foreground">({tutor.review_count || 0} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Button size="lg" onClick={scrollToSessions} className="gap-2 rounded-xl font-semibold shadow-[var(--shadow-elevated)]">
                    <Calendar className="h-4 w-4" /> Book Session
                  </Button>
                  <Button size="lg" variant="outline" className="gap-2 rounded-xl">
                    <MessageCircle className="h-4 w-4" /> Message Tutor
                  </Button>
                </div>
              </div>
            </Section>

            {/* Featured Review */}
            <Section delay={0.1}>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent/20">
                  <Quote className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm italic text-foreground leading-relaxed">
                    "Absolutely fantastic tutor! Explains concepts clearly and makes difficult topics feel approachable. My marks improved significantly after just a few sessions."
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">— Student Review · 12 lessons taken</p>
                </div>
              </div>
            </Section>

            {/* About */}
            <Section delay={0.15}>
              <SectionTitle icon={BookOpen}>About {tutor.name.split(' ')[0]}</SectionTitle>
              {tutor.bio ? (
                <p className="text-sm leading-relaxed text-muted-foreground">{tutor.bio}</p>
              ) : (
                <p className="text-sm text-muted-foreground">This tutor hasn't added a bio yet.</p>
              )}
              {tutor.teaching_style && (
                <div className="mt-4 rounded-xl bg-muted/50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Teaching Style</p>
                  <p className="text-sm text-foreground">{tutor.teaching_style}</p>
                </div>
              )}
            </Section>

            {/* Subjects */}
            {tutor.subjects && tutor.subjects.length > 0 && (
              <Section delay={0.2}>
                <SectionTitle icon={BookOpen}>Subjects Offered</SectionTitle>
                <div className="flex flex-wrap gap-2">
                  {tutor.subjects.map((s: string) => (
                    <Badge key={s} variant="secondary" className="rounded-lg px-3 py-1.5 text-sm font-medium">
                      {s}
                    </Badge>
                  ))}
                </div>
              </Section>
            )}

            {/* Education & Credentials */}
            <Section delay={0.25}>
              <SectionTitle icon={GraduationCap}>Education & Credentials</SectionTitle>
              <div className="space-y-3">
                {tutor.university && (
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                      <GraduationCap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{tutor.university}</p>
                      {tutor.year_of_study && tutor.year_of_study !== 'N/A' && (
                        <p className="text-xs text-muted-foreground">{tutor.year_of_study}</p>
                      )}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {verified && (
                    <Badge className="gap-1 rounded-lg bg-success/10 text-success border-success/20 hover:bg-success/20">
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                  )}
                  {(tutor.review_count || 0) >= 10 && (
                    <Badge className="gap-1 rounded-lg bg-accent/10 text-accent border-accent/20 hover:bg-accent/20">
                      <Award className="h-3 w-3" /> Top Tutor
                    </Badge>
                  )}
                </div>
              </div>
            </Section>

            {/* Availability */}
            <Section delay={0.3}>
              <SectionTitle icon={Calendar}>Availability</SectionTitle>
              <AvailabilityGrid availability={tutor.availability} />
            </Section>

            {/* Sessions */}
            <div id="sessions-section">
              <Section delay={0.35}>
                <SectionTitle icon={Calendar}>Available Sessions</SectionTitle>
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
                          <h3 className="mt-2 font-display text-sm font-bold text-foreground">{session.module?.name || session.subject}</h3>
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
              </Section>
            </div>

            {/* Reviews Section */}
            <Section delay={0.4}>
              <SectionTitle icon={Star}>Student Reviews</SectionTitle>
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
            </Section>

            {/* Final CTA */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="rounded-2xl bg-[var(--gradient-hero)] p-8 text-center"
              style={{ background: 'var(--gradient-hero)' }}
            >
              <h2 className="font-display text-xl font-bold text-primary-foreground">
                Struggling with a module?
              </h2>
              <p className="mt-2 text-sm text-primary-foreground/80">
                Book a session with {tutor.name.split(' ')[0]} and start improving your grades today.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Button size="lg" variant="secondary" onClick={scrollToSessions} className="gap-2 rounded-xl font-semibold">
                  Book Session <ArrowRight className="h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate('/browse')} className="gap-2 rounded-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                  Find a Tutor
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
