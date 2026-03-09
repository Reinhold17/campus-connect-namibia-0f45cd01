import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Search, TrendingUp, ShieldCheck, Star, Lock, GraduationCap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

const trendingSubjects = [
  'Mathematics', 'Accounting', 'Physics', 'Computer Science', 'Economics', 'Statistics',
];

const steps = [
  {
    number: '01',
    title: 'Search for a tutor',
    description: 'Type your subject or module and discover tutors who can help.',
  },
  {
    number: '02',
    title: 'Compare & choose',
    description: 'View verified profiles, ratings, and availability to find your fit.',
  },
  {
    number: '03',
    title: 'Book & start learning',
    description: 'Pick a session that works for you and start improving your grades.',
  },
];

const trustItems = [
  { icon: ShieldCheck, title: 'Verified Tutors', description: 'Every tutor is ID-verified and vetted before they can teach on the platform.' },
  { icon: Star, title: 'Student Ratings', description: 'Honest reviews from real students help you pick tutors who deliver results.' },
  { icon: Lock, title: 'Secure Bookings', description: 'Your sessions and payments are protected with transparent, upfront pricing.' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' as const },
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
      <section className="relative bg-muted py-20 lg:py-32">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-8">
              <GraduationCap className="h-4 w-4 text-accent" />
              Namibia's student tutoring platform
            </div>

            <h1 className="font-display text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Find the Right Tutor for Your University Modules
            </h1>

            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
              Browse verified student tutors and book sessions in the subjects you need help with.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button
                size="lg"
                className="h-12 px-8 text-base bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow"
                onClick={() => navigate('/browse')}
              >
                Find a Tutor
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-6 text-base border-border text-foreground hover:bg-card"
                onClick={() => navigate('/become-tutor')}
              >
                Become a Tutor
              </Button>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-12 flex w-full max-w-xl mx-auto gap-0">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search subjects — e.g. Calculus, Accounting, Physics…"
                  className="h-14 pl-12 rounded-r-none border-r-0 bg-card text-foreground text-base shadow-card placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <Button
                type="submit"
                className="h-14 rounded-l-none px-6 bg-primary text-primary-foreground hover:bg-primary/90 shadow-card"
              >
                Search
              </Button>
            </form>

            {/* Trending */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-sm">
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <TrendingUp className="h-4 w-4 text-accent" /> Trending:
              </span>
              {trendingSubjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => navigate(`/browse?q=${encodeURIComponent(subject)}`)}
                  className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
                >
                  {subject}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">How It Works</h2>
            <p className="mt-3 text-muted-foreground">Three simple steps to better grades</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {steps.map((step, i) => (
              <motion.div
                key={step.number}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
                  <span className="font-display text-2xl font-extrabold text-accent">{step.number}</span>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust Section ── */}
      <section className="bg-muted/50 py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">Why Students Trust Us</h2>
            <p className="mt-3 text-muted-foreground">Built for Namibian university students</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 max-w-4xl mx-auto">
            {trustItems.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="rounded-xl border bg-card p-8 text-center shadow-card"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-accent/10">
                  <item.icon className="h-6 w-6 text-accent" />
                </div>
                <h3 className="font-display text-lg font-bold text-card-foreground">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="bg-hero-gradient py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
              Ready to Improve Your Grades?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/70">
              Join students across Namibia who are finding the right tutors and acing their modules.
            </p>
            <Button
              size="lg"
              className="mt-8 h-12 px-8 bg-gold-gradient font-semibold text-accent-foreground shadow-glow hover:opacity-90"
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
