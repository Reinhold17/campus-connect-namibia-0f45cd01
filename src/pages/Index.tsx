import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import {
  Search, ShieldCheck, Star, Lock, GraduationCap, ArrowRight,
  BookOpen, Calendar, Users, Bell, TrendingUp, CheckCircle2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const trendingSubjects = [
  'Mathematics', 'Accounting', 'Physics', 'Computer Science', 'Economics', 'Statistics',
];

const steps = [
  { number: '01', title: 'Search for a tutor', description: 'Type your subject or module and discover tutors who can help.' },
  { number: '02', title: 'Compare & choose', description: 'View verified profiles, ratings, and availability to find your fit.' },
  { number: '03', title: 'Book & start learning', description: 'Pick a session that works for you and start improving your grades.' },
];

const trustItems = [
  { icon: ShieldCheck, title: 'Verified Tutors', description: 'Every tutor is ID-verified and vetted before they can teach.' },
  { icon: Star, title: 'Student Ratings', description: 'Honest reviews from real students help you pick tutors who deliver.' },
  { icon: Lock, title: 'Secure Bookings', description: 'Your sessions and payments are protected with transparent pricing.' },
];

const portalCards = [
  { icon: BookOpen, label: 'My Modules', value: '6 active', tone: 'bg-primary/10 text-primary' },
  { icon: Calendar, label: 'Upcoming Session', value: 'Calculus · Today 16:00', tone: 'bg-secondary/15 text-secondary-foreground' },
  { icon: TrendingUp, label: 'Average Grade', value: '72% · ▲ 4%', tone: 'bg-success/10 text-success' },
  { icon: Bell, label: 'Announcements', value: '3 new', tone: 'bg-accent/15 text-accent-foreground' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: 'easeOut' as const },
  }),
};

const Index = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/browse?q=${encodeURIComponent(searchQuery.trim())}` : '/browse');
  };

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* ── Hero ── */}
      <section className="relative border-b bg-card">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
            {/* Copy */}
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5 text-primary" />
                Namibia's next-generation student portal
              </div>

              <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Find the right tutor for your <span className="text-primary">university modules</span>.
              </h1>

              <p className="mt-5 max-w-xl text-base text-muted-foreground lg:text-lg">
                Browse verified tutors, manage your sessions, and stay on top of your academic progress — all in one clean, student-centered workspace.
              </p>

              {/* Search */}
              <form onSubmit={handleSearch} className="mt-7 flex w-full max-w-xl gap-2 rounded-2xl border bg-background p-2 shadow-card">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search subjects — Calculus, Accounting, Physics…"
                    className="h-11 border-0 bg-transparent pl-10 text-sm shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                <Button type="submit" className="h-11 rounded-xl px-5 text-sm">
                  Find a Tutor
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </form>

              {/* Trending */}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold uppercase tracking-wide text-muted-foreground">Trending</span>
                {trendingSubjects.map(subject => (
                  <button
                    key={subject}
                    onClick={() => navigate(`/browse?q=${encodeURIComponent(subject)}`)}
                    className="rounded-full border bg-card px-3 py-1 font-medium text-foreground/80 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                  >
                    {subject}
                  </button>
                ))}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Verified tutors only</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Secure session bookings</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-success" /> Built for UNAM students</span>
              </div>
            </motion.div>

            {/* Portal preview */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="relative hidden lg:block"
            >
              <div className="rounded-3xl border bg-gradient-to-b from-card to-muted/40 p-3 shadow-elevated">
                <div className="overflow-hidden rounded-2xl border bg-card">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                    <span className="h-2.5 w-2.5 rounded-full bg-secondary/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
                    <span className="ml-3 text-[11px] font-medium text-muted-foreground">portal.campusconnect.na · Dashboard</span>
                  </div>

                  <div className="grid grid-cols-[140px_1fr] min-h-[380px]">
                    {/* Sidebar */}
                    <aside className="border-r bg-sidebar p-3">
                      <div className="mb-4 flex items-center gap-2 px-1.5">
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                          <GraduationCap className="h-3.5 w-3.5 text-primary-foreground" />
                        </div>
                        <span className="text-xs font-bold text-sidebar-foreground">Campus Connect</span>
                      </div>
                      <nav className="space-y-1">
                        {[
                          { icon: BookOpen, label: 'Dashboard', active: true },
                          { icon: Users, label: 'My Tutors' },
                          { icon: Calendar, label: 'Timetable' },
                          { icon: TrendingUp, label: 'Performance' },
                          { icon: Bell, label: 'Announcements' },
                        ].map(item => (
                          <div
                            key={item.label}
                            className={`flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-[11px] font-medium ${
                              item.active
                                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                                : 'text-sidebar-foreground/70'
                            }`}
                          >
                            <item.icon className="h-3.5 w-3.5" />
                            {item.label}
                          </div>
                        ))}
                      </nav>
                    </aside>

                    {/* Main */}
                    <div className="space-y-3 p-4">
                      <div>
                        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">Welcome back</p>
                        <h3 className="font-display text-base font-bold">Good afternoon, Aishe 👋</h3>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        {portalCards.map(c => (
                          <div key={c.label} className="rounded-xl border bg-card p-3">
                            <div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-lg ${c.tone}`}>
                              <c.icon className="h-3.5 w-3.5" />
                            </div>
                            <p className="text-[10px] text-muted-foreground">{c.label}</p>
                            <p className="text-xs font-semibold text-foreground">{c.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-secondary/10 p-3">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">Next session</p>
                        <p className="mt-1 text-xs font-bold">Calculus II with Aishe H.</p>
                        <p className="text-[10px] text-muted-foreground">Today · 16:00 – 17:30 · Online</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating accent */}
              <div className="absolute -bottom-4 -left-4 hidden h-24 w-24 rounded-2xl bg-secondary/30 blur-2xl xl:block" />
              <div className="absolute -top-4 -right-4 hidden h-24 w-24 rounded-2xl bg-primary/20 blur-2xl xl:block" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">How it works</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              Three simple steps to better grades
            </h2>
            <p className="mt-3 text-muted-foreground">A workflow built around how students actually study.</p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="group rounded-2xl border bg-card p-7 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-elevated"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 font-display text-base font-bold text-primary">
                  {step.number}
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <section className="border-y bg-muted/40 py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Trust & safety</p>
            <h2 className="mt-3 font-display text-3xl font-bold text-foreground md:text-4xl">
              Why Namibian students choose Campus Connect
            </h2>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-3">
            {trustItems.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-2xl border bg-card p-7 shadow-card"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/20">
                  <item.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-5 font-display text-lg font-bold text-card-foreground">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-hero-gradient py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto flex max-w-4xl flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left"
          >
            <div>
              <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                Ready to improve your grades?
              </h2>
              <p className="mt-3 max-w-md text-primary-foreground/80">
                Join students across Namibia finding the right tutors for their modules.
              </p>
            </div>
            <Button
              size="lg"
              className="h-12 shrink-0 bg-secondary px-8 font-semibold text-secondary-foreground shadow-glow hover:bg-secondary/90"
              onClick={() => navigate('/browse')}
            >
              Find a Tutor Now
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
